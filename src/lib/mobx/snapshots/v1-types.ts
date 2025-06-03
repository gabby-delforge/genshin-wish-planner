// Generated state interface for version `
// Based on PERSISTED_KEYS from GenshinState class
export interface GenshinStateV1 {
  accountStatusCurrentPity: number;
  weaponPity: number;
  accountStatusIsNextFiftyFiftyGuaranteed: boolean;
  accountStatusOwnedWishResources: unknown;
  accountStatusPrimogemSources: unknown;
  accountStatusExcludeCurrentBannerPrimogemSources: boolean;
  simulationCount: number;
  mode: unknown;
  playgroundSimulationResults: unknown | null;
  optimizerSimulationResults: Record<string, unknown>[] | null;
  bannerConfiguration: Record<string, unknown>;
  banners: unknown[];

  version: 1;
}
