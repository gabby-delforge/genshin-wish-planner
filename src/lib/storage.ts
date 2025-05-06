"use client";

import { GenshinStateData, initialStateData } from "./context/types";

// Storage keys
const STORAGE_KEY = "genshin-state";

// Safely access localStorage
const getLocalStorage = (): Storage | null => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
};

// Save state to localStorage
export const saveState = (state: GenshinStateData): void => {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const serializedState = JSON.stringify(state);
      storage.setItem(STORAGE_KEY, serializedState);
    } catch (error) {
      console.error(`Error saving state to localStorage: ${error}`);
    }
  }
};

// Load state from localStorage
export const loadState = (): GenshinStateData => {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const serializedState = storage.getItem(STORAGE_KEY);
      if (serializedState === null) {
        return initialStateData;
      }
      return JSON.parse(serializedState) as GenshinStateData;
    } catch (error) {
      console.error(`Error loading state from localStorage: ${error}`);
      return initialStateData;
    }
  }
  return initialStateData;
};

// Clear stored state
export const clearState = (): void => {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(STORAGE_KEY);
  }
};
