import { autorun, toJS } from "mobx";

const CLEAR_DATA = false;

/**
 * Cleans up old localStorage keys that were removed during migration
 */
function cleanupOldKeys<T>(
  oldData: Partial<T>,
  newData: Partial<T>,
  prefix: string
) {
  const oldKeys = new Set(Object.keys(oldData));
  const newKeys = new Set(Object.keys(newData));

  // Find keys that existed in old data but not in new data
  const removedKeys = Array.from(oldKeys).filter((key) => !newKeys.has(key));

  // Remove these keys from localStorage
  removedKeys.forEach((key) => {
    const localKey = `${prefix}_${key}`;
    try {
      localStorage.removeItem(localKey);
      console.log(`🧹 Cleaned up old localStorage key: ${localKey}`);
    } catch (error) {
      console.warn(`Failed to remove old localStorage key ${localKey}:`, error);
    }
  });

  if (removedKeys.length > 0) {
    console.log(`✅ Cleaned up ${removedKeys.length} old localStorage keys`);
  }
}

export interface LocalStorageOptions<T> {
  /** Called before loading any data, can modify the loaded data object */
  beforeLoad?: (loadedData: Partial<T>) => Partial<T>;
  /** Called when a parse error occurs for a specific key */
  onParseError?: (key: string, error: Error) => void;
  /** Called to validate if a value should be applied to the object */
  validateValue?: (
    key: string,
    value: unknown,
    expectedType: unknown
  ) => boolean;
}

export function makeLocalStorage<T extends object, K extends keyof T>(
  obj: T,
  prefix: string,
  keys: K[],
  options: LocalStorageOptions<T> = {}
): void {
  if (typeof window == "undefined") return;

  if (!CLEAR_DATA) {
    // Load existing values with optional custom processing
    const loadedData: Partial<T> = {};

    // First pass: load ALL localStorage keys with this prefix (not just current keys)
    // This ensures we capture old keys that may need to be migrated/cleaned up
    const prefixPattern = `${prefix}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(prefixPattern)) {
        const fieldName = storageKey.substring(prefixPattern.length);

        try {
          const valueStr = localStorage.getItem(storageKey);
          if (valueStr) {
            const value = JSON.parse(valueStr);
            loadedData[fieldName as keyof T] = value;
          }
        } catch (error) {
          // Parse error or any other issue - silently clean up
          const parseError = error as Error;
          if (options.onParseError) {
            options.onParseError(fieldName, parseError);
          } else {
            console.warn(`Auto-fixing corrupted storage for ${storageKey}`);
          }

          try {
            localStorage.removeItem(storageKey);
          } catch (e) {
            // Can't remove - localStorage might be broken, just continue
          }
        }
      }
    }

    // Apply beforeLoad callback if provided (for migrations, etc.)
    const processedData = options.beforeLoad
      ? options.beforeLoad(loadedData)
      : loadedData;

    // If data was migrated, clean up old localStorage keys
    if (options.beforeLoad && processedData !== loadedData) {
      cleanupOldKeys(loadedData, processedData, prefix);
    }

    // Second pass: apply the processed data to the object
    for (const key of keys) {
      if (key in processedData) {
        const value = processedData[key];
        const shouldApply = options.validateValue
          ? options.validateValue(String(key), value, obj[key])
          : typeof value === typeof obj[key]; // Default type check

        if (shouldApply) {
          obj[key] = value as T[K];
        } else {
          // Value rejected - remove bad data and use default
          const localKey = `${prefix}_${String(key)}`;
          try {
            localStorage.removeItem(localKey);
          } catch (e) {
            // Ignore removal errors
          }
        }
      }
    }
  }

  // Save values to local storage
  autorun(() => {
    for (const key of keys) {
      const localKey = `${prefix}_${String(key)}`;
      try {
        localStorage.setItem(localKey, JSON.stringify(toJS(obj[key])));
      } catch (error) {
        // Save failed - just continue silently
        console.warn(
          `Save failed for ${localKey}, continuing without persistence`
        );
      }
    }
  });
}
