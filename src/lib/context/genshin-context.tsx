"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { GenshinState } from "./types";
import { reducer } from "./reducer";
import { runSimulation as runSimulationFunction } from "@/lib/simulation";
import { loadState, saveState } from "../storage";
import {
  AccountStatus,
  Banner,
  AppMode,
  VersionId,
  CharacterId,
  SimulationResults,
} from "../types";

// Create the context
const GenshinContext = createContext<GenshinState | undefined>(undefined);

// Provider component
export const GenshinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize with loaded state or default
  const [state, dispatch] = useReducer(reducer, loadState());
  const [isLoading, setIsLoading] = React.useState(true);

  // Reset all data function
  const resetAllData = useCallback(() => {
    dispatch({ type: "RESET_DATA" });
  }, []);

  useEffect(() => {
    resetAllData();
  }, []);

  // Debug key handler
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

  // Set loading state
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Then use it in your effect
  useEffect(() => {
    saveState(state);
  }, [state]);

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

  const updateWishAllocation = useCallback(
    (bannerVersion: VersionId, characterId: CharacterId, wishes: number) => {
      dispatch({
        type: "UPDATE_WISH_ALLOCATION",
        payload: { bannerVersion, characterId, wishes },
      });
    },
    []
  );

  const updateWantAllocation = useCallback(
    (
      bannerVersion: VersionId,
      characterId: CharacterId,
      wantFactor: string
    ) => {
      dispatch({
        type: "UPDATE_WANT_ALLOCATION",
        payload: { bannerVersion, characterId, wantFactor },
      });
    },
    []
  );

  // Add the mode-specific simulation functions
  const runPlaygroundSimulation = useCallback(async () => {
    dispatch({ type: "RUN_SIMULATION", payload: { mode: "playground" } });
    await runSimulationFunction({
      ...state,
      setIsSimulating,
      setSimulationProgress,
      setSimulationResults: (results) => {
        dispatch({
          type: "SET_SIMULATION_RESULTS",
          payload: { mode: "playground", results },
        });
      },
    });
  }, [state, setIsSimulating, setSimulationProgress]);

  const runOptimizerSimulation = useCallback(() => {
    dispatch({ type: "RUN_SIMULATION", payload: { mode: "optimizer" } });
    runSimulationFunction({
      ...state,
      setIsSimulating,
      setSimulationProgress,
      mode: "optimizer",
      setSimulationResults: (results) => {
        dispatch({
          type: "SET_SIMULATION_RESULTS",
          payload: { mode: "optimizer", results },
        });
      },
    });
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
        payload: { mode: "optimizer", results },
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
      updateWishAllocation,
      updateWantAllocation,
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
      updateWishAllocation,
      updateWantAllocation,
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
