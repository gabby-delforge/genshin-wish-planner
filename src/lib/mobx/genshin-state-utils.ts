import {
  ApiBanner,
  BannerConfiguration,
  BannerId,
  DEFAULT_PRIORITY,
  PrimogemSourceValue,
} from "../types";
import { isCurrentBanner, isOldBanner } from "../utils";

export const handleAbyssRewards = (
  banner: ApiBanner,
  sourceValue: PrimogemSourceValue
): { totalPrimogems: number; totalLimitedWishes: number } => {
  let totalPrimogems = 0;
  let totalLimitedWishes = 0;

  // Abyss runs from the 16th of one month to the 15th of the next
  const bannerStart = new Date(banner.startDate);
  const bannerEnd = new Date(banner.endDate);

  // Find abyss seasons that BEGIN during this banner period
  let currentAbyssStart = new Date(
    bannerStart.getFullYear(),
    bannerStart.getMonth(),
    16
  );

  // If the 16th of this month is before banner start, move to next month
  if (currentAbyssStart < bannerStart) {
    currentAbyssStart = new Date(
      bannerStart.getFullYear(),
      bannerStart.getMonth() + 1,
      16
    );
  }

  let abyssSeasons = 0;
  // Only count seasons that start during the banner period
  while (currentAbyssStart >= bannerStart && currentAbyssStart <= bannerEnd) {
    abyssSeasons++;
    // Move to next abyss season (16th of next month)
    currentAbyssStart = new Date(
      currentAbyssStart.getFullYear(),
      currentAbyssStart.getMonth() + 1,
      16
    );
  }

  // Apply abyss rewards for the calculated number of seasons
  if (Array.isArray(sourceValue)) {
    sourceValue.forEach((resource) => {
      if (resource.type === "primogem") {
        totalPrimogems += resource.value * abyssSeasons;
      } else if (resource.type === "limitedWishes") {
        totalLimitedWishes += resource.value * abyssSeasons;
      }
    });
  } else {
    if (sourceValue.type === "primogem") {
      totalPrimogems += sourceValue.value * abyssSeasons;
    } else if (sourceValue.type === "limitedWishes") {
      totalLimitedWishes += sourceValue.value * abyssSeasons;
    }
  }
  return { totalPrimogems, totalLimitedWishes };
};

export const handleImaginariumRewards = (
  banner: ApiBanner,
  sourceValue: PrimogemSourceValue
): { totalPrimogems: number; totalLimitedWishes: number } => {
  let totalPrimogems = 0;
  let totalLimitedWishes = 0;

  // Imaginarium runs from the 1st of one month to the 30th/31st of the next
  const bannerStart = new Date(banner.startDate);
  const bannerEnd = new Date(banner.endDate);

  // Find imaginarium seasons that BEGIN during this banner period
  let currentImaginariumStart = new Date(
    bannerStart.getFullYear(),
    bannerStart.getMonth(),
    1
  );

  // If the 1st of this month is before banner start, move to next month
  if (currentImaginariumStart < bannerStart) {
    currentImaginariumStart = new Date(
      bannerStart.getFullYear(),
      bannerStart.getMonth() + 1,
      1
    );
  }

  let imaginariumSeasons = 0;
  // Only count seasons that start during the banner period
  while (
    currentImaginariumStart >= bannerStart &&
    currentImaginariumStart <= bannerEnd
  ) {
    imaginariumSeasons++;
    // Move to next imaginarium season (1st of next month)
    currentImaginariumStart = new Date(
      currentImaginariumStart.getFullYear(),
      currentImaginariumStart.getMonth() + 1,
      1
    );
  }

  // Apply imaginarium rewards for the calculated number of seasons
  if (Array.isArray(sourceValue)) {
    sourceValue.forEach((resource) => {
      if (resource.type === "primogem") {
        totalPrimogems += resource.value * imaginariumSeasons;
      } else if (resource.type === "limitedWishes") {
        totalLimitedWishes += resource.value * imaginariumSeasons;
      }
    });
  } else {
    if (sourceValue.type === "primogem") {
      totalPrimogems += sourceValue.value * imaginariumSeasons;
    } else if (sourceValue.type === "limitedWishes") {
      totalLimitedWishes += sourceValue.value * imaginariumSeasons;
    }
  }
  return { totalPrimogems, totalLimitedWishes };
};

export const initializeBannerConfigurations = (
  bannerData: ApiBanner[]
): Record<BannerId, BannerConfiguration> => {
  return bannerData.reduce(
    (acc, banner) => {
      const bannerConfig: BannerConfiguration = {
        bannerId: banner.id,
        isCurrentBanner: isCurrentBanner(banner),
        isOldBanner: isOldBanner(banner),
        characters: banner.characters.reduce(
          (charAcc, charId) => {
            charAcc[charId] = {
              wishesAllocated: 0,
              maxConstellation: 0, // Constellation defaults to C0
              priority: DEFAULT_PRIORITY,
            };
            return charAcc;
          },
          {} as BannerConfiguration["characters"]
        ),
        weaponBanner: {
          wishesAllocated: 0,
          epitomizedPath: banner.weapons[0], // Which weapon to chart path for
          strategy: "stop", // Stop after getting epitomized weapon, or continue for both
          maxRefinement: 0, // Default to R1 (0 = R1, 4 = R5)
        },
      };

      acc[banner.id] = bannerConfig;
      return acc;
    },
    {} as Record<BannerId, BannerConfiguration>
  );
};
