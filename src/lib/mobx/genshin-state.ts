import { makeAutoObservable } from "mobx";
import { initialBanners, PRIMOGEM_SOURCE_VALUES } from "../data";
import { runOptimization } from "../simulation/wish-optimizer";
import { runSimulation } from "../simulation/wish-simulator";

import { SIMULATION_COUNT } from "../consts";
import { calculateWishesEarnedFromStarglitter } from "../simulation/starglitter-utils";
import {
  ApiBanner,
  AppMode,
  BannerConfiguration,
  BannerId,
  BannerWishBreakdown,
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
import {
  handleAbyssRewards,
  handleImaginariumRewards,
  initializeBannerConfigurations,
} from "./genshin-state-utils";
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

  resetBanner(id: BannerId) {
    const config = this.bannerConfiguration[id];
    if (!config) return;
    config.weaponBanner.wishesAllocated = 0;
    Object.values(config.characters).forEach(
      (val) => (val.wishesAllocated = 0)
    );
  }

  get accountCurrentWishValue(): number {
    const primoWishes = Math.floor(this.ownedWishResources.primogem / 160);
    const starglitterWishes = Math.floor(
      this.ownedWishResources.starglitter / 5
    );
    // You can only get up to 5 wishes from stardust per month
    const stardustWishes = Math.min(
      5,
      Math.floor(this.ownedWishResources.stardust / 75)
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

  getMaxSpendableWishesFor(
    bannerId: BannerId,
    targetId: CharacterId | WeaponId
  ): { baseWishes: number; starglitterWishes: number } {
    const bannerBreakdown = this.availableWishes[bannerId];
    if (!bannerBreakdown) return { baseWishes: 0, starglitterWishes: 0 };

    return (
      bannerBreakdown.maxWishesPerCharacterOrWeapon[targetId] || {
        baseWishes: 0,
        starglitterWishes: 0,
      }
    );
  }

  get availableWishes(): Record<BannerId, BannerWishBreakdown> {
    // First banner starts with however many wishes are in the user's account
    let runningSum = this.accountCurrentWishValue;

    const bannerMap: Record<BannerId, BannerWishBreakdown> = {};

    // Then accumulate wishes over banners
    for (const banner of this.banners) {
      const bannerBreakdown: BannerWishBreakdown = {
        startingWishes: runningSum,
        wishesSpentOnCharacters: 0,
        wishesSpentOnWeapons: 0,
        earnedWishes: 0,
        starglitterWishes: 0,
        endingWishes: runningSum,
        maxWishesPerCharacterOrWeapon: {},
      };

      const isOldBanner = isPastDate(banner.endDate);
      if (isOldBanner) {
        bannerMap[banner.id] = bannerBreakdown;
        continue;
      }

      const bannerConfig = this.bannerConfiguration[banner.id];
      if (!bannerConfig) {
        bannerMap[banner.id] = bannerBreakdown;
        continue;
      }

      // Subtract spent wishes and add starglitter wishes
      const excludeEarnedWishes =
        this.shouldExcludeCurrentBannerEarnedWishes &&
        this.currentBannerId === banner.id;

      // Calculate wishes spent
      const wishesSpentOnCharacters = Object.values(
        bannerConfig.characters
      ).reduce((acc, curr) => {
        return acc + curr.wishesAllocated;
      }, 0);

      const wishesSpentOnWeapons =
        this.bannerConfiguration[banner.id].weaponBanner.wishesAllocated;

      // Add earned wishes
      if (!excludeEarnedWishes) {
        bannerBreakdown.earnedWishes = this.estimatedNewWishesMap[banner.id];
      }

      bannerBreakdown.wishesSpentOnCharacters = wishesSpentOnCharacters;
      bannerBreakdown.wishesSpentOnWeapons = wishesSpentOnWeapons;

      // Calculate base wishes available for this banner (carryover + earned)
      const baseWishesAvailable = runningSum + bannerBreakdown.earnedWishes;

      // Calculate starglitter conservatively
      const totalAllocated = wishesSpentOnCharacters + wishesSpentOnWeapons;
      let characterWishesForStarglitter: number;
      let weaponWishesForStarglitter: number;

      if (totalAllocated > 0) {
        // Use actual allocations + assign remaining wishes to whichever gives less starglitter
        const remainingWishes = Math.max(
          0,
          baseWishesAvailable - totalAllocated
        );

        if (remainingWishes > 0) {
          // Test both options for remaining wishes using iterative calculation
          const optionA = calculateWishesEarnedFromStarglitter(
            wishesSpentOnCharacters + remainingWishes,
            wishesSpentOnWeapons,
            this.characterPity,
            this.weaponPity
          );
          const optionB = calculateWishesEarnedFromStarglitter(
            wishesSpentOnCharacters,
            wishesSpentOnWeapons + remainingWishes,
            this.characterPity,
            this.weaponPity
          );

          // Choose the option that gives less total starglitter
          if (optionA <= optionB) {
            characterWishesForStarglitter =
              wishesSpentOnCharacters + remainingWishes;
            weaponWishesForStarglitter = wishesSpentOnWeapons;
          } else {
            characterWishesForStarglitter = wishesSpentOnCharacters;
            weaponWishesForStarglitter = wishesSpentOnWeapons + remainingWishes;
          }
        } else {
          // All wishes are allocated - calculate starglitter from base wishes split proportionally
          const charRatio = wishesSpentOnCharacters / totalAllocated;
          const weaponRatio = wishesSpentOnWeapons / totalAllocated;

          characterWishesForStarglitter = Math.floor(
            baseWishesAvailable * charRatio
          );
          weaponWishesForStarglitter = Math.floor(
            baseWishesAvailable * weaponRatio
          );
        }
      } else {
        // No allocation yet, use minimum of all-character vs all-weapon iterative calculation
        const allCharacterStarglitterWishes =
          calculateWishesEarnedFromStarglitter(
            baseWishesAvailable,
            0,
            this.characterPity,
            this.weaponPity
          );
        const allWeaponStarglitterWishes = calculateWishesEarnedFromStarglitter(
          0,
          baseWishesAvailable,
          this.characterPity,
          this.weaponPity
        );

        if (allCharacterStarglitterWishes <= allWeaponStarglitterWishes) {
          characterWishesForStarglitter = baseWishesAvailable;
          weaponWishesForStarglitter = 0;
        } else {
          characterWishesForStarglitter = 0;
          weaponWishesForStarglitter = baseWishesAvailable;
        }
      }

      // Calculate the final starglitter using iterative approach
      bannerBreakdown.starglitterWishes = calculateWishesEarnedFromStarglitter(
        characterWishesForStarglitter,
        weaponWishesForStarglitter,
        this.characterPity,
        this.weaponPity
      );

      // Calculate per-character/weapon max spendable wishes
      const allCharacterIds = Object.keys(bannerConfig.characters);
      const weaponId = bannerConfig.weaponBanner.epitomizedPath;

      // For each character, calculate max spendable
      for (const characterId of allCharacterIds) {
        const otherCharacterWishes = Object.entries(bannerConfig.characters)
          .filter(([id]) => id !== characterId)
          .reduce((acc, [, config]) => acc + config.wishesAllocated, 0);

        const baseWishes = Math.max(
          0,
          baseWishesAvailable -
            bannerConfig.weaponBanner.wishesAllocated -
            otherCharacterWishes
        );

        const wishesEarnedFromStarglitter =
          calculateWishesEarnedFromStarglitter(
            baseWishes,
            0, // No weapon wishes for character calculation
            this.characterPity,
            this.weaponPity
          );

        bannerBreakdown.maxWishesPerCharacterOrWeapon[characterId] = {
          baseWishes: baseWishes,
          starglitterWishes: wishesEarnedFromStarglitter,
        };
      }

      // For weapon, calculate max spendable
      if (weaponId) {
        const baseWishes = Math.max(
          0,
          baseWishesAvailable - wishesSpentOnCharacters
        );

        const starglitterWishes = calculateWishesEarnedFromStarglitter(
          0, // No character wishes for weapon calculation
          baseWishes,
          this.characterPity,
          this.weaponPity
        );

        bannerBreakdown.maxWishesPerCharacterOrWeapon[weaponId] = {
          baseWishes: baseWishes,
          starglitterWishes: starglitterWishes,
        };
      }

      // Update running sum for next banner (carryover = current + earned - spent, NO starglitter carryover)
      runningSum =
        runningSum +
        bannerBreakdown.earnedWishes -
        wishesSpentOnCharacters -
        wishesSpentOnWeapons;
      bannerBreakdown.endingWishes = runningSum;

      bannerMap[banner.id] = bannerBreakdown;
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

      // Process each primogem source
      Object.entries(this.primogemSources).forEach(([key, isEnabled]) => {
        if (!isEnabled) return;

        const sourceKey = key as keyof PrimogemSourceValues;
        const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];

        // Handle abyss and theater specially since they have differing schedules
        if (sourceKey === "abyss") {
          const {
            totalLimitedWishes: wishesGained,
            totalPrimogems: primogemsEarned,
          } = handleAbyssRewards(banner, sourceValue);
          totalLimitedWishes += wishesGained;
          totalPrimogems += primogemsEarned;
          return;
        } else if (sourceKey === "imaginarium") {
          const {
            totalLimitedWishes: wishesGained,
            totalPrimogems: primogemsEarned,
          } = handleImaginariumRewards(banner, sourceValue);
          totalLimitedWishes += wishesGained;
          totalPrimogems += primogemsEarned;
          return;
        }
        // Sources that only apply during the Phase 1 banner
        const oneTimePerVersionSources: (keyof PrimogemSourcesEnabled)[] = [
          "gameUpdateCompensation",
          "newVersionCode",
          "archonQuest",
          "storyQuests",
          "newAchievements",
          "limitedExplorationRewards",
          "battlePass",
          "battlePassGnostic",
        ];

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
        } else {
          // Handle per-version sources (divide by 2 since each banner is half a version)
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
