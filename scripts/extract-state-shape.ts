import { genshinState } from "../src/lib/mobx/genshin-state";
import { STATE_VERSION } from "../src/lib/mobx/state-version";

try {
  const shape = genshinState.getStateShape();

  const result = {
    version: STATE_VERSION,
    keys: Object.keys(shape),
    // Store a simplified representation of the shape
    schema: Object.keys(shape).reduce((acc, key) => {
      const value = shape[key as keyof typeof shape];
      if (value === null || value === undefined) {
        acc[key] = "null";
      } else if (Array.isArray(value)) {
        acc[key] = "array";
      } else {
        acc[key] = typeof value;
      }
      return acc;
    }, {} as Record<string, string>),
  };

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Error getting state shape:", error);
  process.exit(1);
}
