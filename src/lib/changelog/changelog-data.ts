/**
 * Simple changelog system that reads from CHANGELOG.md
 */

import { parseChangelog } from "./changelog-parser";

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: ChangelogChange[];
}

export interface ChangelogChange {
  type: "feature" | "improvement" | "fix" | "breaking";
  description: string;
}

let cachedEntries: ChangelogEntry[] | null = null;

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  if (cachedEntries) {
    return cachedEntries;
  }
  
  const entries = await parseChangelog();
  cachedEntries = entries;
  return entries;
}

export async function getChangelogForVersion(version: string): Promise<ChangelogEntry | null> {
  const entries = await getChangelogEntries();
  return entries.find(entry => entry.version === version) || null;
}

export async function getChangelogsSince(lastSeenVersion: string): Promise<ChangelogEntry[]> {
  const entries = await getChangelogEntries();
  const lastSeenIndex = entries.findIndex(
    entry => entry.version === lastSeenVersion
  );
  
  // If version not found, show all entries
  if (lastSeenIndex === -1) {
    return entries;
  }
  
  // Return all entries newer than the last seen version
  return entries.slice(0, lastSeenIndex);
}