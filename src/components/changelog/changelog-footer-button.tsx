"use client";

import {
  ChangelogEntry,
  getChangelogEntries,
} from "@/lib/changelog/changelog-data";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ChangelogModal } from "./changelog-modal";

export const ChangelogFooterButton = observer(function ChangelogFooterButton() {
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const openChangelog = async () => {
    setIsLoading(true);
    try {
      const entries = await getChangelogEntries();
      setChangelogEntries(entries);
      setShowChangelog(true);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const closeChangelog = () => {
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
