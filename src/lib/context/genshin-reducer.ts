import {
  calculateAvailableWishesForBanners,
  calculateEstimatedWishes,
  calculateTotalAvailableWishes,
} from "../simulation/simulation";
import { GenshinAction } from "./actions";
import { GenshinState, initialStateData } from "./genshin-state";

export function GenshinReducer(
  state: GenshinState,
  action: GenshinAction
): GenshinState {
  switch (action.type) {
    case "INIT":
      const estimatedNewWishesPerBanner = calculateEstimatedWishes(
        state.accountStatus
      );
      return {
        ...state,
        mode: "playground",
        banners: [],
        bannerAllocations: {},
        availableWishes: {},
        estimatedNewWishesPerBanner: estimatedNewWishesPerBanner,
      };
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "RESET_DATA":
      return initialStateData;
    case "LOAD_STATE":
      return { ...state, ...action.payload };
    case "SET_ACCOUNT_STATUS": {
      const newAccountStatus = action.payload;
      const newTotalAvailableWishes =
        calculateTotalAvailableWishes(newAccountStatus);
      const estimatedNewWishesPerBanner =
        calculateEstimatedWishes(newAccountStatus);
      console.log(estimatedNewWishesPerBanner);
      return {
        ...state,
        accountStatus: newAccountStatus,
        totalAvailableWishes: newTotalAvailableWishes,
        estimatedNewWishesPerBanner: estimatedNewWishesPerBanner,
        availableWishes: calculateAvailableWishesForBanners(
          state.banners,
          state.bannerAllocations,
          newTotalAvailableWishes,
          estimatedNewWishesPerBanner
        ),
      };
    }
    case "SET_SIMULATIONS":
      return { ...state, simulationCount: action.payload };
    case "SET_BANNERS":
      const newBanners = action.payload;
      const newAvailableWishes = calculateAvailableWishesForBanners(
        newBanners,
        state.bannerAllocations,
        state.totalAvailableWishes,
        state.estimatedNewWishesPerBanner
      );

      return {
        ...state,
        banners: newBanners,
        availableWishes: newAvailableWishes,
      };
    case "UPDATE_BANNER_ALLOCATION":
      const { bannerVersion, allocation } = action.payload;
      const updatedBannerAllocation = {
        ...state.bannerAllocations,
        [bannerVersion]: allocation,
      };

      return {
        ...state,
        bannerAllocations: updatedBannerAllocation,
        availableWishes: calculateAvailableWishesForBanners(
          state.banners,
          updatedBannerAllocation,
          state.totalAvailableWishes,
          state.estimatedNewWishesPerBanner
        ),
      };

    case "SET_PLAYGROUND_SIMULATION_RESULTS":
      return {
        ...state,
        isSimulating: false,
        playgroundSimulationResults: action.payload.results,
      };
    case "SET_OPTIMIZER_SIMULATION_RESULTS":
      return {
        ...state,
        isSimulating: false,
        optimizerSimulationResults: action.payload.results,
      };
    default:
      return state;
  }
}
