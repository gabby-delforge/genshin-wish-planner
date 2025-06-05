"use client";

import { runInAction } from "mobx";
import { useEffect, useState } from "react";
import { GenshinState } from "./genshin-state";
import { makeLocalStorage } from "./make-local-storage";
import { validateLoadedState } from "./migration-helpers";

/**
 * Hook that handles client-side state hydration to prevent SSR/hydration mismatches.
 * This ensures localStorage is only accessed after the component has mounted on the client.
 */
export function useClientState(state: GenshinState) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== "undefined" && !isHydrated) {
      // Initialize localStorage sync
      makeLocalStorage(state, "genshin-store", state.PERSISTED_KEYS, {
        beforeLoad: (loadedData) => {
          runInAction(() => {
            state.isLoading = false; // Done loading after localStorage is processed
          });
          return validateLoadedState(loadedData);
        },
        onParseError: (key, error) => {
          console.warn(
            `Auto-fixing corrupted storage for ${key}:`,
            error.message
          );
        },
      });

      setIsHydrated(true);
    }
  }, [state, isHydrated]);

  return isHydrated;
}
