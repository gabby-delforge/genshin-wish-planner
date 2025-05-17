// genshin-actions.ts
import { useCallback, useMemo } from "react";
import { runOptimization, runSimulation } from "../simulation/wish-simulator";
import {
  AccountStatus,
  Allocations,
  AppMode,
  Banner,
  BannerAllocation,
  SimulationResults,
  VersionId,
} from "../types";
import { ACTIONS } from "./actions";
import { useGenshinDispatch, useGenshinGetState } from "./genshin-context";
import { GenshinActions } from "./genshin-state";
export function useGenshinActions(): GenshinActions {
  const dispatch = useGenshinDispatch();
  const getState = useGenshinGetState();

  // Simulation helpers
  const setIsSimulating = useCallback(
    (simulating: boolean) => {
      dispatch({ type: ACTIONS.SET_IS_SIMULATING, payload: simulating });
    },
    [dispatch]
  );

  const setSimulationProgress = useCallback(
    (progress: number) => {
      dispatch({ type: ACTIONS.SET_SIMULATION_PROGRESS, payload: progress });
    },
    [dispatch]
  );

  const resetAllData = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_DATA });
  }, [dispatch]);

  const setAccountStatus = useCallback(
    (status: AccountStatus) =>
      dispatch({ type: ACTIONS.SET_ACCOUNT_STATUS, payload: status }),
    [dispatch]
  );

  const setBanners = useCallback(
    (banners: Banner[]) =>
      dispatch({ type: ACTIONS.SET_BANNERS, payload: banners }),
    [dispatch]
  );

  const setSimulationCount = useCallback(
    (simulations: number) =>
      dispatch({ type: ACTIONS.SET_SIMULATION_COUNT, payload: simulations }),
    [dispatch]
  );

  const switchMode = useCallback(
    (newMode: AppMode) =>
      dispatch({ type: ACTIONS.SET_MODE, payload: newMode }),
    [dispatch]
  );

  const setBannerAllocation = useCallback(
    (bannerVersion: VersionId, allocation: BannerAllocation) =>
      dispatch({
        type: ACTIONS.UPDATE_BANNER_ALLOCATION,
        payload: { bannerVersion, allocation },
      }),
    [dispatch]
  );

  const setPlaygroundSimulationResults = useCallback(
    (results: SimulationResults) =>
      dispatch({
        type: ACTIONS.SET_PLAYGROUND_SIMULATION_RESULTS,
        payload: { results },
      }),
    [dispatch]
  );

  const setOptimizerSimulationResults = useCallback(
    (results: Allocations[]) =>
      dispatch({
        type: ACTIONS.SET_OPTIMIZER_SIMULATION_RESULTS,
        payload: { results },
      }),
    [dispatch]
  );

  const runPlaygroundSimulation = useCallback(async () => {
    // Get current state
    const currentState = getState();

    // Extract required data
    const {
      banners,
      bannerAllocations: allocations,
      accountStatus: { currentPity, isNextFiftyFiftyGuaranteed },
      simulationCount,
    } = currentState;

    try {
      // Run the simulation
      const results = await runSimulation(
        banners,
        allocations,
        currentPity,
        isNextFiftyFiftyGuaranteed,
        simulationCount,
        setSimulationProgress
      );

      // Update results in state
      dispatch({
        type: ACTIONS.SET_PLAYGROUND_SIMULATION_RESULTS,
        payload: { results },
      });
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      dispatch({ type: ACTIONS.SET_IS_SIMULATING, payload: false });
      dispatch({ type: ACTIONS.SET_SIMULATION_PROGRESS, payload: 100 });
    }
  }, [dispatch, getState, setSimulationProgress]);

  const runOptimizerSimulation = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_IS_SIMULATING, payload: true });
      dispatch({ type: ACTIONS.SET_SIMULATION_PROGRESS, payload: 0 });

      const currentState = getState();

      // Extract data for optimization
      const {
        banners,
        bannerAllocations: allocations,
        accountStatus: { currentPity, isNextFiftyFiftyGuaranteed },
        availableWishes,
        // other optimizer-specific data
      } = currentState;

      // Run optimization (different from regular simulation)
      const results = await runOptimization(
        banners,
        allocations,
        currentPity,
        isNextFiftyFiftyGuaranteed,
        availableWishes,
        setOptimizerSimulationResults,
        setIsSimulating,
        setSimulationProgress
      );

      dispatch({
        type: ACTIONS.SET_OPTIMIZER_SIMULATION_RESULTS,
        payload: { results },
      });
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      dispatch({ type: ACTIONS.SET_IS_SIMULATING, payload: false });
      dispatch({ type: ACTIONS.SET_SIMULATION_PROGRESS, payload: 100 });
    }
  }, [dispatch, getState, setSimulationProgress]);

  return useMemo(
    () => ({
      // State setters
      setAccountStatus,
      setBanners,
      setSimulationCount,

      // Mode functions
      switchMode,

      // Playground functions
      runPlaygroundSimulation,
      setPlaygroundSimulationResults,

      // Optimizer functions
      runOptimizerSimulation,
      setOptimizerSimulationResults,

      // Global functions
      resetAllData,

      // Other functions
      setIsSimulating,
      setSimulationProgress,
      setBannerAllocation,
    }),
    [
      setAccountStatus,
      setBanners,
      setSimulationCount,
      switchMode,
      runPlaygroundSimulation,
      setPlaygroundSimulationResults,
      runOptimizerSimulation,
      setOptimizerSimulationResults,
      resetAllData,
      setIsSimulating,
      setSimulationProgress,
      setBannerAllocation,
    ]
  );
}
