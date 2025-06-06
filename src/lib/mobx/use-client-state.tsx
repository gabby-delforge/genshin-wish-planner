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

          // If data is empty, malformed, or doesn't have meaningful content,
          // just ignore it and use constructor defaults
          if (
            !loadedData ||
            typeof loadedData !== "object" ||
            Object.keys(loadedData).length === 0 ||
            !loadedData.version
          ) {
            console.warn(
              "Empty or malformed state data, using constructor defaults"
            );
            return {}; // Return empty object to use all constructor defaults
          }

          // Only attempt migration if we have actual meaningful data
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
