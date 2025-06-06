// Generated state interface for version `
// Based on PERSISTED_KEYS from GenshinState class

export type BannerId = string;

export type BannerConfiguration = {
  banner: unknown;

  isCurrentBanner: boolean;
  isOldBanner: boolean;

  characters: Record<
    string,
    {
      wishesAllocated: number;
      maxConstellation: number;
      priority: number;
    }
  >;

  weaponBanner: {
    epitomizedPath: string;
    wishesAllocated: number;
    strategy: string;
  };
};

export interface GenshinStateV2 {
  characterPity: number;
  weaponPity: number;
  accountStatusIsNextFiftyFiftyGuaranteed: boolean;
  accountStatusOwnedWishResources: unknown;
  accountStatusPrimogemSources: unknown;
  accountStatusExcludeCurrentBannerPrimogemSources: boolean;
  simulationCount: number;
  mode: unknown;
  playgroundSimulationResults: unknown | null;
  optimizerSimulationResults: Record<string, unknown>[] | null;
  bannerConfiguration: Record<BannerId, BannerConfiguration>;
  banners: unknown[];

  version: 2;
}
