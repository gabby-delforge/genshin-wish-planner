// Core type definitions for Genshin Impact wish planning

import { GENSHIN_CHARACTERS } from "./data";

export type VersionId = `${number}.${number}v${number}`;

export type CharacterId = (typeof GENSHIN_CHARACTERS)[number];

// API Data Types (static data from external source)
// ------------------------------------------------

// API Character data
export interface ApiCharacter {
  id: CharacterId;
  name: string;
  rarity: number;
  element: string;
  weaponType: string;
}

// API Banner data
export interface ApiBanner {
  id: VersionId;
  version: VersionId;
  name: string;
  startDate: string;
  endDate: string;
  characters: ApiCharacter[];
}

// Application State Types (data with user-specific state)
// -------------------------------------------------------

export type BannerCharacterAllocation = {
  wishesAllocated: number;
  maxConstellation: number;
  pullPriority: Priority;
};

export type BannerAllocation = Partial<
  Record<CharacterId, BannerCharacterAllocation>
>;
export type Allocations = Record<VersionId, BannerAllocation>;
export type PriorityAllocations = Record<
  VersionId,
  Partial<Record<CharacterId, Priority>>
>;

export type Priority = number & {
  __brand: "Priority";
};

export const PriorityValueToText = {
  [1 as Priority]: "Must Have",
  [2 as Priority]: "Want",
  [3 as Priority]: "Nice to Have",
  [4 as Priority]: "Skip",
};

export const DEFAULT_PRIORITY = 3 as Priority;

// Character with user-specific state
export interface Character extends ApiCharacter {
  wishesToSpend: number;
  priority: Priority;
  maxConst: number;
}

// Banner with user-specific state
export type Banner = ApiBanner;

// Simulation Result Types
// ----------------------

export type WishForCharacterResult = {
  character: CharacterId;
  obtained: boolean;
  lostFiftyFifty: boolean;
  wishesUsed: number;
  pity: number;
  guaranteed: boolean;
  constellation: number;
};

// Result of simulating pulls for a single character
export interface CharacterSimulationResult {
  character: CharacterId;
  obtained: boolean;
  hasWishesAllocated: boolean;
  lostFiftyFifty: boolean;
  wishesUsed: number;
  constellation: number;
}

// Success rate for each character involved in the simulation
type CharacterSuccessRates = Partial<Record<CharacterId, number>>;

// Result of a simulation for a single banner phase
export interface BannerSimulationResult {
  bannerId: VersionId;
  characterResults: Partial<Record<CharacterId, CharacterSimulationResult>>;
  wishesUsed: number;
  endPity: number;
  endGuaranteed: boolean;
}

export type ResultType = CharacterId | "-" | "Standard 5*" | "Missed";
// Outcome of a specific banner in a scenario
export interface ScenarioOutcome {
  banner: VersionId;
  result: [ResultType, ResultType];
  constellation: [number, number];
}

// A possible scenario with probability
export interface Scenario {
  outcomes: Record<VersionId, ScenarioOutcome>;
  probability: number;
}

// Scenario result for display - update to use BannerSimulationResult directly
export interface ScenarioResult {
  bannerResults: Record<VersionId, BannerSimulationResult>;
  count: number;
  percentage: number;
}

// The result for a single simulation run.
export type SimulationResult = Record<VersionId, BannerSimulationResult>;

// Complete simulation results
export interface SimulationResults {
  // Full detailed results by banner version
  bannerResults: Record<VersionId, BannerSimulationResult[]>;
  // Success rates for each character that was wished forin each banner
  characterSuccessRates: Record<VersionId, CharacterSuccessRates>;
  // Common scenario patterns
  topScenarios: ScenarioResult[];
}

export type OptimizationResults = Allocations[];

// User Data Types
// --------------

// User's wish resources
export interface WishResources {
  primogems: number;
  starglitter: number;
  stardust: number;
  genesisCrystal: number;
  limitedWishes: number;
  standardWishes: number;
}

// User's account status
export interface AccountStatus {
  currentPity: number;
  isNextFiftyFiftyGuaranteed: boolean;
  ownedWishResources: WishResources;
  primogemSources: PrimogemSourcesEnabled;
}

export type ResourceType =
  | "primogem"
  | "starglitter"
  | "limitedWish"
  | "standardWish"
  | "stardust"
  | "genesisCrystal";

export type ResourceValue = {
  value: number;
  type: ResourceType;
};

export type PrimogemSourceValue = ResourceValue | ResourceValue[];

export interface PrimogemSourceValues {
  // Permanent Contents
  gameUpdateCompensation: PrimogemSourceValue;
  dailyCommissions: PrimogemSourceValue;
  paimonBargain: PrimogemSourceValue;
  abyssAndTheater: PrimogemSourceValue;
  battlePass: PrimogemSourceValue;
  battlePassGnostic: PrimogemSourceValue;
  blessingOfWelkin: PrimogemSourceValue;
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
  thankYouGift: PrimogemSourceValue;
}

export const PRIMOGEM_SOURCE_VALUES: PrimogemSourceValues = {
  gameUpdateCompensation: { value: 600, type: "primogem" },
  dailyCommissions: { value: 2520, type: "primogem" },
  paimonBargain: [
    { value: 5, type: "limitedWish" },
    { value: 5, type: "standardWish" },
  ],
  abyssAndTheater: { value: 2400, type: "primogem" },
  battlePass: { value: 5, type: "standardWish" },
  battlePassGnostic: [
    { value: 4, type: "limitedWish" },
    { value: 680, type: "primogem" },
  ],
  blessingOfWelkin: { value: 3780, type: "primogem" },
  archonQuest: [
    { value: 2, type: "limitedWish" },
    { value: 620, type: "primogem" },
  ],
  storyQuests: { value: 120, type: "primogem" },
  newAchievements: { value: 200, type: "primogem" },

  // Time-Limited Contents
  characterTestRuns: { value: 80, type: "primogem" },
  eventActivities: { value: 1000, type: "primogem" },
  hoyolabDailyCheckIn: { value: 100, type: "primogem" },
  hoyolabWebEvents: { value: 100, type: "primogem" },
  livestreamCodes: { value: 300, type: "primogem" },
  newVersionCode: { value: 60, type: "primogem" },
  limitedExplorationRewards: { value: 400, type: "primogem" },
  thankYouGift: [
    { value: 10, type: "limitedWish" },
    { value: 1600, type: "primogem" },
  ],
};

// Extract the keys as a string literal union type
export type PrimogemSourceKey = keyof PrimogemSourceValues;

// You can now use this type for your boolean mapping
export type PrimogemSourcesEnabled = Record<PrimogemSourceKey, boolean>;

// Example of how to create a default state with all sources enabled
export const DEFAULT_PRIMOGEM_SOURCES_ENABLED: PrimogemSourcesEnabled = {
  // Permanent Contents
  gameUpdateCompensation: true,
  dailyCommissions: true,
  paimonBargain: true,
  abyssAndTheater: true,
  battlePass: true,
  battlePassGnostic: true,
  blessingOfWelkin: true,
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
  thankYouGift: true,
};

// Application modes
export type AppMode = "playground" | "strategy";
