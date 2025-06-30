import { migrateState, validateStateVersion } from "./migrations";
import { STATE_VERSION } from "./state-version";
import { safeReconcileState } from "./state-reconciliation";
import { createDefaultPersistedState, getGenshinStateReconciliationOptions } from "./default-state-factory";

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

  let processedState = loadedData;

  // Step 1: Apply migrations if needed
  if (currentVersion < STATE_VERSION) {
    console.log(`Migrating state from v${currentVersion} to v${STATE_VERSION}`);
    try {
      const migratedResult = migrateState(loadedData, STATE_VERSION);
      processedState = migratedResult as unknown as Partial<T & { version: number }>;
      console.log(`✅ State successfully migrated to v${STATE_VERSION}`);
    } catch (error) {
      console.error("❌ State migration failed:", error);
      console.log("Using default state values");
      return {}; // Return empty to use defaults
    }
  }

  // Step 2: Apply state reconciliation to ensure completeness
  try {
    const defaultState = createDefaultPersistedState();
    const reconciledState = safeReconcileState(
      processedState as Record<string, unknown>,
      defaultState as Record<string, unknown>,
      getGenshinStateReconciliationOptions()
    );
    
    return reconciledState as Partial<T>;
  } catch (error) {
    console.error("❌ State reconciliation failed:", error);
    console.log("Falling back to migrated state without reconciliation");
    return processedState;
  }
};
