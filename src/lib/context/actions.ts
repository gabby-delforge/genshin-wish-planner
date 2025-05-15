import {
  AccountStatus,
  Banner,
  VersionId,
  AppMode,
  SimulationResults,
  BannerAllocation,
} from "../types";
import { GenshinState } from "./state";

export type GenshinActionType =
  | "SET_MODE"
  | "RESET_DATA"
  | "LOAD_STATE"
  | "SET_ACCOUNT_STATUS"
  | "SET_SIMULATIONS"
  | "SET_BANNERS"
  | "UPDATE_BANNER_ALLOCATION"
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

export interface UpdateBannerAllocationAction {
  type: "UPDATE_BANNER_ALLOCATION";
  payload: {
    bannerVersion: VersionId;
    allocation: BannerAllocation;
  };
}

export interface SetSimulationResultsAction {
  type: "SET_SIMULATION_RESULTS";
  payload: {
    mode: "playground" | "strategy";
    results: SimulationResults;
  };
}

export interface RunSimulationAction {
  type: "RUN_SIMULATION";
  payload: {
    mode: "playground" | "strategy";
  };
}

export interface InitAction {
  type: "INIT";
}

export type GenshinAction =
  | SetModeAction
  | ResetDataAction
  | LoadStateAction
  | SetAccountStatusAction
  | SetSimulationsAction
  | SetBannersAction
  | UpdateBannerAllocationAction
  | SetSimulationResultsAction
  | RunSimulationAction
  | InitAction;
