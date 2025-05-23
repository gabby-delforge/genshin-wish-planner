"use client";

import { useContext } from "react";
import {
  GenshinContext,
  GenshinDispatchContext,
  GenshinGetStateContext,
} from "./genshin-context";

// Hook to get the state and loading status
export const useGenshinState = () => {
  const context = useContext(GenshinContext);
  if (context === undefined) {
    throw new Error("useGenshinState must be used within a GenshinProvider");
  }
  return context;
};

// Convenience hook for just the dispatch function
export const useGenshinDispatch = () => {
  const dispatch = useContext(GenshinDispatchContext);
  if (dispatch === undefined) {
    throw new Error("useGenshinDispatch must be used within a GenshinProvider");
  }
  return dispatch;
};

// Convenience hook for just the getState function
export const useGenshinGetState = () => {
  const getState = useContext(GenshinGetStateContext);
  if (getState === undefined) {
    throw new Error("useGenshinGetState must be used within a GenshinProvider");
  }
  return getState;
};

// Convenience hook to check if state is loaded
export const useGenshinIsLoaded = () => {
  const { isLoading } = useGenshinState();
  return !isLoading;
};
