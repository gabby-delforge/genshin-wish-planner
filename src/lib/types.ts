// Core type definitions for Genshin Impact wish planning

export type VersionId = `${number}.${number}v${number}`;
export type CharacterId = string; // Using character name as ID for readability

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

// Character with user-specific state
export interface Character extends ApiCharacter {
  wishesToSpend: number;
  priority: "must-have" | "want" | "nice-to-have" | "skip";
}

// Banner with user-specific state
export type Banner = ApiBanner;

// Enhanced banner with runtime calculation state
export interface RuntimeBanner extends Banner {
  estimatedNewWishes: number;
  wishesAvailableToSpend: number;
}

// Simulation Result Types
// ----------------------

// Result of simulating pulls for a single character
export interface CharacterSimulationResult {
  character: CharacterId;
  obtained: boolean;
  hasWishesAllocated: boolean;
  lostFiftyFifty: boolean;
  wishesUsed: number;
}

// Success rate for a character in simulations
export interface CharacterSuccessRate {
  character: CharacterId;
  rate: number;
}

// Result of a simulation for a single banner phase
export interface BannerSimulationResult {
  bannerId: VersionId;
  characterResults: CharacterSimulationResult[];
  wishesUsed: number;
  endPity: number;
  endGuaranteed: boolean;
}

// Summary of a simulation result for display
export interface SimulationResultSummary {
  banner: string;
  character: string;
  successRate: number;
  averageWishes: number;
}

// Outcome of a specific banner in a scenario
export interface ScenarioOutcome {
  banner: VersionId;
  result: "Success" | "Missed" | "Skipped";
  character: CharacterId;
}

// A possible scenario with probability
export interface Scenario {
  id: number;
  outcomes: ScenarioOutcome[];
  probability: number;
}

// Scenario result pattern for display
export interface ScenarioResult {
  pattern: string;
  count: number;
  percentage: string;
}

// Complete simulation results
export interface SimulationResults {
  // Full detailed results by banner version
  bannerResults: Record<VersionId, BannerSimulationResult[]>;
  // Success rates for each character in each banner
  characterSuccessRates: Record<VersionId, CharacterSuccessRate[]>;
  // Overall banner success rates
  bannerSuccessRates: Record<VersionId, number>;
  // Common scenario patterns
  scenarioBreakdown: ScenarioResult[];
  // Available wishes per banner
  availableWishes: Record<VersionId, number>;
}

// User Data Types
// --------------

// User's wish resources
export interface WishResources {
  primogems: number;
  starglitter: number;
  wishes: number;
}

// User's account status
export interface AccountStatus {
  currentPity: number;
  isGuaranteed: boolean;
  wishResources: WishResources;
  hasWelkin: boolean;
  hasBattlePass: boolean;
  addEstimatedWishes: boolean;
  addExplorationWishes: boolean;
}

// Wish allocation per banner
export type WishAllocation = Record<VersionId, Record<CharacterId, number>>;

// Want/priority allocation per banner
export type WantAllocation = Record<VersionId, Record<CharacterId, string>>;

// Application modes
export type AppMode = "playground" | "optimizer";
