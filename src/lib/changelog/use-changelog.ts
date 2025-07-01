"use client";

import { useState, useEffect, useRef } from "react";
import { hasNewChangelogs, getNewChangelogs } from "./changelog-utils";
import { ChangelogEntry } from "./changelog-data";
import { telemetry } from "../telemetry";

export function useChangelog() {
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const changelogOpenTime = useRef<number | null>(null);

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
          // Only show modal if there are actually new entries to display
          if (newEntries.length > 0) {
            setChangelogEntries(newEntries);
            setShowChangelog(true);
            
            // Track changelog opened automatically
            changelogOpenTime.current = Date.now();
            telemetry.changelogOpened({
              changelog_entries_count: newEntries.length,
              is_automatic_open: true,
            });
          }
        }
      } catch {
        // Silently fail changelog check to avoid interrupting app startup
      } finally {
        setIsLoading(false);
      }
    };

    checkForChangelogs();
  }, []);

  const closeChangelog = () => {
    // Track changelog closed with time open
    if (changelogOpenTime.current) {
      const timeOpenMs = Date.now() - changelogOpenTime.current;
      telemetry.changelogClosed({
        changelog_entries_count: changelogEntries.length,
        time_open_ms: timeOpenMs,
      });
      changelogOpenTime.current = null;
    }
    
    setShowChangelog(false);
  };

  return {
    showChangelog,
    changelogEntries,
    closeChangelog,
    isLoading,
  };
}