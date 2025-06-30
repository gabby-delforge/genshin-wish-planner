/**
 * Deep State Reconciliation System
 *
 * Ensures that loaded state from localStorage matches the expected state shape,
 * handling missing properties, extra properties, and nested object structures.
 *
 * This works alongside the existing migration system to provide a complete
 * state management solution that's robust against schema changes.
 */

export type ReconciliationOptions = {
  /** Whether to keep extra properties not in the default state */
  keepExtraProperties?: boolean;
  /** Whether to validate types match expected types */
  validateTypes?: boolean;
  /** Custom validation function for specific properties */
  customValidators?: Record<string, (value: unknown) => boolean>;
  /** Properties to exclude from reconciliation */
  excludeProperties?: string[];
};

export type ReconciliationResult<T> = {
  reconciledState: T;
  changes: ReconciliationChange[];
  errors: string[];
};

export type ReconciliationChange = {
  path: string;
  type: "added" | "removed" | "type_corrected" | "invalid_value_reset";
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
};

/**
 * Deep reconciliation function that merges loaded state with default state
 */
export function reconcileState<T extends Record<string, unknown>>(
  loadedState: Partial<T>,
  defaultState: T,
  options: ReconciliationOptions = {}
): ReconciliationResult<T> {
  const {
    keepExtraProperties = false,
    validateTypes = true,
    customValidators = {},
    excludeProperties = [],
  } = options;

  const changes: ReconciliationChange[] = [];
  const errors: string[] = [];

  const reconciled = deepMerge(loadedState, defaultState, {
    keepExtraProperties,
    validateTypes,
    customValidators,
    excludeProperties,
    changes,
    errors,
    path: "",
  }) as T;

  return {
    reconciledState: reconciled,
    changes,
    errors,
  };
}

type DeepMergeContext = {
  keepExtraProperties: boolean;
  validateTypes: boolean;
  customValidators: Record<string, (value: unknown) => boolean>;
  excludeProperties: string[];
  changes: ReconciliationChange[];
  errors: string[];
  path: string;
};

function deepMerge(
  loaded: unknown,
  defaultValue: unknown,
  context: DeepMergeContext
): unknown {
  const { changes, path, excludeProperties } = context;

  // Skip excluded properties
  if (excludeProperties.includes(getPropertyName(path))) {
    return loaded;
  }

  // Handle null/undefined loaded values
  if (loaded === null || loaded === undefined) {
    if (defaultValue !== null && defaultValue !== undefined) {
      changes.push({
        path,
        type: "added",
        newValue: defaultValue,
        reason: "Missing property added from default",
      });
    }
    return defaultValue;
  }

  // Handle primitive types
  if (!isObject(defaultValue)) {
    return handlePrimitiveReconciliation(loaded, defaultValue, context);
  }

  // Handle arrays
  if (Array.isArray(defaultValue)) {
    return handleArrayReconciliation(loaded, defaultValue, context);
  }

  // Handle objects
  return handleObjectReconciliation(loaded, defaultValue, context);
}

function handlePrimitiveReconciliation(
  loaded: unknown,
  defaultValue: unknown,
  context: DeepMergeContext
): unknown {
  const { validateTypes, customValidators, changes, path } = context;

  // Custom validation first
  const propertyName = getPropertyName(path);
  if (customValidators[propertyName]) {
    if (!customValidators[propertyName](loaded)) {
      changes.push({
        path,
        type: "invalid_value_reset",
        oldValue: loaded,
        newValue: defaultValue,
        reason: "Custom validation failed",
      });
      return defaultValue;
    }
  }

  // Type validation
  if (validateTypes && typeof loaded !== typeof defaultValue) {
    changes.push({
      path,
      type: "type_corrected",
      oldValue: loaded,
      newValue: defaultValue,
      reason: `Type mismatch: expected ${typeof defaultValue}, got ${typeof loaded}`,
    });
    return defaultValue;
  }

  return loaded;
}

function handleArrayReconciliation(
  loaded: unknown,
  defaultValue: unknown[],
  context: DeepMergeContext
): unknown[] {
  const { changes, path } = context;

  if (!Array.isArray(loaded)) {
    changes.push({
      path,
      type: "type_corrected",
      oldValue: loaded,
      newValue: defaultValue,
      reason: "Expected array, got different type",
    });
    return defaultValue;
  }

  // For arrays, we typically want to preserve user data
  // but could add validation here if needed
  return loaded;
}

function handleObjectReconciliation(
  loaded: unknown,
  defaultValue: Record<string, unknown>,
  context: DeepMergeContext
): Record<string, unknown> {
  const { keepExtraProperties, changes, path } = context;

  if (!isObject(loaded)) {
    changes.push({
      path,
      type: "type_corrected",
      oldValue: loaded,
      newValue: defaultValue,
      reason: "Expected object, got different type",
    });
    return defaultValue;
  }

  const result: Record<string, unknown> = {};

  // Process all properties from default state (ensures completeness)
  for (const key in defaultValue) {
    const newPath = path ? `${path}.${key}` : key;
    result[key] = deepMerge(loaded[key], defaultValue[key], {
      ...context,
      path: newPath,
    });
  }

  // Handle extra properties in loaded state
  if (keepExtraProperties) {
    for (const key in loaded) {
      if (!(key in defaultValue)) {
        result[key] = loaded[key];
        changes.push({
          path: path ? `${path}.${key}` : key,
          type: "added",
          newValue: loaded[key],
          reason: "Extra property preserved",
        });
      }
    }
  } else {
    // Log removed extra properties
    for (const key in loaded) {
      if (!(key in defaultValue)) {
        changes.push({
          path: path ? `${path}.${key}` : key,
          type: "removed",
          oldValue: loaded[key],
          reason: "Extra property removed",
        });
      }
    }
  }

  return result;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getPropertyName(path: string): string {
  const parts = path.split(".");
  return parts[parts.length - 1] || "";
}

/**
 * Utility to create a safe state reconciliation with logging
 */
export function safeReconcileState<T extends Record<string, unknown>>(
  loadedState: Partial<T>,
  defaultState: T,
  options: ReconciliationOptions = {}
): T {
  try {
    const result = reconcileState(loadedState, defaultState, options);

    if (result.changes.length > 0) {
      console.log(
        `🔄 State reconciliation applied ${result.changes.length} changes:`
      );
      result.changes.forEach((change) => {
        console.log(`  - ${change.type} at ${change.path}: ${change.reason}`);
      });
    }

    if (result.errors.length > 0) {
      console.warn("⚠️ State reconciliation errors:", result.errors);
    }

    return result.reconciledState;
  } catch (error) {
    console.error("❌ State reconciliation failed:", error);
    console.log("Falling back to default state");
    return defaultState;
  }
}
