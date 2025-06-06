/**
 * Versioned State Types
 *
 * Barrel export for all versioned types.
 * Used for type-safe migrations.
 */

import { type GenshinStateV1 } from "./v1-types";
import { type GenshinStateV2 } from "./v2-types";
import { type GenshinStateV3 } from "./v3-types";
import { type GenshinStateV4 } from "./v4-types";

export * as V1 from "./v1-types";
export * as V2 from "./v2-types";
export * as V3 from "./v3-types";
export * as V4 from "./v4-types";

export type VersionedState =
  | GenshinStateV1
  | GenshinStateV2
  | GenshinStateV3
  | GenshinStateV4;

// Re-export specific GenshinState types if they exist
// export type GenshinStateV3 = V3.GenshinState; // Add if GenshinState type exists in v3
// export type GenshinStateV4 = V4.GenshinState; // Add if GenshinState type exists in v4
