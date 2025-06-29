/**
 * Standalone changelog system for tracking user-seen app versions
 * Operates independently from the main application state
 */

const CHANGELOG_STORAGE_KEY = "genshin-changelog";

export interface ChangelogState {
  lastSeenAppVersion: string;
  lastCheckedDate: string;
}

const defaultChangelogState: ChangelogState = {
  lastSeenAppVersion: "0.0.0", 
  lastCheckedDate: new Date().toISOString(),
};

export function getChangelogState(): ChangelogState {
  if (typeof window === "undefined") {
    return defaultChangelogState;
  }

  try {
    const stored = localStorage.getItem(CHANGELOG_STORAGE_KEY);
    if (!stored) {
      return defaultChangelogState;
    }

    const parsed = JSON.parse(stored);
    return {
      lastSeenAppVersion: parsed.lastSeenAppVersion || "0.0.0",
      lastCheckedDate: parsed.lastCheckedDate || new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Failed to load changelog state:", error);
    return defaultChangelogState;
  }
}

export function setChangelogState(state: ChangelogState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save changelog state:", error);
  }
}

export function markVersionAsSeen(version: string): void {
  const currentState = getChangelogState();
  setChangelogState({
    ...currentState,
    lastSeenAppVersion: version,
    lastCheckedDate: new Date().toISOString(),
  });
}