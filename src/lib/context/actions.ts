import {
  AccountStatus,
  Allocations,
  AppMode,
  Banner,
  BannerAllocation,
  SimulationResults,
  VersionId,
} from "../types";
import { GenshinState } from "./genshin-state";

export enum ACTIONS {
  INIT = "INIT",
  LOAD_STATE = "LOAD_STATE",
  RESET_DATA = "RESET_DATA",
  SET_ACCOUNT_STATUS = "SET_ACCOUNT_STATUS",
  SET_BANNERS = "SET_BANNERS",
  SET_IS_SIMULATING = "SET_IS_SIMULATING",
  SET_MODE = "SET_MODE",
  SET_SIMULATION_PROGRESS = "SET_SIMULATION_PROGRESS",
  SET_PLAYGROUND_SIMULATION_RESULTS = "SET_PLAYGROUND_SIMULATION_RESULTS",
  SET_OPTIMIZER_SIMULATION_RESULTS = "SET_OPTIMIZER_SIMULATION_RESULTS",
  SET_SIMULATION_COUNT = "SET_SIMULATIONS",
  UPDATE_BANNER_ALLOCATION = "UPDATE_BANNER_ALLOCATION",
}

export type GenshinAction =
  | {
      type: ACTIONS.INIT;
    }
  | {
      type: ACTIONS.LOAD_STATE;
      payload: Partial<GenshinState>; // Assuming you want to load part of the state
    }
  | {
      type: ACTIONS.RESET_DATA;
    }
  | {
      type: ACTIONS.SET_ACCOUNT_STATUS;
      payload: AccountStatus;
    }
  | {
      type: ACTIONS.SET_BANNERS;
      payload: Banner[]; // Assuming this is an array of banners
    }
  | {
      type: ACTIONS.SET_IS_SIMULATING;
      payload: boolean;
    }
  | {
      type: ACTIONS.SET_MODE;
      payload: AppMode;
    }
  | {
      type: ACTIONS.SET_SIMULATION_PROGRESS;
      payload: number;
    }
  | {
      type: ACTIONS.SET_PLAYGROUND_SIMULATION_RESULTS;
      payload: {
        results: SimulationResults;
      };
    }
  | {
      type: ACTIONS.SET_OPTIMIZER_SIMULATION_RESULTS;
      payload: {
        results: Allocations[];
      };
    }
  | {
      type: ACTIONS.SET_SIMULATION_COUNT;
      payload: number; // Assuming this is the count of simulations
    }
  | {
      type: ACTIONS.UPDATE_BANNER_ALLOCATION;
      payload: {
        bannerVersion: VersionId;
        allocation: BannerAllocation;
      };
    };

export type GenshinActionType = GenshinAction["type"];
