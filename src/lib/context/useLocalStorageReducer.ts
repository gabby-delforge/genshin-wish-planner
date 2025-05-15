"use client";
import { Dispatch, Reducer, useCallback, useEffect, useReducer } from "react";

const getLocalStorage = (): Storage | null => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
};

const initializer =
  (key: string, onLoad?: (success: boolean) => void) =>
  <T>(initial: T) => {
    const storage = getLocalStorage();
    if (!storage) {
      onLoad?.(false);
      return initial;
    }
    onLoad?.(true);
    const stored = storage.getItem(key);
    if (!stored) {
      return initial;
    }

    return JSON.parse(stored);
  };

export const useLocalStorageReducer = <T extends object, A>(
  reducer: Reducer<T, A>,
  initialState: T,
  key: string,
  onLoad?: (success: boolean) => void
): [T, Dispatch<A>, VoidFunction] => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    initializer(key, onLoad)
  );
  const clearValue = useCallback(() => {
    const storage = getLocalStorage();
    if (storage) {
      storage.removeItem(key);
    }
  }, [key]);

  useEffect(() => {
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem(key, JSON.stringify(state));
    }
  }, [state]);

  return [state, dispatch, clearValue];
};
