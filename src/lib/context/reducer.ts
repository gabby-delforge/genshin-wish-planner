import {
  calculateAvailableWishesForBanners,
  calculateTotalAvailableWishes,
} from "../simulation";
import { GenshinAction, GenshinStateData, initialStateData } from "./types";

export function reducer(
  state: GenshinStateData,
  action: GenshinAction
): GenshinStateData {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "RESET_DATA":
      return initialStateData;
    case "LOAD_STATE":
      return { ...state, ...action.payload };
    case "SET_ACCOUNT_STATUS":
      const newAccountStatus = action.payload;
      const newTotalAvailableWishes = calculateTotalAvailableWishes(
        newAccountStatus.wishResources.primogems,
        newAccountStatus.wishResources.starglitter,
        newAccountStatus.wishResources.wishes
      );

      return {
        ...state,
        accountStatus: newAccountStatus,
        totalAvailableWishes: newTotalAvailableWishes,
      };
    case "SET_SIMULATIONS":
      return { ...state, simulations: action.payload };
    case "SET_BANNERS":
      const newBanners = action.payload;
      const newAvailableWishes = calculateAvailableWishesForBanners(
        newBanners,
        state.playground.wishAllocation,
        state.totalAvailableWishes,
        state.estimatedNewWishesPerBanner
      );

      return {
        ...state,
        banners: newBanners,
        availableWishes: newAvailableWishes,
      };
    case "UPDATE_WISH_ALLOCATION":
      const { bannerVersion, characterId, wishes } = action.payload;
      const updatedWishAllocation = {
        ...state.playground.wishAllocation,
        [bannerVersion]: {
          ...state.playground.wishAllocation[bannerVersion],
          [characterId]: wishes,
        },
      };

      return {
        ...state,
        playground: {
          ...state.playground,
          wishAllocation: updatedWishAllocation,
        },
      };
    case "UPDATE_WANT_ALLOCATION":
      const {
        bannerVersion: bv,
        characterId: cid,
        wantFactor,
      } = action.payload;
      const updatedWantAllocation = {
        ...state.optimizer.wantAllocation,
        [bv]: {
          ...state.optimizer.wantAllocation[bv],
          [cid]: wantFactor,
        },
      };

      return {
        ...state,
        optimizer: {
          ...state.optimizer,
          wantAllocation: updatedWantAllocation,
        },
      };
    case "SET_SIMULATION_RESULTS":
      const { mode, results } = action.payload;
      if (mode === "playground") {
        return {
          ...state,
          isSimulating: false,
          playground: {
            ...state.playground,
            simulationResults: results,
          },
        };
      } else if (mode === "optimizer") {
        return {
          ...state,
          isSimulating: false,
          optimizer: {
            ...state.optimizer,
            simulationResults: results,
          },
        };
      }
      return state;
    case "RUN_SIMULATION":
      return {
        ...state,
        isSimulating: true,
      };
    default:
      return state;
  }
}
