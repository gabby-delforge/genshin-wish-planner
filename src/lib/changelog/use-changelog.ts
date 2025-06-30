"use client";

import { useState, useEffect } from "react";
import { hasNewChangelogs, getNewChangelogs } from "./changelog-utils";
import { ChangelogEntry } from "./changelog-data";

export function useChangelog() {
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const checkForChangelogs = async () => {
      try {
        setIsLoading(true);
        
        // Small delay to avoid flash on initial load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (hasNewChangelogs()) {
          const newEntries = await getNewChangelogs();
          setChangelogEntries(newEntries);
          setShowChangelog(true);
        }
      } catch (error) {
        console.warn("Failed to check changelog:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForChangelogs();
  }, []);

  const closeChangelog = () => {
    setShowChangelog(false);
  };

  return {
    showChangelog,
    changelogEntries,
    closeChangelog,
    isLoading,
  };
}