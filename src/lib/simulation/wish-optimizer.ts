/**
 * Score the results of a simulation based on how closely it matches the player's desired outcome.
 * A score of 1 indicates that all must-have characters were obtained, all want characters were obtained with >75% likelihood,
 * and all want characters were obtained with >60% likelihood.
 * Each percentage that is off results in an 0.01 subtraction from the score.
 */

import {
  IGetCompareValue,
  MaxPriorityQueue,
} from "@datastructures-js/priority-queue";
import {
  ApiBanner,
  BannerConfiguration,
  BannerId,
  CharacterId,
  DEFAULT_PRIORITY,
  Priority,
  priorityTargets,
  SimulationResults,
} from "../types";
import { WishAllocation } from "./wish-allocation";
import {
  finalizeResults,
  runSimulation,
  runSimulationBatch,
} from "./wish-simulator";

const scoreSimulation = (
  simulationResults: SimulationResults,
  bannerConfiguration: Record<string, BannerConfiguration>
): number => {
  let score = 1;
  for (const versionId of Object.keys(bannerConfiguration)) {
    for (const characterId of Object.keys(bannerConfiguration[versionId])) {
      const characterSuccessRate = simulationResults.characterSuccessRates.find(
        (v) => v.characterId === characterId
      );
      if (!characterSuccessRate) continue;
      const priority =
        bannerConfiguration[versionId].characters[characterId].priority;
      if (!priority) continue;
      const priorityTarget = priorityTargets[priority];
      score -= Math.max(
        priorityTarget - characterSuccessRate.successPercent,
        0
      );
    }
  }
  return score;
};

// Determine the optimal wish allocation that meets the player's goal.
// This approach iteratively adjusts wish allocations based on simulation results
// until all characters meet their target success rates or we reach the maximum iterations.
const determineOptimalAllocations = async (
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  characterPity: number,
  characterGuaranteed: boolean,
  weaponPity: number,
  weaponGuaranteed: boolean
): Promise<Record<string, BannerConfiguration>[]> => {
  const result: Record<string, BannerConfiguration>[] = [];

  // Create a deep copy of the allocations to work with
  const baseAllocation: Record<string, BannerConfiguration> = JSON.parse(
    JSON.stringify(bannerConfiguration)
  );

  // Reset all wish allocations to 0
  for (const bannerId in baseAllocation) {
    for (const charId in baseAllocation[bannerId].characters) {
      baseAllocation[bannerId].characters[charId]!.wishesAllocated = 0;
    }
  }

  // Get all characters with non-skip priority
  const priorityCharacters: Array<{
    bannerId: BannerId;
    charId: CharacterId;
    priority: Priority;
    maxConstellation: number;
  }> = [];

  for (const bannerId in baseAllocation) {
    for (const charId in baseAllocation[bannerId].characters) {
      const priority = baseAllocation[bannerId].characters[charId].priority;
      const allocation =
        baseAllocation[bannerId].characters[charId].wishesAllocated;
      const maxConstellation =
        baseAllocation[bannerId].characters[charId].maxConstellation;
      if (allocation && priority && priority !== DEFAULT_PRIORITY) {
        priorityCharacters.push({
          bannerId: bannerId,
          charId,
          priority,
          maxConstellation,
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
      characterPity,
      characterGuaranteed,
      weaponPity,
      weaponGuaranteed,
      SIMULATION_COUNT
    );

    // Check if all characters meet their target rates within threshold
    let allMeetTargets = true;
    const adjustments: Array<{
      bannerId: BannerId;
      charId: CharacterId;
      successRate: number;
      targetRate: number;
      adjustment: number;
    }> = [];

    for (const { bannerId, charId, priority } of priorityCharacters) {
      const targetRate = priorityTargets[priority];
      // Extract success rate from simulation results
      const successRate =
        simResults.characterSuccessRates.find((c) => c.characterId === charId)
          ?.successPercent || 0;

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

const generateBestGuessAllocation = (
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  startingWishes: number,
  wishesGainedPerBanner: number
): Record<string, BannerConfiguration> => {
  const priorityCharacters: {
    characterId: CharacterId;
    priority: Priority;
    versionId: BannerId;
  }[] = [];
  for (const versionId of Object.keys(bannerConfiguration)) {
    const versionAllocation = bannerConfiguration[versionId];
    for (const untypedCharacterId of Object.keys(versionAllocation)) {
      const characterId = untypedCharacterId;
      let pullPriority =
        bannerConfiguration[versionId].characters[characterId].priority;
      if (pullPriority === undefined) pullPriority = DEFAULT_PRIORITY;
      if (pullPriority < DEFAULT_PRIORITY) {
        priorityCharacters.push({
          characterId,
          priority: pullPriority,
          versionId,
        });
      }
    }
  }

  // Sort from highest to lowest priority, breaking ties based on later banners
  priorityCharacters.sort((a, b) => {
    const priorityScore = (a.priority - b.priority) * 100;
    const bannerScore = b.versionId
      .toString()
      .localeCompare(a.versionId.toString());
    return priorityScore + bannerScore;
  });

  console.log("Sorted character list:", priorityCharacters);

  const priorityToOptimalAllocation: Record<Priority, number> = {
    [1 as Priority]: 180,
    [2 as Priority]: 140,
    [3 as Priority]: 75,
    [4 as Priority]: 0,
  };

  const alloc = new WishAllocation(
    startingWishes,
    wishesGainedPerBanner,
    banners
  );
  // Opportunistically assign wishes, starting from highest to lowest priority, later to earlier banners
  while (priorityCharacters.length > 0) {
    const char = priorityCharacters.shift();
    if (!char) continue;
    const { versionId, characterId, priority } = char;
    const wishesToAssign = priorityToOptimalAllocation[priority];
    if (wishesToAssign === 0) continue;

    // TODO: Should we do anything with this value? Use the leftovers somehow?
    const _allocated = alloc.allocate(versionId, characterId, wishesToAssign);
  }

  return alloc.allocation;
};

const hillClimb = async (
  bestScores: MaxPriorityQueue<{
    allocation: Record<string, BannerConfiguration>;
    results: SimulationResults;
  }>,
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  characterPity: number,
  characterGuaranteed: boolean,
  weaponPity: number,
  weaponGuaranteed: boolean,
  startingWishes: number,
  wishesGainedPerBanner: number,
  numIterations: number = 10000
) => {
  const bestGuessAllocation = generateBestGuessAllocation(
    banners,
    bannerConfiguration,
    startingWishes,
    wishesGainedPerBanner
  );
  const results = finalizeResults(
    runSimulationBatch(
      banners,
      bestGuessAllocation,
      characterPity,
      characterGuaranteed,
      100,
      weaponPity,
      weaponGuaranteed
    )
  );
  bestScores.enqueue({ allocation: bestGuessAllocation, results });
  for (let i = 0; i < numIterations; i++) {
    const bestAllocation = bestScores.front();
    if (!bestAllocation) break;
    const versions = Object.keys(bestAllocation.allocation);
    const randomV = versions[Math.floor(Math.random() * versions.length)];
    const chars = Object.keys(bestAllocation.allocation[randomV]);
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    const wishesAllocated =
      bestAllocation.allocation[randomV].characters[randomChar]!
        .wishesAllocated;
    const delta = Math.random() * wishesAllocated;

    // TODO: This is so ugly >_<
    const newAllocation = {
      ...bestAllocation.allocation,
      [randomV]: {
        ...bestAllocation.allocation[randomV],
        characterConfiguration: {
          ...bestAllocation.allocation[randomV].characters,
          [randomChar]: {
            ...bestAllocation.allocation[randomV].characters[randomChar],
            wishesAllocated: wishesAllocated - delta,
          },
        },
      },
    };
    bestScores.enqueue({
      allocation: newAllocation,
      results: finalizeResults(
        runSimulationBatch(
          banners,
          bestGuessAllocation,
          characterPity,
          characterGuaranteed,
          100,
          weaponPity,
          weaponGuaranteed
        )
      ),
    });
  }
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
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  characterPity: number,
  characterGuaranteed: boolean,
  weaponPity: number,
  weaponGuaranteed: boolean,
  startingWishes: number,
  wishesGainedPerBanner: number,
  setSimulationResults: (
    results: Record<string, BannerConfiguration>[]
  ) => void,
  setIsSimulating: (simulating: boolean) => void,
  _setSimulationProgress: (progress: number) => void // TODO: This is unused!
): Promise<Record<string, BannerConfiguration>[]> => {
  const getSimulationScore: IGetCompareValue<{
    allocation: Record<string, BannerConfiguration>;
    results: SimulationResults;
  }> = ({ results }) => scoreSimulation(results, bannerConfiguration);

  const bestScores = new MaxPriorityQueue<{
    allocation: Record<string, BannerConfiguration>;
    results: SimulationResults;
  }>(getSimulationScore);

  hillClimb(
    bestScores,
    banners,
    bannerConfiguration,
    characterPity,
    characterGuaranteed,
    weaponPity,
    weaponGuaranteed,
    startingWishes,
    wishesGainedPerBanner
  );

  const bestSimulation = bestScores.dequeue();
  if (bestSimulation) {
    // Print the allocations like this: [Character name]: X wishes (56% chance to get)
    for (const bannerId in bestSimulation.allocation) {
      const bannerAllocations = bestSimulation.allocation[bannerId];
      for (const charId in bannerAllocations.characters) {
        const charAllocations = bannerAllocations.characters[charId];
        const successRate =
          bestSimulation.results.characterSuccessRates.find(
            (c) => c.characterId === charId
          )?.successPercent || 0;
        if (charAllocations && charAllocations.wishesAllocated) {
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
    bannerConfiguration,
    characterPity,
    characterGuaranteed,
    weaponPity,
    weaponGuaranteed
  );
  console.log("Optimal allocations:");
  for (let i = 0; i < optimalAllocations.length; i++) {
    const a = optimalAllocations[i];
    const results = finalizeResults(
      runSimulationBatch(
        banners,
        a,
        characterPity,
        characterGuaranteed,
        100,
        weaponPity,
        weaponGuaranteed
      )
    );
    console.log(
      "Simulation score:",
      getSimulationScore({ allocation: a, results })
    );
    for (const bannerId in a) {
      const bannerAllocations = a[bannerId];
      for (const charId in bannerAllocations.characters) {
        const charAllocations = bannerAllocations.characters[charId];
        const successRate =
          results.characterSuccessRates.find((c) => c.characterId === charId)
            ?.successPercent || 0;
        if (charAllocations && charAllocations.wishesAllocated) {
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
    setSimulationResults([bestSimulation.allocation]);
  }
  setIsSimulating(false);
  return optimalAllocations;
};
