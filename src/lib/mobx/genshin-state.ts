import { makeAutoObservable } from "mobx";
import { initialBanners, PRIMOGEM_SOURCE_VALUES } from "../data";
import { calculateAvailableWishesForBanner } from "../simulation/simulation-utils";
import { runOptimization } from "../simulation/wish-optimizer";
import { runSimulation } from "../simulation/wish-simulator";

import { SIMULATION_COUNT } from "../consts";
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
import { clamp, getCurrentBanner, isPastDate } from "../utils";
import { initializeBannerConfigurations } from "./initializers";
import { STATE_VERSION } from "./state-version";

export class GenshinState {
  // Static banner data
  banners: ApiBanner[];

  // Account state
  characterPity: number = 0;
  weaponPity: number = 0;

  isNextCharacterFeaturedGuaranteed: boolean = false;
  isCapturingRadianceActive: boolean = false;
  isNextWeaponFeaturedGuaranteed: boolean = false;

  ownedWishResources: WishResources;
  primogemSources: PrimogemSourcesEnabled;
  shouldExcludeCurrentBannerEarnedWishes: boolean;

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

  // Loading state
  isLoading: boolean;

  // Client state
  isClient: boolean;

  // State version
  version: number = STATE_VERSION;

  // Storage config - these can't be computed values
  PERSISTED_KEYS: (keyof GenshinState)[] = [
    "characterPity",
    "weaponPity",
    "isNextCharacterFeaturedGuaranteed",
    "isCapturingRadianceActive",
    "isNextWeaponFeaturedGuaranteed",
    "ownedWishResources",
    "primogemSources",
    "shouldExcludeCurrentBannerEarnedWishes",
    "mode",
    "playgroundSimulationResults",
    "optimizerSimulationResults",
    "bannerConfiguration",
    "version",
  ];

  constructor() {
    this.characterPity = 0;
    this.isNextCharacterFeaturedGuaranteed = false;
    this.ownedWishResources = {
      primogem: 0,
      starglitter: 0,
      limitedWishes: 0,
      stardust: 0,
      genesisCrystal: 0,
      standardWish: 0,
    };
    this.primogemSources = {
      gameUpdateCompensation: true,
      dailyCommissions: true,
      paimonBargain: true,
      abyss: true,
      imaginarium: true,
      battlePass: true,
      battlePassGnostic: true,
      welkinMoon: true,
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
    };
    this.shouldExcludeCurrentBannerEarnedWishes = false;
    this.banners = initialBanners;
    this.simulationCount = SIMULATION_COUNT;
    this.isSimulating = false;
    this.simulationProgress = 0;
    this.mode = "playground";
    this.playgroundSimulationResults = null;
    this.optimizerSimulationResults = null;
    this.bannerConfiguration = initializeBannerConfigurations(this.banners);
    this.isClient = typeof window !== "undefined";

    this.isLoading = true;

    makeAutoObservable(this, {}, { autoBind: true });
  }

  setCharacterPity(pity: number) {
    this.characterPity = pity;
  }

  setWeaponPity(pity: number) {
    this.weaponPity = pity;
  }

  setIsNextCharacterFeaturedGuaranteed(guaranteed: boolean) {
    this.isNextCharacterFeaturedGuaranteed = guaranteed;
  }

  setIsCapturingRadianceActive(active: boolean) {
    this.isCapturingRadianceActive = active;
  }

  setIsNextWeaponFeaturedGuaranteed(guaranteed: boolean) {
    this.isNextWeaponFeaturedGuaranteed = guaranteed;
  }

  setAccountStatusOwnedWishResources(name: ResourceType, amount: number) {
    this.ownedWishResources[name] = amount;
  }
  setAccountStatusPrimogemSources(source: PrimogemSourceKey, checked: boolean) {
    this.primogemSources[source] = checked;
  }

  setAccountStatusExcludeCurrentBannerPrimogemSources(excludeCurrent: boolean) {
    this.shouldExcludeCurrentBannerEarnedWishes = excludeCurrent;
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

  allocateWishesToWeapon(bannerId: BannerId, value: number) {
    const bannerConfig = this.bannerConfiguration[bannerId].weaponBanner;
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

  setWeaponBannerMaxRefinement(bannerId: BannerId, value: number) {
    const bannerConfig = this.bannerConfiguration[bannerId];
    if (!bannerConfig) return;
    bannerConfig.weaponBanner.maxRefinement = clamp(value, 0, 4);
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

  setCharacterMaxConstellation(
    bannerId: BannerId,
    characterId: CharacterId,
    value: number
  ) {
    const bannerConfig =
      this.bannerConfiguration[bannerId].characters[characterId];
    if (!bannerConfig) return;
    bannerConfig.maxConstellation = clamp(value, 0, 6);
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
      this.characterPity,
      this.isNextCharacterFeaturedGuaranteed,
      this.isCapturingRadianceActive,
      this.weaponPity,
      this.isNextWeaponFeaturedGuaranteed,
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
      this.characterPity,
      this.isNextCharacterFeaturedGuaranteed,
      this.isCapturingRadianceActive,
      this.weaponPity,
      this.isNextWeaponFeaturedGuaranteed,
      this.accountCurrentWishValue,
      this.estimatedNewWishesPerBanner[0], // TODO: Use the more granular option; we just use the low estimate for now
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

  get accountCurrentWishValue(): number {
    const primoWishes = Math.floor(this.ownedWishResources.primogem / 160);
    const starglitterWishes = Math.floor(
      this.ownedWishResources.starglitter / 5
    );
    // You can only get up to 5 wishes from stardust per month
    const stardustWishes = Math.min(
      5,
      Math.floor(this.ownedWishResources.stardust / 10)
    );
    const genesisCrystalWishes = Math.floor(
      this.ownedWishResources.genesisCrystal / 160
    );
    const limitedWishes = this.ownedWishResources.limitedWishes;

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
      const bannerConfig = this.bannerConfiguration[banner.id];
      if (!bannerConfig) continue;

      const excludeEarnedWishes =
        this.shouldExcludeCurrentBannerEarnedWishes &&
        this.currentBannerId === banner.id;
      const wishesSpentOnCharacters = Object.values(
        this.bannerConfiguration[banner.id].characters
      ).reduce((acc, curr) => acc + curr.wishesAllocated, 0);
      const wishesSpentOnWeapons =
        this.bannerConfiguration[banner.id].weaponBanner.wishesAllocated;

      const spentWishes = wishesSpentOnCharacters + wishesSpentOnWeapons;

      carryOverWishes = calculateAvailableWishesForBanner(
        banner,
        spentWishes,
        excludeEarnedWishes ? 0 : this.estimatedNewWishesMap[banner.id],
        carryOverWishes
      );

      bannerMap[banner.id] = carryOverWishes;
    }
    return bannerMap;
  }

  /**
   * Calculates estimated new wishes available for each banner based on enabled primogem sources.
   * For recurring sources (abyss, imaginarium), only counts rewards from seasons that BEGIN during
   * the banner period to avoid double-counting rewards from seasons that started in previous banners.
   * Also includes masterless stardust wishes accumulated from previous banners.
   * Returns a map of banner ID to total estimated wishes (primogems converted at 160:1 ratio + limited wishes).
   */
  get estimatedNewWishesMap(): Record<string, number> {
    const bannerMap: Record<string, number> = {};

    for (const banner of this.banners) {
      let totalPrimogems = 0;
      let totalLimitedWishes = 0;

      // Check if this is the first banner of a version (ends with "v1")
      const isFirstBannerOfVersion = banner.id.endsWith("v1");

      // Add masterless stardust wishes from accumulated 3-star/4-star pulls
      // Each subsequent banner gets +5 wishes from stardust accumulation
      const stardustWishes = 5;
      totalLimitedWishes += stardustWishes;

      // Process each primogem source
      Object.entries(this.primogemSources).forEach(([key, isEnabled]) => {
        if (!isEnabled) return;

        const sourceKey = key as keyof PrimogemSourceValues;
        const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];

        // Handle abyss and theater specially since they have differing schedules
        if (sourceKey === "abyss") {
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
          while (
            currentAbyssStart >= bannerStart &&
            currentAbyssStart <= bannerEnd
          ) {
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
          return;
        } else if (sourceKey === "imaginarium") {
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
          return;
        }

        // Define source categories
        const perVersionSources = [
          "dailyCommissions",
          "welkinMoon",
          "battlePass",
          "battlePassGnostic",
          "paimonBargain",
        ];
        
        const oneTimePerVersionSources = [
          "gameUpdateCompensation",
          "newVersionCode",
          "archonQuest",
          "storyQuests",
          "newAchievements",
          "limitedExplorationRewards",
        ];

        // Handle per-version sources (divide by 2 since each banner is half a version)
        if (perVersionSources.includes(sourceKey)) {
          if (Array.isArray(sourceValue)) {
            sourceValue.forEach((resource) => {
              if (resource.type === "primogem") {
                totalPrimogems += Math.floor(resource.value / 2);
              } else if (resource.type === "limitedWishes") {
                totalLimitedWishes += resource.value / 2;
              }
            });
          } else {
            if (sourceValue.type === "primogem") {
              totalPrimogems += Math.floor(sourceValue.value / 2);
            } else if (sourceValue.type === "limitedWishes") {
              totalLimitedWishes += sourceValue.value / 2;
            }
          }
          return;
        }

        // Handle one-time per-version sources (only apply to first banner of version)
        if (oneTimePerVersionSources.includes(sourceKey)) {
          if (!isFirstBannerOfVersion) return;
          
          if (Array.isArray(sourceValue)) {
            sourceValue.forEach((resource) => {
              if (resource.type === "primogem") {
                totalPrimogems += resource.value;
              } else if (resource.type === "limitedWishes") {
                totalLimitedWishes += resource.value;
              }
            });
          } else {
            if (sourceValue.type === "primogem") {
              totalPrimogems += sourceValue.value;
            } else if (sourceValue.type === "limitedWishes") {
              totalLimitedWishes += sourceValue.value;
            }
          }
          return;
        }

        // Handle per-banner sources (keep as-is)
        if (Array.isArray(sourceValue)) {
          sourceValue.forEach((resource) => {
            if (resource.type === "primogem") {
              totalPrimogems += resource.value;
            } else if (resource.type === "limitedWishes") {
              totalLimitedWishes += resource.value;
            }
          });
        } else {
          if (sourceValue.type === "primogem") {
            totalPrimogems += sourceValue.value;
          } else if (sourceValue.type === "limitedWishes") {
            totalLimitedWishes += sourceValue.value;
          }
        }
      });

      // Convert primogems to wishes (160 primogems per wish)
      const primogemWishes = Math.floor(totalPrimogems / 160);

      // Return total wishes (primogem wishes + limited wishes + stardust wishes)
      bannerMap[banner.id] = primogemWishes + totalLimitedWishes;
    }

    return bannerMap;
  }

  // Returns a range of estimated wishes to be earned each banner: [low, high]
  // Banners can span 1 or 2 abyss cycles and 1 or 2 imaginarium cycles.
  get estimatedNewWishesPerBanner(): [number, number] {
    let lowPrimogemEstimate = 0;
    let highPrimogemEstimate = 0;

    let totalPrimogems = 0;
    let totalLimitedWishes = 0;

    // Process each primogem source
    Object.entries(this.primogemSources).forEach(([key, isEnabled]) => {
      if (!isEnabled) return;

      const sourceKey = key as keyof PrimogemSourceValues;
      const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];
      // Handle abyss and theater specially since they have differing schedules
      if (sourceKey === "abyss" || sourceKey === "imaginarium") {
        // Apply abyss rewards for the calculated number of seasons
        if (Array.isArray(sourceValue)) {
          sourceValue.forEach((resource) => {
            if (resource.type === "primogem") {
              lowPrimogemEstimate += resource.value; // 1 season
              highPrimogemEstimate += resource.value * 2; // 2 seasons
            } else if (resource.type === "limitedWishes") {
              lowPrimogemEstimate += resource.value * 160; // 1 season
              highPrimogemEstimate += resource.value * 160 * 2; // 2 seasons
            }
          });
        } else {
          if (sourceValue.type === "primogem") {
            lowPrimogemEstimate += sourceValue.value;
            highPrimogemEstimate += sourceValue.value * 2;
          } else if (sourceValue.type === "limitedWishes") {
            lowPrimogemEstimate += sourceValue.value * 160;
            highPrimogemEstimate += sourceValue.value * 160 * 2;
          }
        }
        return;
      }

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
    });

    // Convert primogems to wishes (160 primogems per wish)
    const baseWishes = Math.floor(totalPrimogems / 160) + totalLimitedWishes;

    // Return total wishes (only count limited wishes for banner pulls)
    return [
      baseWishes + Math.floor(lowPrimogemEstimate / 160),
      baseWishes + Math.floor(highPrimogemEstimate / 160),
    ];
  }

  get currentBannerId(): BannerId {
    const bannerIndex = getCurrentBanner(
      this.banners.map((b) => {
        return { startDate: b.startDate, endDate: b.endDate };
      })
    );
    return this.banners[bannerIndex].id;
  }

  /**
   * Returns the current state shape for migration system inspection.
   * Automatically extracts the shape from the keys array passed to makeLocalStorage.
   */
  getStateShape() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shape: Partial<Record<keyof this, any>> = {};
    for (const key of this.PERSISTED_KEYS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shape[key] = (this as any)[key];
    }
    return shape;
  }
}

export const genshinState = new GenshinState();
