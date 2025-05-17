"use client";
import {
  Dispatch,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";

export const useLocalStorageReducer = <T extends object, A>(
  reducer: Reducer<T, A>,
  initialState: T,
  key: string,
  onLoad?: (success: boolean) => void
): [T, Dispatch<A>, VoidFunction] => {
  // Use internal state for initialization
  const [state, setState] = useState<T>(initialState);

  // Only create reducer after client-side initialization
  const [reducerState, dispatch] = useReducer(reducer, state);

  // Safe check for client-side
  const isClient = typeof window !== "undefined";

  // Initialize from localStorage only on client-side
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setState(JSON.parse(stored));
      }
      onLoad?.(true);
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      onLoad?.(false);
    }
  }, [isClient, key, onLoad]);

  // Save to localStorage when state changes (client-side only)
  useEffect(() => {
    if (!isClient) return;

    try {
      localStorage.setItem(key, JSON.stringify(reducerState));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [reducerState, key, isClient]);

  const clearValue = useCallback(() => {
    if (isClient) {
      localStorage.removeItem(key);
    }
  }, [key, isClient]);

  return [reducerState, dispatch, clearValue];
};
