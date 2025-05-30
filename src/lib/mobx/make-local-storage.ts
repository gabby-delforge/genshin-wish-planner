import { autorun, toJS } from "mobx";

export function makeLocalStorage<T extends object, K extends keyof T>(
  obj: T,
  prefix: string,
  keys: K[]
): void {
  if (typeof window == "undefined") return;

  // Load existing values with automatic fixing
  for (const key of keys) {
    const localKey = `${prefix}_${String(key)}`;

    try {
      const valueStr = localStorage.getItem(localKey);
      if (!valueStr) continue;

      const value = JSON.parse(valueStr);

      // Simple type check - if it's roughly the same type, use it
      if (typeof value === typeof obj[key]) {
        obj[key] = value;
      } else {
        // Type mismatch - remove bad data and use default
        localStorage.removeItem(localKey);
      }
    } catch (error) {
      // Parse error or any other issue - silently clean up
      console.warn(`Auto-fixing corrupted storage for ${localKey}`);
      try {
        localStorage.removeItem(localKey);
      } catch (e) {
        // Can't remove - localStorage might be broken, just continue
      }
      // obj[key] keeps its default value
    }
  }

  // Auto-save with error handling
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
