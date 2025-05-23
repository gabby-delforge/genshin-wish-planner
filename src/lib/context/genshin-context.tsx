"use client";
import { omit } from "lodash";

import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GenshinAction } from "./actions";
import { GenshinReducer } from "./genshin-reducer";
import {
  GenshinState,
  initialStateData,
  STORAGE_OMIT_KEYS,
} from "./genshin-state";
import { useLocalStorageReducer } from "./useLocalStorageReducer";

// Add loading state to the context type
type GenshinContextType = GenshinState & {
  isLoading: boolean;
};

type GenshinDispatchContextType = Dispatch<GenshinAction>;
type GenshinGetStateType = () => GenshinState;

// Create contexts with proper types
export const GenshinContext = createContext<GenshinContextType>({
  ...initialStateData,
  isLoading: true,
});

export const GenshinDispatchContext = createContext<GenshinDispatchContextType>(
  () => {
    console.error("Trying to use dispatch before it's initialized");
  }
);

export const GenshinGetStateContext = createContext<GenshinGetStateType>(() => {
  console.error("Trying to use getState before it's initialized");
  return initialStateData;
});

export const GenshinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Track loading state
  const [isLoading, setIsLoading] = useState(true);

  // For pre-hydration rendering
  const [isMounted, setIsMounted] = useState(false);

  // Effect to handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Callback for when localStorage data is loaded
  const onLoadFromLocalStorage = useCallback((success: boolean) => {
    if (!success) {
      console.error("Failed to load state from localStorage");
    }
    console.log("Successfully loaded state from localStorage");
    // DEBUG Only: Wait 1.5s after
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const [state, dispatch] = useLocalStorageReducer(
    GenshinReducer,
    initialStateData,
    "genshin-state",
    onLoadFromLocalStorage,
    (s) => JSON.stringify(omit(s, STORAGE_OMIT_KEYS))
  );

  // Use a ref to track current state for getState function
  const stateRef = useRef(state);

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Create a stable getState function that always returns current state
  const getState = useCallback(() => stateRef.current, []);

  // During SSR, provide initial state with loading=true
  if (!isMounted) {
    return (
      <GenshinContext.Provider value={{ ...initialStateData, isLoading: true }}>
        <GenshinDispatchContext.Provider value={() => {}}>
          <GenshinGetStateContext.Provider value={() => initialStateData}>
            {children}
          </GenshinGetStateContext.Provider>
        </GenshinDispatchContext.Provider>
      </GenshinContext.Provider>
    );
  }

  // After mounting on the client, provide the actual state
  return (
    <GenshinContext.Provider value={{ ...state, isLoading }}>
      <GenshinDispatchContext.Provider value={dispatch}>
        <GenshinGetStateContext.Provider value={getState}>
          {children}
        </GenshinGetStateContext.Provider>
      </GenshinDispatchContext.Provider>
    </GenshinContext.Provider>
  );
};

export const useGenshinState = () => {
  return useContext(GenshinContext);
};

export const useGenshinDispatch = () => {
  return useContext(GenshinDispatchContext);
};

export const useGenshinGetState = () => useContext(GenshinGetStateContext);
