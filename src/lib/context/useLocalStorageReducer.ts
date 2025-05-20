"use client";
import {
  Dispatch,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { GenshinState } from "./genshin-state";

export const useLocalStorageReducer = <T extends object, A>(
  reducer: Reducer<T, A>,
  initialState: T,
  key: string,
  onLoad?: (success: boolean) => void
): [T, Dispatch<A>, VoidFunction] => {
  // Use internal state for initialization
  const [state, setState] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Safe check for client-side
  const isClient = typeof window !== "undefined";

  const loadFromLocalStorage = useCallback(
    (initialState: T) => {
      if (!isClient) return;
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          onLoad?.(true);
          return JSON.parse(stored);
        }
        onLoad?.(true);
        return initialState;
      } catch (error) {
        console.error("Error loading from localStorage:", error);
        onLoad?.(false);
        return initialState;
      }
    },
    [isClient, key, onLoad, setIsLoading]
  );
  // Only create reducer after client-side initialization
  const [reducerState, dispatch] = useReducer(
    reducer,
    state,
    loadFromLocalStorage
  );

  // Debug ----
  useEffect(() => {
    console.log("state changed:", state);
  }, [state]);
  useEffect(() => {
    console.log("reducerState changed:", reducerState);
  }, [reducerState]);
  useEffect(() => {
    console.log("isLoading changed:", isLoading);
  }, [isLoading]);
  //useEffect(() => {console.log(" changed:", state)}, [state]);

  // ----------
  // Initialize from localStorage only on client-side
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setState(() => {
          console.log("set isLoading false");
          setIsLoading(false);
          return JSON.parse(stored);
        });
      }
      onLoad?.(true);
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      onLoad?.(false);
    }
  }, [isClient, key, onLoad, setIsLoading]);

  // Save to localStorage when state changes (client-side only)
  useEffect(() => {
    if (!isClient || isLoading || reducerState === initialState) return;
    console.log((reducerState as GenshinState).estimatedNewWishesPerBanner);
    try {
      localStorage.setItem(key, JSON.stringify(reducerState));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [reducerState, key, isClient, isLoading]);

  const clearValue = useCallback(() => {
    if (isClient) {
      localStorage.removeItem(key);
    }
  }, [key, isClient]);

  return [reducerState, dispatch, clearValue];
};
