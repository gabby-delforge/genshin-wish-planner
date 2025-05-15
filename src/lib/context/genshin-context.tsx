"use client";
import {
  runOptimization,
  runSimulationFunction,
} from "@/lib/simulation/wish-simulator";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { AccountStatus, AppMode, Banner, SimulationResults } from "../types";
import { reducer } from "./reducer";
import { GenshinState, initialStateData } from "./state";
import { useLocalStorageReducer } from "./useLocalStorageReducer";

// Create the context
const GenshinContext = createContext<GenshinState | undefined>(undefined);

// Provider component
export const GenshinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [state, dispatch] = useLocalStorageReducer(
    reducer,
    initialStateData,
    "genshin-state",
    (success) => {
      if (success) {
        setIsLoading(false);
      } else {
        console.error("Failed to load state from session storage");
      }
    }
  );

  // Reset all data function
  const resetAllData = useCallback(() => {
    dispatch({ type: "RESET_DATA" });
  }, []);

  // Reset all data on render
  useEffect(() => {
    resetAllData();
  }, [resetAllData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "d") {
        resetAllData();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetAllData]);

  /** TODO: This causes the state to be saved right after the initial load; we should prevent that. */
  // useEffect(() => {
  //   if (!isLoading) {
  //     saveState(state);
  //   }
  // }, [state, isLoading]);

  // Function implementations
  const setAccountStatus = useCallback((status: AccountStatus) => {
    dispatch({ type: "SET_ACCOUNT_STATUS", payload: status });
  }, []);

  const setBanners = useCallback((banners: Banner[]) => {
    dispatch({ type: "SET_BANNERS", payload: banners });
  }, []);

  const setSimulations = useCallback((simulations: number) => {
    dispatch({ type: "SET_SIMULATIONS", payload: simulations });
  }, []);

  const setIsSimulating = useCallback(
    (simulating: boolean) => {
      // You might need to add a new action type for this
      // For now, we'll handle it directly in the state
      state.isSimulating = simulating;
    },
    [state]
  );

  const setSimulationProgress = useCallback(
    (progress: number) => {
      // Similar to above
      state.simulationProgress = progress;
    },
    [state]
  );

  const switchMode = useCallback((newMode: AppMode) => {
    dispatch({ type: "SET_MODE", payload: newMode });
  }, []);

  // Add the mode-specific simulation functions
  const runPlaygroundSimulation = useCallback(async () => {
    dispatch({ type: "RUN_SIMULATION", payload: { mode: "playground" } });
    await runSimulationFunction(
      state.banners,
      state.bannerAllocations,
      state.accountStatus.currentPity,
      state.accountStatus.isNextFiftyFiftyGuaranteed,
      state.simulations,
      (results: SimulationResults) => {
        dispatch({
          type: "SET_SIMULATION_RESULTS",
          payload: { mode: "playground", results },
        });
      },
      setIsSimulating,
      setSimulationProgress
    );
  }, [state, setIsSimulating, setSimulationProgress]);

  const runOptimizerSimulation = useCallback(async () => {
    dispatch({ type: "RUN_SIMULATION", payload: { mode: "strategy" } });
    await runOptimization(
      state.banners,
      state.bannerAllocations,
      state.accountStatus.currentPity,
      state.accountStatus.isNextFiftyFiftyGuaranteed,
      state.availableWishes,
      (results: SimulationResults) => {
        dispatch({
          type: "SET_SIMULATION_RESULTS",
          payload: { mode: "playground", results },
        });
      },
      setIsSimulating,
      setSimulationProgress
    );
  }, [state, setIsSimulating, setSimulationProgress]);
  const setPlaygroundSimulationResults = useCallback(
    (results: SimulationResults) => {
      dispatch({
        type: "SET_SIMULATION_RESULTS",
        payload: { mode: "playground", results },
      });
    },
    []
  );

  const setOptimizerSimulationResults = useCallback(
    (results: SimulationResults) => {
      dispatch({
        type: "SET_SIMULATION_RESULTS",
        payload: { mode: "strategy", results },
      });
    },
    []
  );

  const functions = useMemo(
    () => ({
      setAccountStatus,
      setBanners,
      setSimulations,
      setIsSimulating,
      setSimulationProgress,
      switchMode,
      resetAllData,
      dispatch,
      runPlaygroundSimulation,
      runOptimizerSimulation,
      setPlaygroundSimulationResults,
      setOptimizerSimulationResults,
    }),
    [
      setAccountStatus,
      setBanners,
      setSimulations,
      setIsSimulating,
      setSimulationProgress,
      switchMode,
      resetAllData,
      dispatch,
      runPlaygroundSimulation,
      runOptimizerSimulation,
      setPlaygroundSimulationResults,
      setOptimizerSimulationResults,
    ]
  );

  // Combine state and functions for the context value
  const contextValue: GenshinState = {
    ...state,
    ...functions,
  };

  // Render loading state or children
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <GenshinContext.Provider value={contextValue}>
      {children}
    </GenshinContext.Provider>
  );
};

// Hook for using the context
export const useGenshin = () => {
  const context = useContext(GenshinContext);
  if (context === undefined) {
    throw new Error("useGenshin must be used within a GenshinProvider");
  }
  return context;
};
