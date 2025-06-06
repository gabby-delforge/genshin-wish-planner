/**
 * State shape for version 4
 *
 * This represents all types at version 4.
 * Used for type-safe migrations.
 *
 * This is a snapshot of types.ts at the time version 4 was created.
 * All JSON dependencies have been resolved to concrete types.
 * Generated on: 2025-06-06T15:39:13.630Z
 */

// API Data Types (resolved from JSON at generation time)
// ------------------------------------------------

export type ApiBanner = {
  id: string;
  version: string;
  name: string;
  startDate: string;
  endDate: string;
  characters: string[];
  weapons: string[];
};

export type ApiCharacter = {
  Id: string;
  IconSrc: string;
  Name: string;
  Quality: number;
  Element: string;
  Weapon: string;
  Region: string;
  ModelType: string;
};

export type ApiWeapon = {
  Id: string;
  IconSrc: string;
  Name: string;
  Quality: number;
  BaseATK: string;
  SecondStat: string;
  PassiveAbility: string;
};

export type BannerId = "5.6v2" | "5.7v1" | "5.7v2";
export type CharacterId =
  | "albedo"
  | "alhaitham"
  | "aloy"
  | "amber"
  | "arataki-itto"
  | "arlecchino"
  | "baizhu"
  | "barbara"
  | "beidou"
  | "bennett"
  | "candace"
  | "charlotte"
  | "chasca"
  | "chevreuse"
  | "chiori"
  | "chongyun"
  | "citlali"
  | "clorinde"
  | "collei"
  | "cyno"
  | "dehya"
  | "diluc"
  | "diona"
  | "dori"
  | "emilie"
  | "escoffier"
  | "eula"
  | "faruzan"
  | "fischl"
  | "freminet"
  | "furina"
  | "gaming"
  | "ganyu"
  | "gorou"
  | "hu-tao"
  | "iansan"
  | "ifa"
  | "jean"
  | "kachina"
  | "kaedehara-kazuha"
  | "kaeya"
  | "kamisato-ayaka"
  | "kamisato-ayato"
  | "kaveh"
  | "keqing"
  | "kinich"
  | "kirara"
  | "klee"
  | "kujou-sara"
  | "kuki-shinobu"
  | "lan-yan"
  | "layla"
  | "lisa"
  | "lynette"
  | "lyney"
  | "mavuika"
  | "mika"
  | "mona"
  | "mualani"
  | "nahida"
  | "navia"
  | "neuvillette"
  | "nilou"
  | "ningguang"
  | "noelle"
  | "ororon"
  | "qiqi"
  | "raiden-shogun"
  | "razor"
  | "rosaria"
  | "sangonomiya-kokomi"
  | "sayu"
  | "sethos"
  | "shenhe"
  | "shikanoin-heizou"
  | "sigewinne"
  | "skirk"
  | "sucrose"
  | "tartaglia"
  | "thoma"
  | "tighnari"
  | "traveler"
  | "varesa"
  | "venti"
  | "wanderer"
  | "wriothesley"
  | "xiangling"
  | "xianyun"
  | "xiao"
  | "xilonen"
  | "xingqiu"
  | "xinyan"
  | "yae-miko"
  | "yanfei"
  | "yaoyao"
  | "yelan"
  | "yoimiya"
  | "yumemizuki-mizuki"
  | "yun-jin"
  | "zhongli"
  | "";
export type WeaponId =
  | "a-thousand-blazing-suns"
  | "a-thousand-floating-dreams"
  | "absolution"
  | "amos-bow"
  | "aqua-simulacra"
  | "aquila-favonia"
  | "astral-vultures-crimson-plumage"
  | "azurelight"
  | "beacon-of-the-reed-sea"
  | "calamity-queller"
  | "cashflow-supervision"
  | "cranes-echoing-call"
  | "crimson-moons-semblance"
  | "elegy-for-the-end"
  | "engulfing-lightning"
  | "everlasting-moonglow"
  | "fang-of-the-mountain-king"
  | "freedom-sworn"
  | "haran-geppaku-futsu"
  | "hunters-path"
  | "jadefalls-splendor"
  | "kaguras-verity"
  | "key-of-khaj-nisut"
  | "light-of-foliar-incision"
  | "lost-prayer-to-the-sacred-winds"
  | "lumidouce-elegy"
  | "memory-of-dust"
  | "mistsplitter-reforged"
  | "peak-patrol-song"
  | "polar-star"
  | "primordial-jade-cutter"
  | "primordial-jade-winged-spear"
  | "redhorn-stonethresher"
  | "silvershower-heartstrings"
  | "skyward-atlas"
  | "skyward-blade"
  | "skyward-harp"
  | "skyward-pride"
  | "skyward-spine"
  | "song-of-broken-pines"
  | "splendor-of-tranquil-waters"
  | "staff-of-homa"
  | "staff-of-the-scarlet-sands"
  | "starcallers-watch"
  | "summit-shaper"
  | "sunny-morning-sleep-in"
  | "surfs-up"
  | "symphonist-of-scents"
  | "the-first-great-magic"
  | "the-unforged"
  | "thundering-pulse"
  | "tome-of-the-eternal-flow"
  | "tulaytullahs-remembrance"
  | "uraku-misugiri"
  | "verdict"
  | "vivid-notions"
  | "vortex-vanquisher"
  | "wolfs-gravestone"
  | "the-catch"
  | "ultimate-overlords-mega-magic-sword"
  | "akuoumaru"
  | "alley-hunter"
  | "amenoma-kageuchi"
  | "ash-graven-drinking-horn"
  | "ballad-of-the-boundless-blue"
  | "ballad-of-the-fjords"
  | "blackcliff-agate"
  | "blackcliff-longsword"
  | "blackcliff-pole"
  | "blackcliff-slasher"
  | "blackcliff-warbow"
  | "calamity-of-eshu"
  | "chain-breaker"
  | "cinnabar-spindle"
  | "cloudforged"
  | "compound-bow"
  | "crescent-pike"
  | "deathmatch"
  | "dialogues-of-the-desert-sages"
  | "dodoco-tales"
  | "dragons-bane"
  | "dragonspine-spear"
  | "earth-shaker"
  | "end-of-the-line"
  | "eye-of-perception"
  | "fading-twilight"
  | "favonius-codex"
  | "favonius-greatsword"
  | "favonius-lance"
  | "favonius-sword"
  | "favonius-warbow"
  | "festering-desire"
  | "finale-of-the-deep"
  | "fleuve-cendre-ferryman"
  | "flower-wreathed-feathers"
  | "flowing-purity"
  | "flute-of-ezpitzal"
  | "footprint-of-the-rainbow"
  | "forest-regalia"
  | "frostbearer"
  | "fruit-of-fulfillment"
  | "fruitful-hook"
  | "hakushin-ring"
  | "hamayumi"
  | "ibis-piercer"
  | "iron-sting"
  | "kagotsurube-isshin"
  | "katsuragikiri-nagamasa"
  | "kings-squire"
  | "kitain-cross-spear"
  | "lions-roar"
  | "lithic-blade"
  | "lithic-spear"
  | "luxurious-sea-lord"
  | "mailed-flower"
  | "makhaira-aquamarine"
  | "mappa-mare"
  | "missive-windspear"
  | "mitternachts-waltz"
  | "moonpiercer"
  | "mountain-bracing-bolt"
  | "mouuns-moon"
  | "oathsworn-eye"
  | "portable-power-saw"
  | "predator"
  | "prospectors-drill"
  | "prototype-amber"
  | "prototype-archaic"
  | "prototype-crescent"
  | "prototype-rancour"
  | "prototype-starglitter"
  | "rainslasher"
  | "range-gauge"
  | "rightful-reward"
  | "ring-of-yaxche"
  | "royal-bow"
  | "royal-greatsword"
  | "royal-grimoire"
  | "royal-longsword"
  | "royal-spear"
  | "rust"
  | "sacrificial-bow"
  | "sacrificial-fragments"
  | "sacrificial-greatsword"
  | "sacrificial-jade"
  | "sacrificial-sword"
  | "sapwood-blade"
  | "scion-of-the-blazing-sun"
  | "sequence-of-solitude"
  | "serpent-spine"
  | "snow-tombed-starsilver"
  | "solar-pearl"
  | "song-of-stillness"
  | "sturdy-bone"
  | "sword-of-descension"
  | "sword-of-narzissenkreuz"
  | "talking-stick"
  | "tamayuratei-no-ohanashi"
  | "the-alley-flash"
  | "the-bell"
  | "the-black-sword"
  | "the-dockhands-assistant"
  | "the-flute"
  | "the-stringless"
  | "the-viridescent-hunt"
  | "the-widsith"
  | "tidal-shadow"
  | "toukabou-shigure"
  | "wandering-evenstar"
  | "wavebreakers-fin"
  | "waveriding-whirl"
  | "whiteblind"
  | "windblume-ode"
  | "wine-and-song"
  | "wolf-fang"
  | "xiphos-moonlight"
  | "black-tassel"
  | "bloodtainted-greatsword"
  | "cool-steel"
  | "dark-iron-sword"
  | "debate-club"
  | "emerald-orb"
  | "ferrous-shadow"
  | "fillet-blade"
  | "halberd"
  | "harbinger-of-dawn"
  | "magic-guide"
  | "messenger"
  | "otherworldly-story"
  | "raven-bow"
  | "recurve-bow"
  | "sharpshooters-oath"
  | "skyrider-greatsword"
  | "skyrider-sword"
  | "slingshot"
  | "thrilling-tales-of-dragon-slayers"
  | "travelers-handy-sword"
  | "twin-nephrite"
  | "white-iron-greatsword"
  | "white-tassel"
  | "iron-point"
  | "old-mercs-pal"
  | "pocket-grimoire"
  | "seasoned-hunters-bow"
  | "silver-sword"
  | "apprentices-notes"
  | "beginners-protector"
  | "dull-blade"
  | "hunters-bow"
  | "waster-greatsword"
  | "prized-isshin-blade-awakened"
  | "prized-isshin-blade-shattered"
  | "sword-of-narzissenkreuz-quest";

// Application modes
export type AppMode = "playground" | "strategy";

// API Data Types (static data from external source)
// ------------------------------------------------

// API Character data

// export type BannerId = `${number}.${number}v${number}`;

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

// Generated state interface for version 4
// Based on PERSISTED_KEYS from GenshinState class
export interface GenshinStateV4 {
  characterPity: number;
  weaponPity: number;
  isNextCharacterFeaturedGuaranteed: boolean;
  isNextWeaponFeaturedGuaranteed: boolean;
  ownedWishResources: WishResources;
  primogemSources: PrimogemSourcesEnabled;
  shouldExcludeCurrentBannerEarnedWishes: boolean;
  mode: AppMode;
  playgroundSimulationResults: SimulationResults | null;
  optimizerSimulationResults: Record<string, BannerConfiguration>[] | null;
  bannerConfiguration: Record<BannerId, BannerConfiguration>;

  version: 4;
}
