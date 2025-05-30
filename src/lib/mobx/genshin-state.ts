import { makeAutoObservable } from "mobx";
import { initialBanners, PRIMOGEM_SOURCE_VALUES } from "../data";
import { calculateAvailableWishesForBanner } from "../simulation/simulation-utils";
import { runOptimization } from "../simulation/wish-optimizer";
import { runSimulation } from "../simulation/wish-simulator";

import {
  ApiBanner,
  AppMode,
  BannerConfiguration,
  BannerId,
  CharacterId,
  PrimogemSourceKey,
  PrimogemSourcesEnabled,
  PrimogemSourceValues,
  Priority,
  ResourceType,
  SimulationResults,
  WeaponId,
  WishResources,
} from "../types";
import { getCurrentBanner, isPastDate, logNotImplemented } from "../utils";
import { initializeBannerConfigurations } from "./initializers";
import { makeLocalStorage } from "./make-local-storage";
export class GenshinState {
  // Static banner data
  banners: ApiBanner[];

  // Account state
  accountStatusCurrentPity: number = 0;
  accountStatusIsNextFiftyFiftyGuaranteed: boolean = false;
  accountStatusOwnedWishResources: WishResources;
  accountStatusPrimogemSources: PrimogemSourcesEnabled;
  accountStatusExcludeCurrentBannerPrimogemSources: boolean;

  // Simulation
  simulationCount: number;
  isSimulating: boolean;
  simulationProgress: number;

  // Application mode
  mode: AppMode;

  // Optimizer state data
  optimizerSimulationResults: Record<string, BannerConfiguration>[] | null;
  playgroundSimulationResults: SimulationResults | null;

  // Banner configuration
  bannerConfiguration: Record<BannerId, BannerConfiguration>;

  // Computed state
  // _accountCurrentPrimogemValue: number; // @computed
  // _availableWishes: Record<BannerId, number>; // @computed
  // _estimatedNewWishesPerBanner: number; // @computed
  // _remainingWishes: number; // @computed
  // _unallocatedWishes: number; // @computed
  // _areWishesOverAllocated: boolean; // @computed

  // Loading state
  isLoading: boolean;

  // Client state
  isClient: boolean;

  constructor(storageKey: string) {
    this.accountStatusCurrentPity = 0;
    this.accountStatusIsNextFiftyFiftyGuaranteed = false;
    this.accountStatusOwnedWishResources = {
      primogem: 40,
      starglitter: 78,
      limitedWishes: 78,
      stardust: 0,
      genesisCrystal: 0,
      standardWish: 0,
    };
    this.accountStatusPrimogemSources = {
      gameUpdateCompensation: true,
      dailyCommissions: true,
      paimonBargain: true,
      abyssAndTheater: true,
      battlePass: true,
      battlePassGnostic: true,
      blessingOfWelkin: true,
      archonQuest: true,
      storyQuests: true,
      newAchievements: true,
      characterTestRuns: true,
      eventActivities: true,
      hoyolabDailyCheckIn: true,
      hoyolabWebEvents: true,
      livestreamCodes: true,
      newVersionCode: true,
      limitedExplorationRewards: true,
      thankYouGift: true,
    };
    this.accountStatusExcludeCurrentBannerPrimogemSources = true;
    this.banners = initialBanners;
    this.simulationCount = 10000;
    this.isSimulating = false;
    this.simulationProgress = 0;
    this.mode = "playground";
    this.playgroundSimulationResults = null;
    this.optimizerSimulationResults = null;
    this.bannerConfiguration = initializeBannerConfigurations(this.banners);
    this.isLoading = false;
    this.isClient = typeof window !== "undefined";

    makeAutoObservable(this, {}, { autoBind: true });
    makeLocalStorage(this, storageKey, [
      "accountStatusCurrentPity",
      "accountStatusIsNextFiftyFiftyGuaranteed",
      "accountStatusOwnedWishResources",
      "accountStatusPrimogemSources",
      "accountStatusExcludeCurrentBannerPrimogemSources",
      "banners",
      "simulationCount",
      "mode",
      "playgroundSimulationResults",
      "optimizerSimulationResults",
      "bannerConfiguration",
    ]);
  }

  // Autorun: Save to local storage when state changes

  setAccountStatusCurrentPity(pity: number) {
    this.accountStatusCurrentPity = pity;
  }
  setAccountStatusIsNextFiftyFiftyGuaranteed(guaranteed: boolean) {
    this.accountStatusIsNextFiftyFiftyGuaranteed = guaranteed;
  }

  setAccountStatusOwnedWishResources(name: ResourceType, amount: number) {
    if (!this.accountStatusOwnedWishResources) {
      debugger;
    }
    this.accountStatusOwnedWishResources[name] = amount;
  }
  setAccountStatusPrimogemSources(source: PrimogemSourceKey, checked: boolean) {
    this.accountStatusPrimogemSources[source] = checked;
  }

  setAccountStatusExcludeCurrentBannerPrimogemSources(excludeCurrent: boolean) {
    this.accountStatusExcludeCurrentBannerPrimogemSources = excludeCurrent;
  }

  setSimulationCount(simulationCount: number) {
    this.simulationCount = simulationCount;
  }
  setIsSimulating(isSimulating: boolean) {
    this.isSimulating = isSimulating;
  }
  setSimulationProgress(progress: number) {
    this.simulationProgress = progress;
  }

  allocateWishesToCharacter(
    bannerId: BannerId,
    characterId: CharacterId,
    value: number
  ) {
    const bannerConfig =
      this.bannerConfiguration[bannerId].characters[characterId];
    if (!bannerConfig) return;
    bannerConfig.wishesAllocated = value;
  }

  allocateWishesToWeapon(
    bannerId: BannerId,
    weaponId: WeaponId,
    value: number
  ) {
    const bannerConfig = this.bannerConfiguration[bannerId].weapons[weaponId];
    if (!bannerConfig) return;
    bannerConfig.wishesAllocated = value;
  }

  allocateWishesToWeaponBanner(bannerId: BannerId, value: number) {
    const bannerConfig = this.bannerConfiguration[bannerId];
    if (!bannerConfig) return;
    bannerConfig.weaponBanner.wishesAllocated = value;
  }

  setEpitomizedPath(bannerId: BannerId, weaponId: WeaponId) {
    const bannerConfig = this.bannerConfiguration[bannerId];
    if (!bannerConfig) return;
    bannerConfig.weaponBanner.epitomizedPath = weaponId;
  }

  setWeaponBannerStrategy(bannerId: BannerId, value: "stop" | "continue") {
    const bannerConfig = this.bannerConfiguration[bannerId];
    if (!bannerConfig) return;
    bannerConfig.weaponBanner.strategy = value;
  }

  setCharacterPullPriority(
    bannerId: BannerId,
    characterId: CharacterId,
    value: Priority
  ) {
    const bannerConfig =
      this.bannerConfiguration[bannerId].characters[characterId];
    if (!bannerConfig) return;
    bannerConfig.priority = value;
  }

  setWeaponPullPriority(
    bannerId: BannerId,
    weaponId: WeaponId,
    value: Priority
  ) {
    const bannerConfig = this.bannerConfiguration[bannerId].weapons[weaponId];
    if (!bannerConfig) return;
    bannerConfig.priority = value;
  }

  setCharacterMaxConstellation(
    bannerId: BannerId,
    characterId: CharacterId,
    value: number
  ) {
    const bannerConfig =
      this.bannerConfiguration[bannerId].characters[characterId];
    if (!bannerConfig) return;
    bannerConfig.maxConstellation = value;
  }

  setBannerConfiguration(
    bannerVersion: BannerId,
    allocation: BannerConfiguration
  ) {
    this.bannerConfiguration[bannerVersion] = allocation;
  }

  // Mode functions
  switchMode(newMode: AppMode) {
    this.mode = newMode;
  }

  // Playground functions
  async runPlaygroundSimulation() {
    this.setIsSimulating(true);
    this.setSimulationProgress(0);

    const results = await runSimulation(
      this.banners,
      this.bannerConfiguration,
      this.accountStatusCurrentPity,
      this.accountStatusIsNextFiftyFiftyGuaranteed,
      this.simulationCount,
      this.setSimulationProgress
    );

    this.setSimulationProgress(1);
    this.setPlaygroundSimulationResults(results);
    this.setIsSimulating(false);
  }

  setPlaygroundSimulationResults(results: SimulationResults) {
    this.playgroundSimulationResults = results;
  }

  // Optimizer functions
  async runOptimizerSimulation() {
    await runOptimization(
      this.banners,
      this.bannerConfiguration,
      this.accountStatusCurrentPity,
      this.accountStatusIsNextFiftyFiftyGuaranteed,
      this.accountCurrentWishValue,
      this.estimatedNewWishesPerBanner,
      this.setOptimizerSimulationResults,
      this.setIsSimulating,
      this.setSimulationProgress
    );
  }

  setOptimizerSimulationResults(
    results: Record<string, BannerConfiguration>[]
  ) {
    this.optimizerSimulationResults = results;
  }

  // Global functions
  resetAllData() {
    logNotImplemented("resetAllData");
  }

  get accountCurrentWishValue(): number {
    const primoWishes = Math.floor(
      this.accountStatusOwnedWishResources.primogem / 160
    );
    const starglitterWishes = Math.floor(
      this.accountStatusOwnedWishResources.starglitter / 5
    );
    const stardustWishes = Math.floor(
      this.accountStatusOwnedWishResources.stardust / 10
    );
    const genesisCrystalWishes = Math.floor(
      this.accountStatusOwnedWishResources.genesisCrystal / 10
    );
    const limitedWishes = this.accountStatusOwnedWishResources.limitedWishes;

    return (
      primoWishes +
      starglitterWishes +
      limitedWishes +
      stardustWishes +
      genesisCrystalWishes
    );
  }

  get availableWishes(): Record<BannerId, number> {
    // First banner starts with however many wishes are in the user's account
    const bannerMap: Record<BannerId, number> = {};
    let carryOverWishes = this.accountCurrentWishValue;

    // Then accumulate wishes over banners
    for (const banner of this.banners) {
      const isOldBanner = isPastDate(banner.endDate);
      if (isOldBanner) {
        bannerMap[banner.id] = carryOverWishes;
        continue;
      }
      const excludeEarnedWishes =
        this.accountStatusExcludeCurrentBannerPrimogemSources &&
        this.currentBannerId === banner.id;
      const wishesSpentOnCharacters = Object.values(
        this.bannerConfiguration[banner.id].characters
      ).reduce((acc, curr) => acc + curr.wishesAllocated, 0);
      const wishesSpentOnWeapons = Object.values(
        this.bannerConfiguration[banner.id].weapons
      ).reduce((acc, curr) => acc + curr.wishesAllocated, 0);

      const spentWishes = wishesSpentOnCharacters + wishesSpentOnWeapons;
      carryOverWishes = calculateAvailableWishesForBanner(
        banner,
        spentWishes,
        excludeEarnedWishes ? 0 : this.estimatedNewWishesPerBanner,
        carryOverWishes
      );

      bannerMap[banner.id] = carryOverWishes;
    }
    return bannerMap;
  }

  get estimatedNewWishesPerBanner(): number {
    let totalPrimogems = 0;
    let totalLimitedWishes = 0;

    // Process each primogem source
    Object.entries(this.accountStatusPrimogemSources).forEach(
      ([key, isEnabled]) => {
        if (!isEnabled) return;

        const sourceKey = key as keyof PrimogemSourceValues;
        const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];

        if (Array.isArray(sourceValue)) {
          // Handle array of resource values
          sourceValue.forEach((resource) => {
            if (resource.type === "primogem") {
              totalPrimogems += resource.value;
            } else if (resource.type === "limitedWishes") {
              totalLimitedWishes += resource.value;
            }
          });
        } else {
          // Handle single resource value
          if (sourceValue.type === "primogem") {
            totalPrimogems += sourceValue.value;
          } else if (sourceValue.type === "limitedWishes") {
            totalLimitedWishes += sourceValue.value;
          }
        }
      }
    );

    // Convert primogems to wishes (160 primogems per wish)
    const primogemWishes = Math.floor(totalPrimogems / 160);

    // Return total wishes (only count limited wishes for banner pulls)
    return primogemWishes + totalLimitedWishes;
  }

  get currentBannerId(): BannerId {
    const bannerIndex = getCurrentBanner(
      this.banners.map((b) => {
        return { startDate: b.startDate, endDate: b.endDate };
      })
    );
    return this.banners[bannerIndex].id;
  }
}

export const genshinState = new GenshinState("genshin-store");
