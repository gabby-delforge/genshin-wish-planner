/**
 * Utilities for version comparison and changelog logic
 */

import packageJson from "../../../package.json";
import { getChangelogState, markVersionAsSeen } from "./changelog-storage";
import { getChangelogsSince } from "./changelog-data";

/**
 * Compare semantic versions (e.g., "1.2.3" vs "1.2.4")
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
export function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  
  return 0;
}

/**
 * Get the current app version from package.json
 */
export function getCurrentAppVersion(): string {
  return packageJson.version;
}

/**
 * Check if there are new changelog entries to show
 */
export function hasNewChangelogs(): boolean {
  const currentVersion = getCurrentAppVersion();
  const { lastSeenAppVersion } = getChangelogState();
  
  return compareVersions(currentVersion, lastSeenAppVersion) > 0;
}

/**
 * Get all changelog entries since the last seen version
 */
export async function getNewChangelogs() {
  const { lastSeenAppVersion } = getChangelogState();
  return await getChangelogsSince(lastSeenAppVersion);
}

/**
 * Mark the current app version as seen by the user
 */
export function markCurrentVersionAsSeen(): void {
  const currentVersion = getCurrentAppVersion();
  markVersionAsSeen(currentVersion);
}