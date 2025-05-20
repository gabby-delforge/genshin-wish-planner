"use client";

import {
  AccountStatus,
  Allocations,
  AppMode,
  Banner,
  DEFAULT_PRIMOGEM_SOURCES_ENABLED,
  SimulationResults,
} from "@/lib/types";

// Storage keys
const STORAGE_KEYS = {
  ACCOUNT_STATUS: "genshin-account-status",
  BANNERS: "genshin-banners",
  SIMULATION_RESULTS: "genshin-simulation-results",
  SIMULATIONS: "genshin-simulations-count",
  MODE: "genshin-mode",
  BANNER_ALLOCATIONS: "genshin-banner-allocations",
};

// Type for storable data
export interface StorableState {
  accountStatus?: AccountStatus;
  banners?: Banner[];
  simulationResults?: SimulationResults | null;
  simulations?: number;
  mode?: AppMode;
  bannerAllocations?: Allocations;
}

// Safely access localStorage
const getLocalStorage = (): Storage | null => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
};

// Save a value to localStorage
const saveToStorage = <T>(key: string, value: T): void => {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const serializedValue = JSON.stringify(value);
      storage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  }
};

// Load a value from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const serializedValue = storage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error loading from localStorage: ${error}`);
      return defaultValue;
    }
  }
  return defaultValue;
};

// Save the entire app state
export const saveState = (state: StorableState): void => {
  if (state.accountStatus !== undefined) {
    saveToStorage(STORAGE_KEYS.ACCOUNT_STATUS, state.accountStatus);
  }

  if (state.banners !== undefined) {
    saveToStorage(STORAGE_KEYS.BANNERS, state.banners);
  }

  if (state.simulationResults !== undefined) {
    saveToStorage(STORAGE_KEYS.SIMULATION_RESULTS, state.simulationResults);
  }

  if (state.simulations !== undefined) {
    saveToStorage(STORAGE_KEYS.SIMULATIONS, state.simulations);
  }

  if (state.mode !== undefined) {
    saveToStorage(STORAGE_KEYS.MODE, state.mode);
  }

  if (state.bannerAllocations !== undefined) {
    saveToStorage(STORAGE_KEYS.BANNER_ALLOCATIONS, state.bannerAllocations);
  }

  if (state.banners) {
    saveToStorage(STORAGE_KEYS.BANNERS, state.banners);
  }

  if (state.simulationResults !== undefined) {
    saveToStorage(STORAGE_KEYS.SIMULATION_RESULTS, state.simulationResults);
  }

  if (state.simulations !== undefined) {
    saveToStorage(STORAGE_KEYS.SIMULATIONS, state.simulations);
  }

  if (state.mode !== undefined) {
    saveToStorage(STORAGE_KEYS.MODE, state.mode);
  }

  if (state.bannerAllocations !== undefined) {
    saveToStorage(STORAGE_KEYS.BANNER_ALLOCATIONS, state.bannerAllocations);
  }
};

// Load the entire app state
export const loadState = (): StorableState => {
  return {
    accountStatus: loadFromStorage<AccountStatus>(STORAGE_KEYS.ACCOUNT_STATUS, {
      currentPity: 0,
      isNextFiftyFiftyGuaranteed: false,
      ownedWishResources: {
        primogem: 0,
        starglitter: 0,
        limitedWishes: 0,
        stardust: 0,
        genesisCrystal: 0,
        standardWish: 0,
      },
      primogemSources: DEFAULT_PRIMOGEM_SOURCES_ENABLED,
      excludeCurrentBannerPrimogemSources: true,
    }),
    banners: loadFromStorage<Banner[]>(STORAGE_KEYS.BANNERS, []),
    simulationResults: loadFromStorage<SimulationResults | null>(
      STORAGE_KEYS.SIMULATION_RESULTS,
      null
    ),
    simulations: loadFromStorage<number>(STORAGE_KEYS.SIMULATIONS, 10000),
  };
};

// Clear all stored data
export const clearState = (): void => {
  const storage = getLocalStorage();
  if (storage) {
    Object.values(STORAGE_KEYS).forEach((key) => {
      storage.removeItem(key);
    });
  }
};
