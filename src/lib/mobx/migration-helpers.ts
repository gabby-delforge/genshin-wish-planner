import { migrateState, validateStateVersion } from "./migrations";
import { STATE_VERSION } from "./state-version";

export const validateLoadedState = <T>(
  loadedData: Partial<T & { version: number }>
) => {
  const currentVersion = loadedData.version || 1;

  if (!validateStateVersion(loadedData, STATE_VERSION)) {
    console.error(
      `State version ${currentVersion} is newer than expected ${STATE_VERSION}`
    );
    return {} as Partial<T>; // Return empty to use defaults
  }

  if (currentVersion < STATE_VERSION) {
    console.log(`Migrating state from v${currentVersion} to v${STATE_VERSION}`);
    try {
      const migratedState = migrateState(loadedData, STATE_VERSION);
      console.log(`✅ State successfully migrated to v${STATE_VERSION}`);
      return migratedState;
    } catch (error) {
      console.error("❌ State migration failed:", error);
      console.log("Using default state values");
      return {}; // Return empty to use defaults
    }
  }

  return loadedData; // No migration needed
};
