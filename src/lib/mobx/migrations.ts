/**
 * State Migrations
 * 
 * Handles migration between different state schema versions.
 */

export const migrations: Record<number, (state: Record<string, unknown>) => Record<string, unknown>> = {
  // Auto-generated migration from v1 to v2
  // Generated on: 2025-06-01T14:38:25.917Z
  1: (state) => {
    // TODO: Implement migration from v1 to v2
    // Changes detected:
    // + newTestField: (new field)
    
    return {
      ...state,
      version: 2,
      // Add your migration logic here
    };
  },
};

export function migrateState(state: Record<string, unknown>, targetVersion: number): Record<string, unknown> {
  let currentState = state;
  let currentVersion = (state.version as number) || 1;
  
  while (currentVersion < targetVersion) {
    const migration = migrations[currentVersion];
    if (!migration) {
      throw new Error(`No migration found for version ${currentVersion}`);
    }
    currentState = migration(currentState);
    currentVersion++;
  }
  
  return currentState;
}

export function validateStateVersion(state: Record<string, unknown>, expectedVersion: number): boolean {
  const stateVersion = (state.version as number) || 1;
  return stateVersion <= expectedVersion;
}