import { autorun, toJS } from "mobx";

const CLEAR_DATA = false;

export interface LocalStorageOptions<T> {
  /** Called before loading any data, can modify the loaded data object */
  beforeLoad?: (loadedData: Partial<T>) => Partial<T>;
  /** Called when a parse error occurs for a specific key */
  onParseError?: (key: string, error: Error) => void;
  /** Called to validate if a value should be applied to the object */
  validateValue?: (key: string, value: unknown, expectedType: unknown) => boolean;
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
    
    // First pass: load all data from localStorage
    for (const key of keys) {
      const localKey = `${prefix}_${String(key)}`;

      try {
        const valueStr = localStorage.getItem(localKey);
        if (!valueStr) continue;

        const value = JSON.parse(valueStr);
        loadedData[key] = value;
      } catch (error) {
        // Parse error or any other issue - silently clean up
        const parseError = error as Error;
        if (options.onParseError) {
          options.onParseError(String(key), parseError);
        } else {
          console.warn(`Auto-fixing corrupted storage for ${localKey}`);
        }
        
        try {
          localStorage.removeItem(localKey);
        } catch (e) {
          // Can't remove - localStorage might be broken, just continue
        }
        // obj[key] keeps its default value
      }
    }

    // Apply beforeLoad callback if provided (for migrations, etc.)
    const processedData = options.beforeLoad ? options.beforeLoad(loadedData) : loadedData;

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
