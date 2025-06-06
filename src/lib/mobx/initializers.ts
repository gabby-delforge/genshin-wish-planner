import {
  ApiBanner,
  BannerConfiguration,
  BannerId,
  DEFAULT_PRIORITY,
} from "../types";
import { isCurrentBanner, isOldBanner } from "../utils";

export const initializeBannerConfigurations = (
  bannerData: ApiBanner[]
): Record<BannerId, BannerConfiguration> => {
  return bannerData.reduce((acc, banner) => {
    const bannerConfig: BannerConfiguration = {
      bannerId: banner.id,
      isCurrentBanner: isCurrentBanner(banner),
      isOldBanner: isOldBanner(banner),
      characters: banner.characters.reduce((charAcc, charId) => {
        charAcc[charId] = {
          wishesAllocated: 0,
          maxConstellation: 6,
          priority: DEFAULT_PRIORITY,
        };
        return charAcc;
      }, {} as BannerConfiguration["characters"]),
      weaponBanner: {
        wishesAllocated: 0,
        epitomizedPath: banner.weapons[0], // Which weapon to chart path for
        strategy: "stop", // Stop after getting epitomized weapon, or continue for both
        maxRefinement: 1, // Default to R1 (0 = R1, 4 = R5)
      },
    };

    acc[banner.id] = bannerConfig;
    return acc;
  }, {} as Record<BannerId, BannerConfiguration>);
};
