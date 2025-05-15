import { get5StarProbability } from "./simulation";
import {
  Allocations,
  DEFAULT_PRIORITY,
  Priority,
  PriorityAllocations,
  SimulationResult,
  SimulationResults,
  VersionId,
} from "../types";

import {
  ApiCharacter,
  Banner,
  BannerSimulationResult,
  CharacterId,
  CharacterSimulationResult,
  WishForCharacterResult,
} from "../types";
import {
  IGetCompareValue,
  MaxPriorityQueue,
} from "@datastructures-js/priority-queue";

/**
 * Simulate a single wish
 * @returns "featured" if the featured 5-star was pulled, "standard" if a standard 5-star, or "non-5-star" otherwise
 */
const wish = (
  pity: number,
  guaranteed: boolean
): "featured" | "standard" | "non-5-star" => {
  pity++;
  const prob = get5StarProbability(pity);

  if (Math.random() < prob) {
    // Reset pity after getting a 5-star
    pity = 0;

    // Check if guaranteed
    if (guaranteed) {
      guaranteed = false;
      return "featured";
    } else {
      // 50/50 chance
      if (Math.random() < 0.5) {
        return "featured";
      } else {
        guaranteed = true;
        return "standard";
      }
    }
  }

  return "non-5-star";
};

const wishForBanner = (
  banner: Banner,
  allocations: Allocations,
  currentPity: number,
  isGuaranteed: boolean
): BannerSimulationResult | undefined => {
  const bannerVersion = banner.version;
  const versionAllocation = allocations[bannerVersion as VersionId] || {};

  // Get characters with allocated wishes
  const charactersWithWishes: ApiCharacter[] = banner.characters.filter(
    (char: ApiCharacter) =>
      versionAllocation[char.id] &&
      versionAllocation[char.id]!.wishesAllocated > 0
  );

  // Skip banner if no wishes allocated
  if (charactersWithWishes.length === 0) {
    return;
  }

  // Create a separate result for each character in the banner
  const characterResults: Partial<
    Record<CharacterId, CharacterSimulationResult>
  > = {};

  // For each character that has wishes allocated, simulate separately
  for (const targetChar of charactersWithWishes) {
    const wishesToSpend =
      versionAllocation[targetChar.id]!.wishesAllocated || 0;
    const maxConst = versionAllocation[targetChar.id]!.maxConstellation || 0;
    // Use a new simulator instance with the current pity/guaranteed state
    const charResult = wishForCharacter(
      targetChar.id,
      wishesToSpend,
      maxConst,
      currentPity,
      isGuaranteed
    );

    // Record the results for this character
    characterResults[targetChar.id] = {
      character: targetChar.id,
      obtained: charResult.obtained,
      hasWishesAllocated: true,
      lostFiftyFifty: charResult.lostFiftyFifty,
      wishesUsed: charResult.wishesUsed,
      constellation: charResult.constellation,
    };

    // Update the pity/guaranteed state for the next character or banner
    currentPity = charResult.pity;
    isGuaranteed = charResult.guaranteed;
  }

  // For characters without wishes allocated, add them to results with obtained=false
  for (const char of banner.characters) {
    if (!charactersWithWishes.some((c) => c.id === char.id)) {
      characterResults[char.id] = {
        character: char.id,
        obtained: false,
        hasWishesAllocated: false,
        lostFiftyFifty: false,
        wishesUsed: 0,
        constellation: 0,
      };
    }
  }

  // Calculate total wishes used across all characters
  const totalWishesUsed = Object.values(characterResults).reduce(
    (sum, r) => sum + r.wishesUsed,
    0
  );

  // Create banner simulation result
  const bannerResult: BannerSimulationResult = {
    bannerId: bannerVersion,
    characterResults,
    wishesUsed: totalWishesUsed,
    endPity: currentPity,
    endGuaranteed: isGuaranteed,
  };

  return bannerResult;
};

const wishForCharacter = (
  character: CharacterId,
  maxWishes: number,
  maxConst: number,
  startingPity: number,
  startingGuaranteed: boolean
): WishForCharacterResult => {
  let charPulls = 0;
  let obtained = false;
  let lostFiftyFifty = false;
  let constellationCount = 0;
  let gotStandard5Star = false;
  let gotFeatured5Star = false;
  let pity = startingPity;
  let guaranteed = startingGuaranteed;

  // Simulate pulls for this specific character
  while (charPulls < maxWishes && constellationCount <= maxConst) {
    charPulls++;

    const result = wish(pity, guaranteed);

    if (result === "featured") {
      // Successfully got the featured character
      obtained = true;
      gotFeatured5Star = true;
      constellationCount++;
      pity = 0;
      guaranteed = false;

      // If we've reached the desired constellation, break
      if (constellationCount > maxConst) {
        break;
      }
    } else if (result === "standard") {
      // Got a standard 5-star
      gotStandard5Star = true;
      pity = 0;
      guaranteed = true;
    }
  }

  // We only consider the 50/50 as "lost" if the player got a standard 5* character
  // but didn't get any copies of the featured character. If they got at least one
  // copy of the featured character, we don't consider it a lost 50/50 for display purposes.
  lostFiftyFifty = gotStandard5Star && !gotFeatured5Star;

  return {
    character,
    obtained,
    lostFiftyFifty,
    wishesUsed: charPulls,
    pity,
    guaranteed,
    constellation: constellationCount > 0 ? constellationCount - 1 : 0,
  };
};

// Runs an entire simulation across all banners, keeping track of the pity and guaranteed status as
// they change across banners.
const runSimulationOnce = (
  banners: Banner[],
  allocations: Allocations,
  pity: number,
  guaranteed: boolean
) => {
  // Initialize the simulation results
  const simulationResults: SimulationResult = banners.reduce((acc, banner) => {
    acc[banner.version as VersionId] = {
      bannerId: banner.version,
      characterResults: {},
      wishesUsed: 0,
      endPity: 0,
      endGuaranteed: false,
    };
    return acc;
  }, {} as SimulationResult);

  for (const banner of banners) {
    const bannerResult = wishForBanner(banner, allocations, pity, guaranteed);
    if (bannerResult) {
      simulationResults[banner.version as VersionId] = bannerResult;
    }
  }

  return simulationResults;
};

// Runs a batch of simulations and returns the results.
const runSimulationBatch = (
  banners: Banner[],
  allocations: Allocations,
  pity: number,
  guaranteed: boolean,
  batchSize: number
) => {
  // Run a batch of simulations
  const batchResults: SimulationResult[] = [];
  for (let i = 0; i < batchSize; i++) {
    const results = runSimulationOnce(banners, allocations, pity, guaranteed);
    batchResults.push(results);
  }

  return batchResults;
};

export const finalizeResults = (
  allSimulationResults: SimulationResult[]
): SimulationResults => {
  const bannerResults: Record<VersionId, BannerSimulationResult[]> = {};
  const characterSuccessTotals: Record<
    VersionId,
    Partial<Record<CharacterId, number>>
  > = {};
  const numSimulations = allSimulationResults.length;
  const scenarioCounts: number[] = new Array(numSimulations).fill(0);

  for (let i = 0; i < numSimulations; i++) {
    const simulationResult = allSimulationResults[i];
    for (const bannerId in simulationResult) {
      // Add to banner results
      const bannerVersion = bannerId as VersionId;
      const bannerResult = simulationResult[bannerVersion];
      if (!bannerResults[bannerVersion]) {
        bannerResults[bannerVersion] = [];
      }
      bannerResults[bannerVersion].push(bannerResult);

      // Add to character success totals
      for (const c in bannerResult.characterResults) {
        const characterId = c as CharacterId;
        const characterResult = bannerResult.characterResults[characterId]!;
        if (!characterSuccessTotals[bannerVersion]) {
          characterSuccessTotals[bannerVersion] = {};
        }
        if (!characterSuccessTotals[bannerVersion][characterId]) {
          characterSuccessTotals[bannerVersion][characterId] = 0;
        }
        characterSuccessTotals[bannerVersion][characterId] +=
          characterResult.obtained ? 1 : 0;
      }
    }

    scenarioCounts[i]++;
  }

  // Calculate success rates (divide each number by the number of simulations)
  const characterSuccessRates: Record<
    VersionId,
    Partial<Record<CharacterId, number>>
  > = {};
  for (const bannerVersion in characterSuccessTotals) {
    if (!characterSuccessTotals[bannerVersion as VersionId]) {
      continue;
    }
    for (const characterId in characterSuccessTotals[
      bannerVersion as VersionId
    ]!) {
      if (!characterSuccessRates[bannerVersion as VersionId]) {
        characterSuccessRates[bannerVersion as VersionId] = {};
      }
      characterSuccessRates[bannerVersion as VersionId][
        characterId as CharacterId
      ] =
        characterSuccessTotals[bannerVersion as VersionId]![
          characterId as CharacterId
        ]! / numSimulations;
    }
  }

  // Sort scenarios by count and return top 10
  const sortedScenarios = [...allSimulationResults]
    .sort(
      (a, b) =>
        scenarioCounts[allSimulationResults.indexOf(b)] -
        scenarioCounts[allSimulationResults.indexOf(a)]
    )
    .map((simulationResult, index) => ({
      bannerResults: simulationResult,
      count: scenarioCounts[index],
      percentage: scenarioCounts[index] / numSimulations,
    }));

  return {
    bannerResults,
    characterSuccessRates,
    topScenarios: sortedScenarios.slice(0, 10),
  };
};

export const runSimulationFunction = async (
  banners: Banner[],
  allocations: Allocations,
  pity: number,
  guaranteed: boolean,
  simulations: number,
  setSimulationResults: (results: SimulationResults) => void,
  setIsSimulating: (simulating: boolean) => void,
  setSimulationProgress: (progress: number) => void
) => {
  // Start simulation progress
  setIsSimulating(true);
  setSimulationProgress(0);

  const results = await runSimulation(
    banners,
    allocations,
    pity,
    guaranteed,
    simulations,
    setSimulationProgress
  );

  console.log(results);

  setSimulationProgress(1);
  setSimulationResults(results);
  setIsSimulating(false);

  return results;
};

export const runSimulation = async (
  banners: Banner[],
  allocations: Allocations,
  pity: number,
  guaranteed: boolean,
  simulations: number,
  setSimulationProgress?: (progress: number) => void
) => {
  // Run simulation with progress updates
  const totalSimulations = simulations;
  const batchSize = Math.min(1000, Math.floor(totalSimulations / 10));
  let completedSimulations = 0;

  // Return a promise that resolves when the simulation is complete
  const allSimulationResults: SimulationResult[] = [];

  return new Promise<SimulationResults>((resolve) => {
    // Run the simulation in batches
    for (let i = 0; i < totalSimulations; i += batchSize) {
      const batchResults = runSimulationBatch(
        banners,
        allocations,
        pity,
        guaranteed,
        batchSize
      );
      allSimulationResults.push(...batchResults);

      completedSimulations += batchSize;
      if (setSimulationProgress) {
        setSimulationProgress(completedSimulations / totalSimulations);
      }
    }

    resolve(finalizeResults(allSimulationResults));
  });
};

// Score the results of a simulation based on how closely it matches the player's desired outcome.
const scoreSimulation = (
  simulationResults: SimulationResults,
  allocation: PriorityAllocations
): number => {
  let score = 0;
  let allMustHavesGuaranteed = true;
  const mustHaveScores: number[] = [];

  // First pass: check if all must-haves are guaranteed
  for (const bannerId in simulationResults.characterSuccessRates) {
    const bannerSuccessRates =
      simulationResults.characterSuccessRates[bannerId as VersionId];
    if (!bannerSuccessRates) continue;

    for (const charId in bannerSuccessRates) {
      const successRate = bannerSuccessRates[charId as CharacterId] || 0;
      const priority =
        allocation[bannerId as VersionId]?.[charId as CharacterId] || "skip";

      if (priority === 0) {
        mustHaveScores.push(successRate);
        // Consider a must-have guaranteed if success rate is 99% or higher
        if (successRate < 0.99) {
          allMustHavesGuaranteed = false;
        }
      }
    }
  }

  // If there are no must-haves, we can consider them all guaranteed
  if (mustHaveScores.length === 0) {
    allMustHavesGuaranteed = true;
  }

  // Second pass: calculate scores with priority weighting using powers of 10
  for (const bannerId in simulationResults.characterSuccessRates) {
    const bannerSuccessRates =
      simulationResults.characterSuccessRates[bannerId as VersionId];
    if (!bannerSuccessRates) continue;

    for (const charId in bannerSuccessRates) {
      const successRate = bannerSuccessRates[charId as CharacterId] || 0;
      const priority =
        allocation[bannerId as VersionId]?.[charId as CharacterId] ||
        DEFAULT_PRIORITY;

      // Score based on priority and success rate using powers of 10
      switch (priority) {
        case 0:
          // 10^3 = 1000 points for must-have characters
          score += successRate >= 0.99 ? 1000 : successRate * 900;
          break;
        case 1:
          // 10^2 = 100 points for want characters
          score += successRate >= 0.8 ? 100 : successRate * 80;
          break;
        case 2:
          // 10^1 = 10 points for nice-to-have characters
          if (allMustHavesGuaranteed) {
            score += successRate >= 0.7 ? 10 : successRate * 8;
          }
          break;
        case 3:
          // 10^0 = 0 points for skipped characters
          break;
      }
    }
  }

  return score;
};

// Randomly generate different unique allocations of wishes to test.
// We use a simple algorithm:
// 1. Determine how many banners we might need to allocate wishes to (this is the number of banners
//    that have at least one non-skip character).
// 2. Pick a banner at random, banner i.
// 3. Allocate a random number of wishes, A, for that banner, where 1 <= A <= N_i and N_i <= X, where N_i is the number of wishes available for banner i and X is the total number of wishes available.
// 4. Repeat steps 2 and 3 until we have allocated the total number of wishes.
const generateAllocations = (
  banners: Banner[],
  allocations: PriorityAllocations,
  numAllocations: number,
  availableWishes: Record<VersionId, number> = {}
): Allocations[] => {
  const result: Allocations[] = [];

  // Calculate total wishes available across all banners
  const totalWishesAvailable = Object.values(availableWishes).reduce(
    (sum, wishes) => sum + wishes,
    0
  );

  // Find banners with at least one non-skip character
  const relevantBanners = banners.filter((banner) => {
    const bannerAllocation = allocations[banner.id as VersionId];
    if (!bannerAllocation) return false;

    return Object.values(bannerAllocation).some(
      (priority) => priority !== DEFAULT_PRIORITY
    );
  });

  if (relevantBanners.length === 0) return result;

  // Generate the requested number of unique allocations
  for (let i = 0; i < numAllocations; i++) {
    const newAllocation: Allocations = {};

    // Initialize allocation structure
    for (const banner of banners) {
      newAllocation[banner.id as VersionId] = {};

      // Copy the priority and constellation settings from the original allocation
      if (allocations[banner.id as VersionId]) {
        for (const [charId, priority] of Object.entries(
          allocations[banner.id as VersionId] || {}
        )) {
          newAllocation[banner.id as VersionId][charId as CharacterId] = {
            wishesAllocated: 0,
            pullPriority: priority,
            maxConstellation: 0, // Default to C0
          };
        }
      }
    }

    // Create a copy of available wishes to track remaining wishes
    const remainingWishes = { ...availableWishes };
    let totalRemaining = totalWishesAvailable;

    // Randomly allocate wishes to banners
    while (totalRemaining > 0 && relevantBanners.length > 0) {
      // Pick a random banner
      const randomIndex = Math.floor(Math.random() * relevantBanners.length);
      const randomBanner = relevantBanners[randomIndex];
      const bannerId = randomBanner.id as VersionId;

      // Determine how many wishes we can allocate to this banner
      const maxForBanner = Math.min(
        remainingWishes[bannerId] || 0,
        totalRemaining
      );

      if (maxForBanner <= 0) {
        // Remove this banner from consideration if no wishes available
        relevantBanners.splice(randomIndex, 1);
        continue;
      }

      // Allocate a random number of wishes to this banner
      const wishesToAllocate = Math.floor(Math.random() * maxForBanner) + 1;

      // Find characters with non-skip priority in this banner
      const eligibleCharacters = Object.entries(allocations[bannerId] || {})
        .filter(([, priority]) => priority !== DEFAULT_PRIORITY)
        .map(([charId]) => charId as CharacterId);

      if (eligibleCharacters.length > 0) {
        // Randomly select a character to allocate wishes to
        const randomCharId =
          eligibleCharacters[
            Math.floor(Math.random() * eligibleCharacters.length)
          ];

        // Update the allocation
        if (newAllocation[bannerId][randomCharId]) {
          newAllocation[bannerId][randomCharId]!.wishesAllocated +=
            wishesToAllocate;
        } else {
          newAllocation[bannerId][randomCharId] = {
            wishesAllocated: wishesToAllocate,
            pullPriority:
              allocations[bannerId]?.[randomCharId] || DEFAULT_PRIORITY,
            maxConstellation: 0,
          };
        }

        // Update remaining wishes
        remainingWishes[bannerId] =
          (remainingWishes[bannerId] || 0) - wishesToAllocate;
        totalRemaining -= wishesToAllocate;
      } else {
        // No eligible characters in this banner, remove it from consideration
        relevantBanners.splice(randomIndex, 1);
      }
    }

    result.push(newAllocation);
  }

  return result;
};

// Determine the optimal wish allocation that meets the player's goal.
// This approach iteratively adjusts wish allocations based on simulation results
// until all characters meet their target success rates or we reach the maximum iterations.
const determineOptimalAllocations = async (
  banners: Banner[],
  allocations: Allocations,
  pity: number,
  guaranteed: boolean
): Promise<Allocations[]> => {
  const result: Allocations[] = [];
  const priorityTargets: Record<Priority, number> = {
    [0 as Priority]: 0.99, // 99% success rate
    [1 as Priority]: 0.9, // 90% success rate
    [2 as Priority]: 0.7, // 70% success rate
    [3 as Priority]: 0, // 0% success rate
  };

  // Create a deep copy of the allocations to work with
  const baseAllocation: Allocations = JSON.parse(JSON.stringify(allocations));

  // Reset all wish allocations to 0
  for (const bannerId in baseAllocation) {
    for (const charId in baseAllocation[bannerId as VersionId]) {
      baseAllocation[bannerId as VersionId][
        charId as CharacterId
      ]!.wishesAllocated = 0;
    }
  }

  // Get all characters with non-skip priority
  const priorityCharacters: Array<{
    bannerId: VersionId;
    charId: CharacterId;
    priority: Priority;
    maxConstellation: number;
  }> = [];

  for (const bannerId in allocations) {
    for (const charId in allocations[bannerId as VersionId]) {
      const allocation =
        allocations[bannerId as VersionId][charId as CharacterId];
      if (allocation && allocation.pullPriority !== DEFAULT_PRIORITY) {
        priorityCharacters.push({
          bannerId: bannerId as VersionId,
          charId: charId as CharacterId,
          priority: allocation.pullPriority,
          maxConstellation: allocation.maxConstellation,
        });
      }
    }
  }

  // Sort characters by priority (must-have first)
  priorityCharacters.sort((a, b) => {
    return a.priority - b.priority;
  });

  // Create a new allocation with initial wish distribution
  const newAllocation = JSON.parse(JSON.stringify(baseAllocation));

  // Initial distribution - start with a baseline number of wishes per character
  for (const character of priorityCharacters) {
    const { bannerId, charId, priority } = character;
    // Initial allocation based on priority
    const initialWishes = priority === 0 ? 90 : priority === 1 ? 60 : 30;
    newAllocation[bannerId][charId].wishesAllocated = initialWishes;
  }

  // Iteratively adjust allocations based on simulation results
  const MAX_ITERATIONS = 10;
  const CONVERGENCE_THRESHOLD = 0.05; // 5% difference
  const SIMULATION_COUNT = 1000;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    // Run simulations with current allocation
    const simResults = await runSimulation(
      banners,
      newAllocation,
      pity,
      guaranteed,
      SIMULATION_COUNT
    );

    // Check if all characters meet their target rates within threshold
    let allMeetTargets = true;
    const adjustments: Array<{
      bannerId: VersionId;
      charId: CharacterId;
      successRate: number;
      targetRate: number;
      adjustment: number;
    }> = [];

    for (const { bannerId, charId, priority } of priorityCharacters) {
      const targetRate = priorityTargets[priority];
      // Extract success rate from simulation results
      const successRate =
        simResults.characterSuccessRates[bannerId as VersionId]?.[
          charId as CharacterId
        ] || 0;

      const difference = targetRate - successRate;

      if (Math.abs(difference) > CONVERGENCE_THRESHOLD) {
        allMeetTargets = false;

        // Calculate adjustment based on difference
        // Larger adjustment for bigger differences
        const adjustmentFactor = Math.abs(difference) > 0.2 ? 0.3 : 0.15;
        const adjustment = Math.ceil(
          difference *
            newAllocation[bannerId][charId].wishesAllocated *
            adjustmentFactor
        );

        adjustments.push({
          bannerId,
          charId,
          successRate,
          targetRate,
          adjustment,
        });
      }
    }

    if (allMeetTargets) {
      break; // Convergence achieved
    }

    // Apply adjustments
    for (const { bannerId, charId, adjustment } of adjustments) {
      if (adjustment > 0) {
        // Need more wishes
        newAllocation[bannerId][charId].wishesAllocated += adjustment;
      } else if (adjustment < 0) {
        // Can reduce wishes
        const reduction = Math.min(
          Math.abs(adjustment),
          newAllocation[bannerId][charId].wishesAllocated - 1
        );
        newAllocation[bannerId][charId].wishesAllocated -= reduction;
      }
    }
  }

  result.push(newAllocation);
  return result;
};

// In optimization mode, we want to run a simulation for each possible allocation of wishes
// and return the results.
// Since an allocation that meets the player's goal might not be possible, we prioritize the
// characters that the player wants most:
// 1. "Must have" -> Target 99% probability
// 2. "Want" -> Target 90% probability
// 3. "Would be nice" -> Target 70% probability
// 4. "Not interested" -> Target 0% probability
// We run a randomized algorithm that tries various allocations (within reasonable limits)
// and returns the best result.
export const runOptimization = async (
  banners: Banner[],
  allocations: Allocations,
  pity: number,
  guaranteed: boolean,
  availableWishes: Record<VersionId, number>,
  setSimulationResults: (results: SimulationResults) => void,
  setIsSimulating: (simulating: boolean) => void,
  setSimulationProgress: (progress: number) => void
) => {
  const priorityAllocations: PriorityAllocations = {};
  for (const bannerId in allocations) {
    const bannerAllocations = allocations[bannerId as VersionId];
    for (const charId in bannerAllocations) {
      if (!priorityAllocations[bannerId as VersionId]) {
        priorityAllocations[bannerId as VersionId] = {};
      }
      priorityAllocations[bannerId as VersionId][charId as CharacterId] =
        bannerAllocations[charId as CharacterId]!.pullPriority;
    }
  }
  const getSimulationScore: IGetCompareValue<{
    allocation: Allocations;
    results: SimulationResults;
  }> = ({ results }) => scoreSimulation(results, priorityAllocations);

  const bestScores = new MaxPriorityQueue<{
    allocation: Allocations;
    results: SimulationResults;
  }>(getSimulationScore);

  const randomAllocations = generateAllocations(
    banners,
    priorityAllocations,
    100000,
    availableWishes
  );

  for (let i = 0; i < randomAllocations.length; i++) {
    const a = randomAllocations[i];
    setSimulationProgress(i / randomAllocations.length);
    const results = finalizeResults(
      runSimulationBatch(banners, a, pity, guaranteed, 100)
    );
    bestScores.enqueue({ allocation: a, results });
  }

  const bestSimulation = bestScores.dequeue();
  if (bestSimulation) {
    console.log("Best simulation score:", getSimulationScore(bestSimulation));
    console.log("Allocations:");
    // Print the allocations like this: [Character name]: X wishes (56% chance to get)
    for (const bannerId in bestSimulation.allocation) {
      const bannerAllocations =
        bestSimulation.allocation[bannerId as VersionId];
      for (const charId in bannerAllocations) {
        const charAllocations = bannerAllocations[charId as CharacterId];
        const successRate =
          bestSimulation.results.characterSuccessRates[bannerId as VersionId]?.[
            charId as CharacterId
          ] || 0;
        if (charAllocations) {
          console.log(
            `${charId}: ${charAllocations.wishesAllocated} wishes (${
              successRate * 100
            }% chance to get)`
          );
        }
      }
    }
  }

  const optimalAllocations = await determineOptimalAllocations(
    banners,
    allocations,
    pity,
    guaranteed
  );
  console.log("Optimal allocations:");
  for (let i = 0; i < optimalAllocations.length; i++) {
    const a = optimalAllocations[i];
    const results = finalizeResults(
      runSimulationBatch(banners, a, pity, guaranteed, 100)
    );
    console.log(
      "Simulation score:",
      getSimulationScore({ allocation: a, results })
    );
    for (const bannerId in a) {
      const bannerAllocations = a[bannerId as VersionId];
      for (const charId in bannerAllocations) {
        const charAllocations = bannerAllocations[charId as CharacterId];
        const successRate =
          results.characterSuccessRates[bannerId as VersionId]?.[
            charId as CharacterId
          ] || 0;
        if (charAllocations) {
          console.log(
            `${charId}: ${charAllocations.wishesAllocated} wishes (${
              successRate * 100
            }% chance to get)`
          );
        }
      }
    }
  }
  if (bestSimulation) {
    setSimulationResults(bestSimulation.results);
  }
  setIsSimulating(false);
};
