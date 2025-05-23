"use client";
import {
  Dispatch,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";

export const useLocalStorageReducer = <T extends object, A>(
  reducer: Reducer<T, A>,
  initialState: T,
  key: string,
  onLoad?: (success: boolean) => void,
  serializeState?: (state: T) => string
): [T, Dispatch<A>, VoidFunction] => {
  // Safe check for client-side
  const isClient = typeof window !== "undefined";

  // Use a ref to track initialization
  const isInitializedRef = useRef(false);

  // Get initial state with a function to avoid execution during SSR
  const getInitialState = () => {
    // During SSR, return the initial state
    if (!isClient) return initialState;

    try {
      // Try to load from localStorage
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedState = JSON.parse(stored);
        console.log("Initial state:", { ...initialState, ...parsedState });
        return { ...initialState, ...parsedState };
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      // Signal load failure asynchronously to avoid hydration mismatch
      setTimeout(() => onLoad?.(false), 0);
    }

    return initialState;
  };

  // Initialize reducer with function initialization to handle SSR safely
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // After mount, set initialized and signal loading complete
  useEffect(() => {
    if (!isClient || isInitializedRef.current) return;

    isInitializedRef.current = true;

    // Signal successful load after a short delay to ensure hydration is complete
    setTimeout(() => onLoad?.(true), 0);
  }, [isClient, onLoad]);

  // Save to localStorage when state changes (client-side only)
  useEffect(() => {
    if (!isClient || !isInitializedRef.current) return;

    try {
      if (serializeState) {
        localStorage.setItem(key, serializeState(state));
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [state, key, isClient]);

  // Function to clear localStorage data
  const clearValue = useCallback(() => {
    if (isClient) {
      localStorage.removeItem(key);
    }
  }, [key, isClient]);

  return [state, dispatch, clearValue];
};
