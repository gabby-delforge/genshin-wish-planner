import { initialBanners } from "../data";
import {
  AccountStatus,
  Allocations,
  AppMode,
  Banner,
  BannerAllocation,
  BannerCharacterAllocation,
  CharacterId,
  DEFAULT_PRIORITY,
  Priority,
  SimulationResults,
  VersionId,
} from "../types";

// Pure state without functions
export type GenshinState = {
  // Account state
  accountStatus: AccountStatus;

  // Banner data
  banners: Banner[];

  // Simulation
  simulationCount: number;
  isSimulating: boolean;
  simulationProgress: number;

  // Global state
  totalAvailableWishes: number;
  availableWishes: Record<VersionId, number>;
  estimatedNewWishesPerBanner: number;
  remainingWishes: number;
  unallocatedWishes: number;
  areWishesOverAllocated: boolean;

  // Application mode
  mode: AppMode;

  // Playground state data
  playgroundRemainingWishes: number;
  playgroundUnallocatedWishes: number;
  playgroundAreWishesOverAllocated: boolean;
  playgroundSimulationResults: SimulationResults | null;

  // Optimizer state data
  optimizerSimulationResults: Allocations[] | null;

  // Combined allocations across both modes
  bannerAllocations: Allocations;

  // Loading state
  isLoading: boolean;
};

// Functions that operate on the state
export type GenshinActions = {
  // State setters
  setAccountStatus: (status: AccountStatus) => void;
  setBanners: (banners: Banner[]) => void;
  setSimulationCount: (simulations: number) => void;
  setIsSimulating: (simulating: boolean) => void;
  setSimulationProgress: (progress: number) => void;
  setBannerAllocation: (
    bannerVersion: VersionId,
    allocation: BannerAllocation
  ) => void;

  // Mode functions
  switchMode: (newMode: AppMode) => void;

  // Playground functions
  runPlaygroundSimulation: () => void;
  setPlaygroundSimulationResults: (results: SimulationResults) => void;

  // Optimizer functions
  runOptimizerSimulation: () => void;
  setOptimizerSimulationResults: (results: Allocations[]) => void;

  // Global functions
  resetAllData: () => void;
};

const initialBannerAllocations: Allocations = initialBanners.reduce(
  (acc, banner) => {
    acc[banner.id] = banner.characters.reduce((charAcc, character) => {
      charAcc[character.id] = {
        wishesAllocated: 0,
        pullPriority: DEFAULT_PRIORITY,
        maxConstellation: 0,
      };
      return charAcc;
    }, {} as Record<CharacterId, BannerCharacterAllocation>);
    return acc;
  },
  {} as Record<VersionId, BannerAllocation>
);

initialBannerAllocations["5.7v1"]["skirk"] = {
  wishesAllocated: 429,
  pullPriority: 2 as Priority,
  maxConstellation: 6,
};
initialBannerAllocations["5.7v1"]["mavuika"] = {
  wishesAllocated: 0,
  pullPriority: 3 as Priority,
  maxConstellation: 0,
};
initialBannerAllocations["5.7v2"]["raiden"] = {
  wishesAllocated: 0,
  pullPriority: 2 as Priority,
  maxConstellation: 0,
};

export const initialStateData: GenshinState = {
  accountStatus: {
    currentPity: 0,
    isNextFiftyFiftyGuaranteed: false,
    ownedWishResources: {
      primogem: 40,
      starglitter: 78,
      limitedWishes: 78,
      stardust: 0,
      genesisCrystal: 0,
      standardWish: 0,
    },
    primogemSources: {
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
    },
    excludeCurrentBannerPrimogemSources: true,
  },
  banners: initialBanners,
  simulationCount: 10000,
  isSimulating: false,
  simulationProgress: 0,
  totalAvailableWishes: 0,
  availableWishes: {},
  estimatedNewWishesPerBanner: 100,
  remainingWishes: 0,
  unallocatedWishes: 0,
  areWishesOverAllocated: false,
  mode: "playground",
  playgroundRemainingWishes: 0,
  playgroundUnallocatedWishes: 0,
  playgroundAreWishesOverAllocated: false,
  playgroundSimulationResults: null,
  optimizerSimulationResults: null,
  bannerAllocations: initialBannerAllocations,
  isLoading: false,
};
