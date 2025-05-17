// genshin-context.tsx
"use client";

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
import { GenshinState, initialStateData } from "./genshin-state";
import { useLocalStorageReducer } from "./useLocalStorageReducer";

type GenshinStateContextType = GenshinState;
type GenshinDispatchContextType = Dispatch<GenshinAction>;
type GenshinGetStateType = () => GenshinState;

const GenshinStateContext =
  createContext<GenshinStateContextType>(initialStateData);
const GenshinDispatchContext = createContext<GenshinDispatchContextType>(() => {
  console.error("Trying to use dispatch before it's initialized");
});
const GenshinGetStateContext = createContext<GenshinGetStateType>(() => {
  console.error("Trying to use getState before it's initialized");
  return initialStateData;
});

export const GenshinProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [state, dispatch] = useLocalStorageReducer(
    GenshinReducer,
    initialStateData,
    "genshin-state",
    (success) => {
      if (success) {
        setIsLoading(false);
      } else {
        console.error("Failed to load state from session storage");
        setIsLoading(false);
      }
    }
  );

  // Use a ref to track current state for getState function
  const stateRef = useRef(state);

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Create a stable getState function that always returns current state
  const getState = useCallback(() => stateRef.current, []);

  if (!isClient) {
    return (
      <GenshinStateContext.Provider value={initialStateData}>
        <GenshinDispatchContext.Provider value={() => {}}>
          <div>{children}</div>
        </GenshinDispatchContext.Provider>
      </GenshinStateContext.Provider>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <GenshinStateContext.Provider value={state}>
      <GenshinDispatchContext.Provider value={dispatch}>
        <GenshinGetStateContext.Provider value={getState}>
          {children}
        </GenshinGetStateContext.Provider>
      </GenshinDispatchContext.Provider>
    </GenshinStateContext.Provider>
  );
};

export const useGenshinState = () => {
  return useContext(GenshinStateContext);
};

export const useGenshinDispatch = () => {
  return useContext(GenshinDispatchContext);
};
export const useGenshinGetState = () => useContext(GenshinGetStateContext);
