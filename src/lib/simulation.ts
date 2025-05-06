import { GenshinStateData } from "./context/types";
import {
  Banner,
  BannerSimulationResult,
  CharacterSimulationResult,
  CharacterSuccessRate,
  ScenarioResult,
  SimulationResults,
  VersionId,
  WishAllocation,
} from "./types";

/**
 * WishSimulator simulates the gacha mechanics of Genshin Impact
 * It tracks pity and guaranteed status and provides probability calculations
 */
export class WishSimulator {
  pity: number;
  guaranteed: boolean;

  constructor(startingPity = 0, guaranteed = false) {
    this.pity = startingPity;
    this.guaranteed = guaranteed;
  }

  /**
   * Calculate the probability of getting a 5-star based on current pity
   * Implements Genshin Impact's soft and hard pity system
   */
  get5StarProbability(): number {
    if (this.pity < 73) {
      return 0.006; // Base rate
    } else if (this.pity < 89) {
      // Soft pity - increases with each pull
      return 0.006 + (this.pity - 72) * 0.06;
    } else {
      return 1.0; // Hard pity (90th pull)
    }
  }

  /**
   * Simulate a single wish
   * @returns "featured" if the featured 5-star was pulled, "standard" if a standard 5-star, or "non-5-star" otherwise
   */
  wish(): "featured" | "standard" | "non-5-star" {
    this.pity++;
    const prob = this.get5StarProbability();

    if (Math.random() < prob) {
      // Reset pity after getting a 5-star
      this.pity = 0;

      // Check if guaranteed
      if (this.guaranteed) {
        this.guaranteed = false;
        return "featured";
      } else {
        // 50/50 chance
        if (Math.random() < 0.5) {
          return "featured";
        } else {
          this.guaranteed = true;
          return "standard";
        }
      }
    }

    return "non-5-star";
  }
}

/**
 * Calculate total available wishes from primogems and other resources
 */
export const calculateTotalAvailableWishes = (
  primogems: number,
  starglitter: number,
  wishes: number
): number => {
  const primoWishes = Math.floor(primogems / 160);
  const starglitterWishes = Math.floor(starglitter / 5);
  return primoWishes + starglitterWishes + wishes;
};

/**
 * Calculate available wishes for a specific banner
 * Takes into account wishes spent on previous banners and estimated new wishes
 */
export const calculateAvailableWishesForBanner = (
  bannerId: VersionId,
  banners: Banner[],
  wishAllocation: WishAllocation,
  totalAvailableWishes: number,
  estimatedNewWishes: number
): number => {
  // Initialize with available wishes
  let availableWishes = isNaN(totalAvailableWishes) ? 0 : totalAvailableWishes;

  // Process previous banners to accumulate wishes and subtract spent wishes
  for (const banner of banners) {
    if (banner.id === bannerId) {
      break;
    }
    // Add estimated wishes
    availableWishes += estimatedNewWishes;

    // Calculate total spent in this banner
    let bannerSpent = 0;

    // Sum all wishes allocated to characters in this banner
    const versionAllocation = wishAllocation[banner.version];
    if (versionAllocation) {
      for (const character of banner.characters) {
        bannerSpent += versionAllocation[character.id] || 0;
      }
    }

    // Subtract spent wishes
    availableWishes -= bannerSpent;
  }

  // Add estimated wishes from current banner
  availableWishes += estimatedNewWishes;

  // Never return a negative value
  return Math.max(0, availableWishes);
};

export const calculateAvailableWishesForBanners = (
  banners: Banner[],
  wishAllocation: WishAllocation,
  totalAvailableWishes: number,
  estimatedNewWishesPerBanner: number
): Record<VersionId, number> => {
  const availableWishes: Record<VersionId, number> = {};
  for (const banner of banners) {
    availableWishes[banner.id] = calculateAvailableWishesForBanner(
      banner.id,
      banners,
      wishAllocation,
      totalAvailableWishes,
      estimatedNewWishesPerBanner
    );
  }
  return availableWishes;
};

/**
 * Calculate the remaining wishes after allocations
 */
export const calculateWishesRemaining = (
  banners: Banner[],
  totalAvailableWishes: number,
  estimatedNewWishes: number,
  wishAllocation: WishAllocation
): number => {
  let totalAvailable = totalAvailableWishes;

  // Process each banner in sequence
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    // Add new wishes from this banner
    totalAvailable += estimatedNewWishes;

    // Calculate total wishes spent in this banner
    const bannerSpend = sumBannerWishAllocation(wishAllocation, banner.version);

    // Subtract from available
    totalAvailable -= Math.min(bannerSpend, totalAvailable);
  }

  return totalAvailable;
};

/**
 * Sum all wish allocations for a specific banner version
 */
export const sumBannerWishAllocation = (
  wishAllocation: WishAllocation,
  bannerVersion: VersionId
): number => {
  const versionAllocation = wishAllocation[bannerVersion];
  if (!versionAllocation) return 0;

  return Object.values(versionAllocation).reduce(
    (sum, wishesAllocated) => sum + (wishesAllocated || 0),
    0
  );
};

/**
 * Checks if wishes exceed what's available at any point during the banner progression
 * This takes into account wishes accumulated during each banner
 */
export const calculateWishesExceedAvailable = (
  wishAllocation: WishAllocation,
  totalAvailableWishes: number,
  estimatedNewWishesPerBanner: number
): boolean => {
  if (totalAvailableWishes <= 0) return false;

  let availableWishes = totalAvailableWishes;

  // Process each banner in sequence
  for (const version in wishAllocation) {
    const bannerId = version as VersionId;

    // Add estimated wishes from this banner phase first
    availableWishes += estimatedNewWishesPerBanner;

    // Calculate total wishes allocated for this banner
    const bannerWishesAllocated = sumBannerWishAllocation(
      wishAllocation,
      bannerId
    );

    // Check if wishes for this banner exceed what's available at this point
    if (bannerWishesAllocated > availableWishes) {
      return true;
    }

    // Subtract spent wishes from available
    availableWishes -= bannerWishesAllocated;
  }

  // If we get here, no banner exceeded its available wishes
  return false;
};

/**
 * Calculate estimated wishes from welkin, battle pass, etc.
 */
export const calculateEstimatedWishes = (
  addEstimatedWishes: boolean,
  hasWelkin: boolean,
  hasBattlePass: boolean
): number => {
  if (!addEstimatedWishes) return 0;

  // Estimated wishes per phase (21 days)
  // Base: Daily commissions, events, etc.
  let estimatedWishes = 22; // About 3600 primos per phase from base sources

  // Welkin Moon: 90 primos per day = 1890 primos per phase = ~12 wishes
  if (hasWelkin) {
    estimatedWishes += 12;
  }

  // Battle Pass: About 8-10 wishes per patch, so ~4-5 per phase
  if (hasBattlePass) {
    estimatedWishes += 5;
  }

  return Math.floor(estimatedWishes);
};

/**
 * Calculates the total number of unallocated wishes including all estimated future wishes
 */
export const calculateTotalUnallocatedWishes = (
  banners: Banner[],
  totalInitialWishes: number,
  addEstimatedWishes: boolean,
  estimatedNewWishes: number,
  wishAllocation: WishAllocation
): number => {
  // Start with initial wishes
  let totalWishes = isNaN(totalInitialWishes) ? 0 : totalInitialWishes;

  // Add up all estimated wishes from all banners if enabled
  if (addEstimatedWishes) {
    totalWishes += banners.length * estimatedNewWishes;
  }

  // Subtract all allocated wishes
  let totalAllocatedWishes = 0;
  for (const banner of banners) {
    totalAllocatedWishes += sumBannerWishAllocation(
      wishAllocation,
      banner.version
    );
  }

  // Calculate remaining wishes - ensure it's never negative
  const remainingWishes = totalWishes - totalAllocatedWishes;
  return isNaN(remainingWishes) ? 0 : Math.max(0, remainingWishes);
};

export const runSimulation = async (
  state: GenshinStateData & {
    mode: "playground" | "optimizer";
    setSimulationResults: (results: SimulationResults) => void;
    setIsSimulating: (simulating: boolean) => void;
    setSimulationProgress: (progress: number) => void;
  }
) => {
  const {
    banners,
    simulations,
    totalAvailableWishes,
    estimatedNewWishesPerBanner,
    accountStatus: { currentPity, isGuaranteed },
    setIsSimulating,
    setSimulationProgress,
    setSimulationResults,
  } = state;

  const allocation = state.playground.wishAllocation;

  await runSimulationInternal(
    banners,
    allocation,
    currentPity,
    isGuaranteed,
    simulations,
    totalAvailableWishes,
    setIsSimulating,
    setSimulationProgress,
    setSimulationResults,
    estimatedNewWishesPerBanner
  );
};

/**
 * Run the wish simulation
 */
const runSimulationInternal = async (
  banners: Banner[],
  wishAllocation: WishAllocation,
  currentPity: number,
  isGuaranteed: boolean,
  simulations: number,
  totalAvailableWishes: number,
  setIsSimulating: (simulating: boolean) => void,
  setSimulationProgress: (progress: number) => void,
  setSimulationResults: (results: SimulationResults) => void,
  estimatedNewWishes: number
): Promise<void> => {
  console.log("Running simulation with allocation: ", wishAllocation);
  // Start simulation progress
  setIsSimulating(true);
  setSimulationProgress(0);

  // Process each banner and prepare data for simulation
  const bannersToSimulate = banners.map((banner) => {
    // Calculate available wishes for this banner by accounting for previous banners
    const wishesAvailableToSpend = sumBannerWishAllocation(
      wishAllocation,
      banner.version
    );

    return {
      ...banner,
      wishesAvailableToSpend,
      estimatedNewWishes,
    };
  });

  console.log("Banners to simulate: ", bannersToSimulate);

  // Run simulation with progress updates
  const totalSimulations = simulations;
  const batchSize = Math.min(1000, Math.floor(totalSimulations / 10));
  let completedSimulations = 0;

  // Store results by banner version
  const allBannerResults: Record<VersionId, BannerSimulationResult[]> = {};

  // Initialize empty arrays for each banner
  banners.forEach((banner) => {
    allBannerResults[banner.version] = [];
  });

  // Return a promise that resolves when the simulation is complete
  return new Promise<void>((resolve) => {
    const runSimulationBatch = () => {
      // Run a batch of simulations
      const batchToRun = Math.min(
        batchSize,
        totalSimulations - completedSimulations
      );

      for (let i = 0; i < batchToRun; i++) {
        let currentPityValue = currentPity;
        let isGuaranteedValue = isGuaranteed;

        // For each banner
        for (const banner of bannersToSimulate) {
          const bannerVersion = banner.version;
          const versionAllocation = wishAllocation[bannerVersion] || {};

          // Get characters with allocated wishes
          const charactersWithWishes = banner.characters.filter(
            (char) =>
              versionAllocation[char.id] && versionAllocation[char.id] > 0
          );

          // Skip banner if no wishes allocated
          if (charactersWithWishes.length === 0) {
            continue;
          }

          // Create a separate result for each character in the banner
          const characterResults: CharacterSimulationResult[] = [];

          // For each character that has wishes allocated, simulate separately
          for (const targetChar of charactersWithWishes) {
            const wishesToSpend = versionAllocation[targetChar.id] || 0;

            // Use a new simulator instance with the current pity/guaranteed state
            const charSimulator = new WishSimulator(
              currentPityValue,
              isGuaranteedValue
            );

            let charPulls = 0;
            let obtained = false;
            let charLostFiftyFifty = false;

            // Simulate pulls for this specific character
            while (charPulls < wishesToSpend) {
              charPulls++;
              const result = charSimulator.wish();

              if (result === "featured") {
                // Successfully got the featured character
                obtained = true;
                break;
              } else if (result === "standard") {
                // Lost 50/50 and got a standard 5-star
                charLostFiftyFifty = true;
              }
            }

            // Record the results for this character
            characterResults.push({
              character: targetChar.id.toString(),
              obtained,
              hasWishesAllocated: true,
              lostFiftyFifty: charLostFiftyFifty,
              wishesUsed: charPulls,
            });

            // Update the pity/guaranteed state for the next character or banner
            currentPityValue = charSimulator.pity;
            isGuaranteedValue = charSimulator.guaranteed;
          }

          // For characters without wishes allocated, add them to results with obtained=false
          for (const char of banner.characters) {
            if (!charactersWithWishes.some((c) => c.id === char.id)) {
              characterResults.push({
                character: char.id.toString(),
                obtained: false,
                hasWishesAllocated: false,
                lostFiftyFifty: false,
                wishesUsed: 0,
              });
            }
          }

          // Calculate total wishes used across all characters
          const totalWishesUsed = characterResults.reduce(
            (sum, r) => sum + r.wishesUsed,
            0
          );

          // Create banner simulation result
          const bannerResult: BannerSimulationResult = {
            bannerId: bannerVersion,
            characterResults,
            wishesUsed: totalWishesUsed,
            endPity: currentPityValue,
            endGuaranteed: isGuaranteedValue,
          };

          // Store results
          allBannerResults[bannerVersion].push(bannerResult);
        }
      }

      completedSimulations += batchToRun;
      const progress = Math.floor(
        (completedSimulations / totalSimulations) * 100
      );
      setSimulationProgress(progress);

      // Continue with next batch or finalize
      if (completedSimulations < totalSimulations) {
        setTimeout(runSimulationBatch, 0);
      } else {
        console.log("Finalizing simulation results");
        finalizeSimulationResults();
        console.log("Simulation results finalized");
        resolve();
      }
    };

    const finalizeSimulationResults = () => {
      // Calculate character success rates
      const characterSuccessRates: Record<VersionId, CharacterSuccessRate[]> =
        {};

      for (const banner of banners) {
        const bannerVersion = banner.version;
        const versionAllocation = wishAllocation[bannerVersion] || {};

        // If no results for this banner, skip
        if (!allBannerResults[bannerVersion]?.length) {
          characterSuccessRates[bannerVersion] = [];
          continue;
        }

        // Calculate success rates for each character
        characterSuccessRates[bannerVersion] = banner.characters.map((char) => {
          // If this character has no wishes allocated, return 0% success rate
          if (!versionAllocation[char.id] || versionAllocation[char.id] <= 0) {
            return {
              character: char.id.toString(),
              rate: 0,
            };
          }

          // Calculate success rate from simulation results
          const successes = allBannerResults[bannerVersion].filter((result) => {
            return result.characterResults.some(
              (cr) => cr.character === char.id && cr.obtained
            );
          }).length;

          return {
            character: char.id.toString(),
            rate: (successes / totalSimulations) * 100,
          };
        });
      }

      // Calculate overall banner success rates
      const bannerSuccessRates: Record<VersionId, number> = {};

      for (const banner of banners) {
        const bannerVersion = banner.version;
        const versionAllocation = wishAllocation[bannerVersion] || {};

        // If no wishes spent on this banner, return 0%
        const bannerWishesAllocated = sumBannerWishAllocation(
          wishAllocation,
          bannerVersion
        );
        if (
          bannerWishesAllocated <= 0 ||
          !allBannerResults[bannerVersion]?.length
        ) {
          bannerSuccessRates[bannerVersion] = 0;
          continue;
        }

        // Count simulations where at least one character with allocated wishes was obtained
        const successes = allBannerResults[bannerVersion].filter((result) => {
          return result.characterResults.some(
            (cr) => cr.obtained && versionAllocation[cr.character] > 0
          );
        }).length;

        bannerSuccessRates[bannerVersion] =
          (successes / totalSimulations) * 100;
      }

      // Find common scenarios with compact patterns
      const scenarioCounts: Record<string, number> = {};

      // For each simulation
      for (let i = 0; i < totalSimulations; i++) {
        const pattern = banners
          .map((banner) => {
            const bannerVersion = banner.version;
            // Skip if no results for this banner
            if (!allBannerResults[bannerVersion]?.[i]) return "-";

            const result = allBannerResults[bannerVersion][i];
            const versionAllocation = wishAllocation[bannerVersion] || {};

            // No wishes allocated to this banner
            if (
              !result.characterResults.some(
                (cr) => versionAllocation[cr.character] > 0
              )
            ) {
              return "-"; // Skipped banner
            }

            // Check for featured character (success)
            const obtainedChar = result.characterResults.find(
              (cr) => cr.obtained && versionAllocation[cr.character] > 0
            );

            if (obtainedChar) {
              // Find the index of this character in the banner
              const charIndex = banner.characters.findIndex(
                (c) => c.id === obtainedChar.character
              );

              // Return a code that identifies which character by position (1-based)
              return `${charIndex + 1}`; // 1, 2, 3, etc.
            }

            // Check if a standard 5-star was obtained (lost 50/50)
            const lostFiftyFifty = result.characterResults.some(
              (cr) => cr.lostFiftyFifty && versionAllocation[cr.character] > 0
            );

            if (lostFiftyFifty) {
              return "S"; // Standard 5-star
            }

            // No 5-star obtained
            return "L"; // Loss - no 5-star
          })
          .join("");

        // Count this pattern
        scenarioCounts[pattern] = (scenarioCounts[pattern] || 0) + 1;
      }

      // Convert to array and sort by frequency
      const scenarioBreakdown: ScenarioResult[] = Object.entries(scenarioCounts)
        .map(([pattern, count]) => ({
          pattern,
          count,
          percentage: ((count / totalSimulations) * 100).toFixed(1) + "%",
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate available wishes per banner
      const availableWishes: Record<VersionId, number> = {};
      for (const banner of banners) {
        availableWishes[banner.version] = sumBannerWishAllocation(
          wishAllocation,
          banner.version
        );
      }

      // Compile final results
      const finalResults: SimulationResults = {
        bannerResults: allBannerResults,
        characterSuccessRates,
        bannerSuccessRates,
        scenarioBreakdown,
        availableWishes,
      };

      console.log("Simulation results", finalResults);
      setSimulationResults(finalResults);
      setIsSimulating(false);
    };

    // Start the first batch
    setTimeout(runSimulationBatch, 50);
  });
};
