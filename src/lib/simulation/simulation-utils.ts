import {
  ApiBanner,
  BannerId,
  BannerSimulationResult,
  ResultType,
  Scenario,
  ScenarioOutcome,
} from "../types";

/**
 * Calculate the probability of getting a 5-star based on current pity
 * Implements Genshin Impact's soft and hard pity system
 */
export const getCharacter5StarProbability = (pity: number): number => {
  if (pity < 73) {
    return 0.006; // Base rate
  } else if (pity < 89) {
    // Soft pity - increases with each pull
    return 0.006 + (pity - 72) * 0.06;
  } else {
    return 1.0; // Hard pity (90th pull)
  }
};

export const getWeapon5StarProbability = (pity: number): number => {
  if (pity < 63) {
    return 0.007; // Base rate (0.7%)
  } else if (pity < 79) {
    // Soft pity - increases with each pull from 63 onwards
    return 0.007 + (pity - 62) * 0.07;
  } else {
    return 1.0; // Hard pity (80th pull)
  }
};

/**
 * Calculate available wishes for a specific banner.
 * Takes into account wishes spent on previous banners and estimated new wishes.
 * Because this depends on previous banners, banneres should be processed in order,
 * and when any banner changes, all future banners should be re-calculated too.
 */
export const calculateAvailableWishesForBanner = (
  banner: ApiBanner,
  wishesAllocated: number,
  estimatedNewWishes: number,
  carryOverWishes: number
): number => {
  // Initialize with available wishes
  let availableWishes = carryOverWishes;

  // Add estimated wishes
  availableWishes += estimatedNewWishes;

  // Subtract spent wishes
  availableWishes -= wishesAllocated;

  // Never return a negative value
  return Math.max(0, availableWishes);
};

const bannerResultToOutcome = (
  bannerResult: BannerSimulationResult
): ScenarioOutcome => {
  // Extract results for up to two featured characters
  const characterResults = Object.values(bannerResult.characterResults);

  // Initialize result and constellation arrays
  const result: [ResultType, ResultType] = ["-", "-"];
  const constellation: [number, number] = [0, 0];

  // Process each character result (up to 2)
  for (let i = 0; i < Math.min(characterResults.length, 2); i++) {
    const charResult = characterResults[i];

    if (!charResult.hasWishesAllocated) {
      result[i] = "-";
    } else if (charResult.obtained) {
      if (charResult.lostFiftyFifty) {
        result[i] = "Standard 5*";
      } else {
        result[i] = charResult.character;
        constellation[i] = charResult.constellation;
      }
    } else {
      result[i] = "Missed";
    }
  }

  return {
    banner: bannerResult.bannerId,
    result,
    constellation,
  };
};

// New function to directly convert BannerSimulationResult[] to Scenario
export const simulationResultsToScenario = (
  bannerResults: Record<BannerId, BannerSimulationResult>,
  probability: number,
  allBanners: ApiBanner[]
): Scenario => {
  // Create outcomes for all banners, including those not in the simulation results
  const outcomes: Record<BannerId, ScenarioOutcome> = {};

  // First set default outcomes for all banners
  allBanners.forEach((banner) => {
    outcomes[banner.id] = {
      banner: banner.id,
      result: ["-", "-"],
      constellation: [0, 0],
    };
  });

  // Then update with actual results
  Object.values(bannerResults).forEach((result) => {
    outcomes[result.bannerId] = bannerResultToOutcome(result);
  });

  return {
    outcomes,
    probability,
  };
};
