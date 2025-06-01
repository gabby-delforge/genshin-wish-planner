/**
 * State Migrations
 *
 * Handles migration between different state schema versions.
 */

export const migrations: Record<
  number,
  (state: Record<string, unknown>) => Record<string, unknown>
> = {
  // Migration from v1 to v2: Split accountStatusCurrentPity into characterPity and weaponPity
  1: (state) => {
    const oldPity = (state.accountStatusCurrentPity as number) || 0;

    // Create new state object, explicitly excluding the old field
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { accountStatusCurrentPity, ...restState } = state;

    return {
      ...restState,
      version: 2,
      characterPity: oldPity, // Migrate old pity to character pity
      weaponPity: 0, // New field starts at 0
    };
  },
};

export function migrateState(
  state: Record<string, unknown>,
  targetVersion: number
): Record<string, unknown> {
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

export function validateStateVersion(
  state: Record<string, unknown>,
  expectedVersion: number
): boolean {
  const stateVersion = (state.version as number) || 1;
  return stateVersion <= expectedVersion;
}
