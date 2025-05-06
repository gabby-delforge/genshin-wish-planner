import { initialBanners } from "../data";
import {
  AccountStatus,
  Banner,
  VersionId,
  AppMode,
  WishAllocation,
  CharacterId,
  SimulationResults,
  WantAllocation,
} from "../types";

export type PlaygroundState = {
  remainingWishes: number;
  unallocatedWishes: number;
  areWishesOverAllocated: boolean;
  wishAllocation: WishAllocation;
  simulationResults: SimulationResults | null;
};

export type OptimizerState = {
  wantAllocation: WantAllocation;
  simulationResults: SimulationResults | null;
};

// Pure state without functions
export type GenshinStateData = {
  // Account state
  accountStatus: AccountStatus;

  // Banner data
  banners: Banner[];

  // Simulation
  simulations: number;
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
  playground: {
    remainingWishes: number;
    unallocatedWishes: number;
    areWishesOverAllocated: boolean;
    wishAllocation: WishAllocation;
    simulationResults: SimulationResults | null;
  };

  // Optimizer state data
  optimizer: {
    wantAllocation: WantAllocation;
    simulationResults: SimulationResults | null;
  };

  // Loading state
  isLoading: boolean;
};

// Functions that operate on the state
export type GenshinFunctions = {
  // State setters
  setAccountStatus: (status: AccountStatus) => void;
  setBanners: (banners: Banner[]) => void;
  setSimulations: (simulations: number) => void;
  setIsSimulating: (simulating: boolean) => void;
  setSimulationProgress: (progress: number) => void;

  // Mode functions
  switchMode: (newMode: AppMode) => void;

  // Playground functions
  runPlaygroundSimulation: () => void;
  updateWishAllocation: (
    bannerVersion: VersionId,
    characterId: CharacterId,
    wishes: number
  ) => void;
  setPlaygroundSimulationResults: (results: SimulationResults) => void;

  // Optimizer functions
  runOptimizerSimulation: () => void;
  updateWantAllocation: (
    bannerVersion: VersionId,
    characterId: CharacterId,
    wantFactor: string
  ) => void;
  setOptimizerSimulationResults: (results: SimulationResults) => void;

  // Global functions
  resetAllData: () => void;
  dispatch: React.Dispatch<GenshinAction>;
};

// Combined type for the context
export type GenshinState = GenshinStateData & GenshinFunctions;

// Initial state should only include the data portion
export const initialStateData: GenshinStateData = {
  accountStatus: {
    currentPity: 0,
    isGuaranteed: false,
    wishResources: {
      primogems: 0,
      starglitter: 0,
      wishes: 0,
    },
    hasWelkin: true,
    hasBattlePass: true,
    addEstimatedWishes: true,
    addExplorationWishes: true,
  },
  banners: initialBanners,
  simulations: 10000,
  isSimulating: false,
  simulationProgress: 0,
  totalAvailableWishes: 0,
  availableWishes: {},
  estimatedNewWishesPerBanner: 0,
  remainingWishes: 0,
  unallocatedWishes: 0,
  areWishesOverAllocated: false,
  mode: "playground",
  playground: {
    remainingWishes: 0,
    unallocatedWishes: 0,
    areWishesOverAllocated: false,
    wishAllocation: initialBanners.reduce((acc, banner) => {
      acc[banner.id] = banner.characters.reduce((charAcc, character) => {
        charAcc[character.id] = 0;
        return charAcc;
      }, {} as Record<CharacterId, number>);
      return acc;
    }, {} as Record<VersionId, Record<CharacterId, number>>),
    simulationResults: null,
  },
  optimizer: {
    wantAllocation: initialBanners.reduce((acc, banner) => {
      acc[banner.id] = banner.characters.reduce((charAcc, character) => {
        charAcc[character.id] = "skip";
        return charAcc;
      }, {} as Record<CharacterId, "must-have" | "want" | "nice-to-have" | "skip">);
      return acc;
    }, {} as Record<VersionId, Record<CharacterId, "must-have" | "want" | "nice-to-have" | "skip">>),
    simulationResults: null,
  },
  isLoading: false,
};

export type GenshinActionType =
  | "SET_MODE"
  | "RESET_DATA"
  | "LOAD_STATE"
  | "SET_ACCOUNT_STATUS"
  | "SET_SIMULATIONS"
  | "SET_BANNERS"
  | "UPDATE_WISH_ALLOCATION"
  | "UPDATE_WANT_ALLOCATION"
  | "SET_SIMULATION_RESULTS"
  | "RUN_SIMULATION";

export interface SetModeAction {
  type: "SET_MODE";
  payload: AppMode;
}

export interface ResetDataAction {
  type: "RESET_DATA";
}

export interface LoadStateAction {
  type: "LOAD_STATE";
  payload: Partial<GenshinState>; // Assuming you want to load part of the state
}

export interface SetAccountStatusAction {
  type: "SET_ACCOUNT_STATUS";
  payload: AccountStatus;
}

export interface SetSimulationsAction {
  type: "SET_SIMULATIONS";
  payload: number; // Assuming this is the count of simulations
}

export interface SetBannersAction {
  type: "SET_BANNERS";
  payload: Banner[]; // Assuming this is an array of banners
}

export interface UpdateWishAllocationAction {
  type: "UPDATE_WISH_ALLOCATION";
  payload: {
    bannerVersion: VersionId;
    characterId: CharacterId;
    wishes: number;
  };
}

export interface UpdateWantAllocationAction {
  type: "UPDATE_WANT_ALLOCATION";
  payload: {
    bannerVersion: VersionId;
    characterId: CharacterId;
    wantFactor: string;
  };
}

export interface SetSimulationResultsAction {
  type: "SET_SIMULATION_RESULTS";
  payload: {
    mode: "playground" | "optimizer";
    results: SimulationResults;
  };
}

export interface RunSimulationAction {
  type: "RUN_SIMULATION";
  payload: {
    mode: "playground" | "optimizer";
  };
}

export type GenshinAction =
  | SetModeAction
  | ResetDataAction
  | LoadStateAction
  | SetAccountStatusAction
  | SetSimulationsAction
  | SetBannersAction
  | UpdateWishAllocationAction
  | UpdateWantAllocationAction
  | SetSimulationResultsAction
  | RunSimulationAction;
