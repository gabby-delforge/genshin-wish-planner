import Banners from "../../public/metadata/banners.json";
import Characters from "../../public/metadata/characters.json";
import Weapons from "../../public/metadata/weapons.json";

// Application modes
export type AppMode = "playground" | "strategy";

// API Data Types (static data from external source)
// ------------------------------------------------

// API Character data
export type ApiCharacter = (typeof Characters)[number];
export type ApiWeapon = (typeof Weapons)[number];
export type ApiBanner = (typeof Banners)[number];

// export type BannerId = `${number}.${number}v${number}`;
export type BannerId = string;

export type BannerWishBreakdown = {
  startingWishes: number;
  endingWishes: number;

  wishesSpentOnCharacters: number;
  wishesSpentOnWeapons: number;
  earnedWishes: number;
  starglitterWishes: number;

  maxWishesPerCharacterOrWeapon: Record<
    CharacterId | WeaponId,
    { baseWishes: number; starglitterWishes: number }
  >;
};

export interface WeaponBannerConfig {
  wishesAllocated: number;
  epitomizedPath: WeaponId; // Which weapon to chart path for
  strategy: "stop" | "continue"; // Stop after getting epitomized weapon, or continue for both
  maxRefinement: number; // Stop pulling once this refinement is reached (0 = R1, 4 = R5)
}

export type BannerConfiguration = {
  bannerId: BannerId;

  isCurrentBanner: boolean;
  isOldBanner: boolean;

  characters: Record<
    CharacterId,
    {
      wishesAllocated: number;
      maxConstellation: number;
      priority: Priority;
    }
  >;

  weaponBanner: WeaponBannerConfig;
};

// Type-level conversion using template literal types
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

// Runtime implementation
export function camelCaseToSnakeCase<T extends string>(
  str: T
): CamelToSnakeCase<T> {
  return str.replace(
    /[A-Z]/g,
    (letter) => `_${letter.toLowerCase()}`
  ) as CamelToSnakeCase<T>;
}

export type CharacterId = (typeof Characters)[number]["Id"];
export type WeaponId = (typeof Weapons)[number]["Id"];

export type CharacterSuccessRate = {
  versionId: BannerId;
  characterId: CharacterId;
  constellation: number;
  successPercent: number;
};

export type WeaponSuccessRate = {
  versionId: BannerId;
  weaponId: WeaponId;
  refinement: number; // 0 = R1, 1 = R2, etc.
  successPercent: number;
};

// Result of simulating pulls for a single character
export type CharacterSimulationResult = {
  character: CharacterId;
  obtained: boolean;
  hasWishesAllocated: boolean;
  lostFiftyFifty: boolean;
  wishesUsed: number;
  constellation: number;
};

export interface WeaponBannerSimulationResult {
  obtainedWeapons: WeaponId[];
  primaryWeaponObtained: boolean; // Did we get the epitomized path weapon?
  secondaryWeaponObtained: boolean; // Did we get the other featured weapon?
  wishesUsed: number;
  pathSwitched: boolean; // Did we have to switch epitomized path?
  endPity: number;
  endGuaranteed: boolean;
  // Refinement tracking (0 = R1, 4 = R5)
  primaryWeaponRefinement: number;
  secondaryWeaponRefinement: number;
  // Note: fate points always reset to 0 at banner end
}

// Example of how to create a default state with all sources enabled
export const DEFAULT_PRIMOGEM_SOURCES_ENABLED: PrimogemSourcesEnabled = {
  // Permanent Contents
  gameUpdateCompensation: true,
  dailyCommissions: true,
  paimonBargain: true,
  abyss: true,
  stygianOnslaught: true,
  imaginarium: true,
  battlePass: true,
  battlePassGnostic: true,
  welkinMoon: true,
  archonQuest: true,
  storyQuests: true,
  newAchievements: true,

  // Time-Limited Contents
  characterTestRuns: true,
  eventActivities: true,
  hoyolabDailyCheckIn: true,
  hoyolabWebEvents: true,
  livestreamCodes: true,
  newVersionCode: true,
  limitedExplorationRewards: true,
};

export const DEFAULT_PRIORITY = 4 as Priority;

export const priorityTargets: Record<Priority, number> = {
  [1 as Priority]: 0.99, // 99% success rate
  [2 as Priority]: 0.9, // 90% success rate
  [3 as Priority]: 0.7, // 70% success rate
  [4 as Priority]: 0, // 0% success rate
};

export const PriorityValueToText = {
  [1 as Priority]: "Must Have",
  [2 as Priority]: "Want",
  [3 as Priority]: "Nice to Have",
  [4 as Priority]: "Skip",
};

export const PriorityTextToPriority: Record<string, Priority> = {
  "Must Have": 1 as Priority,
  Want: 2 as Priority,
  "Nice to Have": 3 as Priority,
  Skip: 4 as Priority,
};

export type PrimogemSourceKey = keyof PrimogemSourceValues;

export type PrimogemSourcesEnabled = Record<PrimogemSourceKey, boolean>;

export type PrimogemSourceValue = ResourceValue | ResourceValue[];

export interface PrimogemSourceValues {
  // Permanent Contents
  gameUpdateCompensation: PrimogemSourceValue;
  dailyCommissions: PrimogemSourceValue;
  paimonBargain: PrimogemSourceValue;
  abyss: PrimogemSourceValue;
  stygianOnslaught: PrimogemSourceValue;
  imaginarium: PrimogemSourceValue;
  battlePass: PrimogemSourceValue;
  battlePassGnostic: PrimogemSourceValue;
  welkinMoon: PrimogemSourceValue;
  archonQuest: PrimogemSourceValue;
  storyQuests: PrimogemSourceValue;
  newAchievements: PrimogemSourceValue;

  // Time-Limited Contents
  characterTestRuns: PrimogemSourceValue;
  eventActivities: PrimogemSourceValue;
  hoyolabDailyCheckIn: PrimogemSourceValue;
  hoyolabWebEvents: PrimogemSourceValue;
  livestreamCodes: PrimogemSourceValue;
  newVersionCode: PrimogemSourceValue;
  limitedExplorationRewards: PrimogemSourceValue;
}

// TODO: Refactor priority so it's less annoying

export type Priority = number & {
  __brand: "Priority";
};

export type ResourceType =
  | "primogem"
  | "starglitter"
  | "limitedWishes"
  | "standardWish"
  | "stardust"
  | "genesisCrystal";

export type ResourceValue = {
  value: number;
  type: ResourceType;
};

export type ResultType = CharacterId | "Skipped" | "Standard 5*" | "Missed";

// Outcome of a specific banner in a scenario
export interface ScenarioOutcome {
  banner: BannerId;
  result: [ResultType, ResultType];
  constellation: [number, number];
}

// A possible scenario with probability
export interface ScenarioOld {
  outcomes: Record<BannerId, ScenarioOutcome>;
  probability: number;
}

// Scenario result for display - update to use BannerSimulationResult directly
export interface ScenarioResult {
  bannerResults: Record<BannerId, BannerSimulationResult>;
  count: number;
  percentage: number;
}

// Simulation Result Types
// ----------------------

// Result of a simulation for a single banner phase
export type BannerSimulationResult = {
  bannerId: BannerId;
  characterResults: CharacterSimulationResult[];
  weaponResults: WishForWeaponResult[];
  wishesUsed: number;
  endPity: number;
  endGuaranteed: boolean;
  endConsecutive5050Losses: number;
  endWeaponPity: number;
  endWeaponGuaranteed: boolean;
  endWeaponFatePoints: number;
};

// The result for a single simulation run.
export type SimulationResult = Record<BannerId, BannerSimulationResult>;

// New scenario data structures
export type CharacterOutcome = {
  characterId: CharacterId;
  obtained: boolean;
  constellation: number;
  wishesUsed: number;
};

export type WeaponOutcome = {
  weaponId: WeaponId;
  obtained: boolean;
  wishesUsed: number;
  refinementLevel?: number; // 0 = R1, 4 = R5
};

export type BannerOutcome = {
  bannerId: BannerId;
  characterOutcomes: CharacterOutcome[];
  weaponOutcomes: WeaponOutcome[];
  totalWishesUsed: number;
};

export type Scenario = {
  id: string; // Unique identifier for this scenario pattern
  bannerOutcomes: BannerOutcome[];
  probability: number;
  count: number; // How many simulation runs resulted in this scenario
};

export type ScenarioResults = {
  scenarios: Scenario[];
  totalSimulations: number;
};

// Complete simulation results
export interface SimulationResults {
  // Full detailed results by banner version
  bannerResults: Record<BannerId, BannerSimulationResult[]>;
  // Success rates for each character that was wished for in each banner
  characterSuccessRates: CharacterSuccessRate[];
  // Success rates for each weapon that was wished for in each banner
  weaponSuccessRates: WeaponSuccessRate[];
  // Common scenario patterns
  topScenarios: ScenarioResult[];
  scenarios: ScenarioResults; // New simplified structure
}

export type WishForCharacterResult = {
  character: CharacterId;
  obtained: boolean;
  lostFiftyFifty: boolean;
  wishesUsed: number;
  pity: number;
  guaranteed: boolean;
  constellation: number;
  consecutive5050Losses: number;
};

export type WishForWeaponResult = {
  weapon: WeaponId;
  obtained: boolean;
  lostSeventyFive: boolean;
  wishesUsed: number;
  hasWishesAllocated: boolean;
  refinementLevel?: number; // 0 = R1, 4 = R5
};

export type WishResources = Record<ResourceType, number>;
