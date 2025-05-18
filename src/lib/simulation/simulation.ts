import {
  AccountStatus,
  Allocations,
  Banner,
  BannerSimulationResult,
  PRIMOGEM_SOURCE_VALUES,
  PrimogemSourceValues,
  ResultType,
  Scenario,
  ScenarioOutcome,
  VersionId,
} from "../types";

/**
 * Calculate the probability of getting a 5-star based on current pity
 * Implements Genshin Impact's soft and hard pity system
 */
export const get5StarProbability = (pity: number): number => {
  if (pity < 73) {
    return 0.006; // Base rate
  } else if (pity < 89) {
    // Soft pity - increases with each pull
    return 0.006 + (pity - 72) * 0.06;
  } else {
    return 1.0; // Hard pity (90th pull)
  }
};

/**
 * Calculate total available wishes from primogems and other resources
 */
export const calculateTotalAvailableWishes = (
  accountStatus: AccountStatus
): number => {
  const primoWishes = Math.floor(
    accountStatus.ownedWishResources.primogems / 160
  );
  const starglitterWishes = Math.floor(
    accountStatus.ownedWishResources.starglitter / 5
  );
  const stardustWishes = Math.floor(
    accountStatus.ownedWishResources.stardust / 10
  );
  const genesisCrystalWishes = Math.floor(
    accountStatus.ownedWishResources.genesisCrystal / 10
  );
  const limitedWishes = accountStatus.ownedWishResources.limitedWishes;
  return (
    primoWishes +
    starglitterWishes +
    limitedWishes +
    stardustWishes +
    genesisCrystalWishes
  );
};

/**
 * Calculate available wishes for a specific banner
 * Takes into account wishes spent on previous banners and estimated new wishes
 */
export const calculateAvailableWishesForBanner = (
  bannerId: VersionId,
  banners: Banner[],
  bannerAllocations: Allocations,
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
    const versionAllocation = bannerAllocations[banner.version] || {};
    if (versionAllocation) {
      for (const character of banner.characters) {
        bannerSpent += versionAllocation[character.id]?.wishesAllocated || 0;
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
  bannerAllocations: Allocations,
  totalAvailableWishes: number,
  estimatedNewWishesPerBanner: number
): Record<VersionId, number> => {
  const availableWishes: Record<VersionId, number> = {};
  for (const banner of banners) {
    availableWishes[banner.id] = calculateAvailableWishesForBanner(
      banner.id,
      banners,
      bannerAllocations,
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
  bannerAllocations: Allocations
): number => {
  let totalAvailable = totalAvailableWishes;

  // Process each banner in sequence
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    // Add new wishes from this banner
    totalAvailable += estimatedNewWishes;

    // Calculate total wishes spent in this banner
    const bannerSpend = sumBannerWishAllocation(
      bannerAllocations,
      banner.version
    );

    // Subtract from available
    totalAvailable -= Math.min(bannerSpend, totalAvailable);
  }

  return totalAvailable;
};

/**
 * Sum all wish allocations for a specific banner version
 */
export const sumBannerWishAllocation = (
  bannerAllocations: Allocations,
  bannerVersion: VersionId
): number => {
  const versionAllocation = bannerAllocations[bannerVersion];
  if (!versionAllocation) return 0;

  return Object.values(versionAllocation).reduce(
    (sum, wishesAllocated) => sum + (wishesAllocated?.wishesAllocated || 0),
    0
  );
};

/**
 * Checks if wishes exceed what's available at any point during the banner progression
 * This takes into account wishes accumulated during each banner
 */
export const calculateWishesExceedAvailable = (
  bannerAllocations: Allocations,
  totalAvailableWishes: number,
  estimatedNewWishesPerBanner: number
): boolean => {
  if (totalAvailableWishes <= 0) return false;

  let availableWishes = totalAvailableWishes;

  // Process each banner in sequence
  for (const version in bannerAllocations) {
    const bannerId = version as VersionId;

    // Add estimated wishes from this banner phase first
    availableWishes += estimatedNewWishesPerBanner;

    // Calculate total wishes allocated for this banner
    const bannerWishesAllocated = sumBannerWishAllocation(
      bannerAllocations,
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
 * Calculate estimated wishes from all sources
 */
export const calculateEstimatedWishes = (
  accountStatus: AccountStatus
): number => {
  let totalPrimogems = 0;
  let totalLimitedWishes = 0;

  // Process each primogem source
  Object.entries(accountStatus.primogemSources).forEach(([key, isEnabled]) => {
    if (!isEnabled) return;

    const sourceKey = key as keyof PrimogemSourceValues;
    const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];

    if (Array.isArray(sourceValue)) {
      // Handle array of resource values
      sourceValue.forEach((resource) => {
        if (resource.type === "primogem") {
          totalPrimogems += resource.value;
        } else if (resource.type === "limitedWish") {
          totalLimitedWishes += resource.value;
        }
      });
    } else {
      // Handle single resource value
      if (sourceValue.type === "primogem") {
        totalPrimogems += sourceValue.value;
      } else if (sourceValue.type === "limitedWish") {
        totalLimitedWishes += sourceValue.value;
      }
    }
  });

  // Convert primogems to wishes (160 primogems per wish)
  const primogemWishes = Math.floor(totalPrimogems / 160);

  // Return total wishes (only count limited wishes for banner pulls)
  return primogemWishes + totalLimitedWishes;
};

/**
 * Calculates the total number of unallocated wishes including all estimated future wishes
 */
export const calculateTotalUnallocatedWishes = (
  banners: Banner[],
  totalInitialWishes: number,
  addEstimatedWishes: boolean,
  estimatedNewWishes: number,
  bannerAllocations: Allocations
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
      bannerAllocations,
      banner.version
    );
  }

  // Calculate remaining wishes - ensure it's never negative
  const remainingWishes = totalWishes - totalAllocatedWishes;
  return isNaN(remainingWishes) ? 0 : Math.max(0, remainingWishes);
};

export const bannerResultToOutcome = (
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
  bannerResults: Record<VersionId, BannerSimulationResult>,
  probability: number,
  allBanners: Banner[]
): Scenario => {
  // Create outcomes for all banners, including those not in the simulation results
  const outcomes: Record<VersionId, ScenarioOutcome> = {};

  // First set default outcomes for all banners
  allBanners.forEach((banner) => {
    outcomes[banner.id as VersionId] = {
      banner: banner.id as VersionId,
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
