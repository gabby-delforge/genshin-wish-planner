"use client";

import { useChangelog } from "@/lib/changelog/use-changelog";
import { observer } from "mobx-react-lite";
import { ChangelogModal } from "./changelog-modal";

interface ChangelogProviderProps {
  children: React.ReactNode;
}

export const ChangelogProvider = observer(function ChangelogProvider({
  children,
}: ChangelogProviderProps) {
  const { showChangelog, changelogEntries, closeChangelog, isLoading } =
    useChangelog();

  return (
    <>
      {children}
      {!isLoading && (
        <ChangelogModal
          isOpen={showChangelog}
          onClose={closeChangelog}
          changelog={changelogEntries}
        />
      )}
    </>
  );
});
