import {
  calculateAvailableWishesForBanners,
  calculateEstimatedWishes,
  calculateTotalAvailableWishes,
} from "../simulation/simulation";
import { GenshinAction } from "./actions";
import { GenshinStateData, initialStateData } from "./state";

export function reducer(
  state: GenshinStateData,
  action: GenshinAction
): GenshinStateData {
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
      const newTotalAvailableWishes = calculateTotalAvailableWishes(
        newAccountStatus.ownedWishResources.primogems,
        newAccountStatus.ownedWishResources.starglitter,
        newAccountStatus.ownedWishResources.wishes
      );
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
      return { ...state, simulations: action.payload };
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

    case "SET_SIMULATION_RESULTS":
      const { mode, results } = action.payload;
      if (mode === "playground") {
        return {
          ...state,
          isSimulating: false,
          playgroundSimulationResults: results,
        };
      } else if (mode === "strategy") {
        return {
          ...state,
          isSimulating: false,
          optimizerSimulationResults: results,
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
