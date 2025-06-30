"use client";

import {
  ChangelogEntry,
  getChangelogEntries,
} from "@/lib/changelog/changelog-data";
import { telemetry } from "@/lib/telemetry";
import { observer } from "mobx-react-lite";
import { useState, useRef } from "react";
import { ChangelogModal } from "./changelog-modal";

export const ChangelogFooterButton = observer(function ChangelogFooterButton() {
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const changelogOpenTime = useRef<number | null>(null);

  const openChangelog = async () => {
    setIsLoading(true);
    try {
      const entries = await getChangelogEntries();
      setChangelogEntries(entries);
      setShowChangelog(true);
      
      // Track changelog opened manually
      changelogOpenTime.current = Date.now();
      telemetry.changelogOpened({
        changelog_entries_count: entries.length,
        is_automatic_open: false,
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <>
      <button
        onClick={openChangelog}
        disabled={isLoading}
        className="text-white/40 hover:text-white/60 transition-colors underline text-xs"
      >
        {isLoading ? "Loading..." : "What's New"}
      </button>

      <ChangelogModal
        isOpen={showChangelog}
        changelog={changelogEntries}
        onClose={closeChangelog}
      />
    </>
  );
});
