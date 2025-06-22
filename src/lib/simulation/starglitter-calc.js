#!/usr/bin/env node

// Genshin Impact Starglitter Calculator
// Usage: node starglitter-calc.js --wishes 75 --characterPity 0 --character4StarPity 0 --characterGuaranteed false --character4StarGuaranteed false --characterConsecutive5050Losses 0

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    wishes: 1,
    characterPity: 0,
    character4StarPity: 0,
    characterGuaranteed: false,
    character4StarGuaranteed: false,
    characterConsecutive5050Losses: 0,
    weaponWishes: 0,
    weaponPity: 0,
    weaponGuaranteed: false,
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];

    if (key in params) {
      if (typeof params[key] === "boolean") {
        params[key] = value === "true";
      } else {
        params[key] = parseInt(value) || 0;
      }
    }
  }

  return params;
}

// Exact Genshin Impact probability functions
const getCharacter5StarProbability = (pity) => {
  if (pity < 73) {
    return 0.006; // Base rate 0.6%
  } else if (pity < 89) {
    return 0.006 + (pity - 72) * 0.06; // Soft pity
  } else {
    return 1.0; // Hard pity at 90
  }
};

const getCharacter4StarProbability = (pity) => {
  if (pity < 10) {
    return 0.051; // Base rate 5.1%
  } else {
    return 1.0; // Hard pity at 10
  }
};

const getWeapon5StarProbability = (pity) => {
  if (pity < 63) {
    return 0.007; // Base rate 0.7%
  } else if (pity < 77) {
    return 0.007 + (pity - 62) * 0.07; // Soft pity
  } else {
    return 1.0; // Hard pity at 77
  }
};

// Banner composition constants
const CHARACTER_BANNER_4STAR_SPLITS = {
  WEAPON_CHANCE: 0.2833,
  CHARACTER_CHANCE: 0.7167,
};

const WEAPON_BANNER_4STAR_SPLITS = {
  WEAPON_CHANCE: 0.815,
  CHARACTER_CHANCE: 0.185,
};

// Starglitter amounts
const STARGLITTER_AMOUNTS = {
  "4StarWeapon": 2,
  "5StarWeapon": 10,
  "4StarCharacter": 2,
  "4StarC6Character": 5,
  "5StarStandardCharacter": 10,
  "5StarLimitedCharacter": 10,
  "5StarC6LimitedCharacter": 25,
  "5StarC6StandardCharacter": 25,
};

// Default probability weights (how likely you already have the character/weapon)
const DEFAULT_WEIGHTS = {
  "4StarWeapon": 1.0,
  "5StarWeapon": 1.0,
  "4StarCharacter": 0.9,
  "4StarC6Character": 0.1,
  "5StarStandardCharacter": 0.5,
  "5StarLimitedCharacter": 0.05,
  "5StarC6LimitedCharacter": 0.001,
  "5StarC6StandardCharacter": 0.05,
};

// Calculate expected stars with pity mechanics
function calculateExpectedStarsWithPity(
  wishes,
  startingPity,
  type,
  bannerType = "character"
) {
  if (wishes <= 0) return 0;

  let totalExpected = 0;
  let currentPity = startingPity;

  for (let i = 0; i < wishes; i++) {
    currentPity++;

    let probability;
    if (type === "4star") {
      probability = getCharacter4StarProbability(currentPity);
    } else if (type === "5star" && bannerType === "character") {
      probability = getCharacter5StarProbability(currentPity);
    } else if (type === "5star" && bannerType === "weapon") {
      probability = getWeapon5StarProbability(currentPity);
    }

    totalExpected += probability;

    // Expected pity reset weighted by probability
    currentPity = currentPity * (1 - probability);
  }

  return totalExpected;
}

// Calculate character banner starglitter
function calculateCharacterBannerStarglitter(params) {
  const {
    wishes,
    characterPity,
    character4StarPity,
    characterGuaranteed,
    characterConsecutive5050Losses,
  } = params;

  if (wishes <= 0) return { totalStarglitter: 0, breakdown: {} };

  const expected4Stars = calculateExpectedStarsWithPity(
    wishes,
    character4StarPity,
    "4star"
  );
  const expected5Stars = calculateExpectedStarsWithPity(
    wishes,
    characterPity,
    "5star",
    "character"
  );

  // 4-star breakdown
  const char4StarWeapons =
    expected4Stars * CHARACTER_BANNER_4STAR_SPLITS.WEAPON_CHANCE;
  const char4StarCharacters =
    expected4Stars * CHARACTER_BANNER_4STAR_SPLITS.CHARACTER_CHANCE;

  const weapon4StarStarglitter =
    char4StarWeapons * STARGLITTER_AMOUNTS["4StarWeapon"];
  const character4StarStarglitter =
    char4StarCharacters *
    (DEFAULT_WEIGHTS["4StarCharacter"] * STARGLITTER_AMOUNTS["4StarCharacter"] +
      DEFAULT_WEIGHTS["4StarC6Character"] *
        STARGLITTER_AMOUNTS["4StarC6Character"]);

  // 5-star breakdown with guarantee mechanics
  let featuredCharProb, standardCharProb;

  if (characterGuaranteed) {
    featuredCharProb = 1.0;
    standardCharProb = 0.0;
  } else if (characterConsecutive5050Losses >= 2) {
    featuredCharProb = 1.0; // Capturing Radiance
    standardCharProb = 0.0;
  } else {
    featuredCharProb = 0.5; // Normal 50/50
    standardCharProb = 0.5;
  }

  const expectedFeatured5Stars = expected5Stars * featuredCharProb;
  const expectedStandard5Stars = expected5Stars * standardCharProb;

  const featured5StarStarglitter =
    expectedFeatured5Stars *
    (DEFAULT_WEIGHTS["5StarLimitedCharacter"] *
      STARGLITTER_AMOUNTS["5StarLimitedCharacter"] +
      DEFAULT_WEIGHTS["5StarC6LimitedCharacter"] *
        STARGLITTER_AMOUNTS["5StarC6LimitedCharacter"]);

  const standard5StarStarglitter =
    expectedStandard5Stars *
    (DEFAULT_WEIGHTS["5StarStandardCharacter"] *
      STARGLITTER_AMOUNTS["5StarStandardCharacter"] +
      DEFAULT_WEIGHTS["5StarC6StandardCharacter"] *
        STARGLITTER_AMOUNTS["5StarC6StandardCharacter"]);

  const totalStarglitter =
    weapon4StarStarglitter +
    character4StarStarglitter +
    featured5StarStarglitter +
    standard5StarStarglitter;

  return {
    totalStarglitter,
    breakdown: {
      expected4Stars,
      expected5Stars,
      weapon4StarStarglitter,
      character4StarStarglitter,
      featured5StarStarglitter,
      standard5StarStarglitter,
    },
  };
}

// Calculate weapon banner starglitter
function calculateWeaponBannerStarglitter(params) {
  const { weaponWishes, weaponPity, weaponGuaranteed } = params;

  if (weaponWishes <= 0) return { totalStarglitter: 0, breakdown: {} };

  const expected4Stars = calculateExpectedStarsWithPity(
    weaponWishes,
    0,
    "4star"
  );
  const expected5Stars = calculateExpectedStarsWithPity(
    weaponWishes,
    weaponPity,
    "5star",
    "weapon"
  );

  // 4-star breakdown
  const weapon4StarWeapons =
    expected4Stars * WEAPON_BANNER_4STAR_SPLITS.WEAPON_CHANCE;
  const weapon4StarCharacters =
    expected4Stars * WEAPON_BANNER_4STAR_SPLITS.CHARACTER_CHANCE;

  const weapon4StarStarglitter =
    weapon4StarWeapons * STARGLITTER_AMOUNTS["4StarWeapon"];
  const weapon4StarCharactersStarglitter =
    weapon4StarCharacters *
    (DEFAULT_WEIGHTS["4StarCharacter"] * STARGLITTER_AMOUNTS["4StarCharacter"] +
      DEFAULT_WEIGHTS["4StarC6Character"] *
        STARGLITTER_AMOUNTS["4StarC6Character"]);

  const weapon5StarStarglitter =
    expected5Stars * STARGLITTER_AMOUNTS["5StarWeapon"];

  const totalStarglitter =
    weapon4StarStarglitter +
    weapon4StarCharactersStarglitter +
    weapon5StarStarglitter;

  return {
    totalStarglitter,
    breakdown: {
      expected4Stars,
      expected5Stars,
      weapon4StarStarglitter,
      weapon4StarCharactersStarglitter,
      weapon5StarStarglitter,
    },
  };
}

// Main function
function main() {
  const params = parseArgs();

  console.log("Genshin Impact Starglitter Calculator");
  console.log("=====================================");
  console.log(`Wishes: ${params.wishes}`);

  let totalStarglitter = 0;

  // Character banner calculation
  if (params.wishes > 0) {
    console.log(`\nCharacter Banner:`);
    console.log(`- 5-star pity: ${params.characterPity}`);
    console.log(`- 4-star pity: ${params.character4StarPity}`);
    console.log(`- Guaranteed 5-star: ${params.characterGuaranteed}`);
    console.log(
      `- Guaranteed 4-star character: ${params.character4StarGuaranteed}`
    );
    console.log(
      `- Consecutive 50/50 losses: ${params.characterConsecutive5050Losses}`
    );

    const charResult = calculateCharacterBannerStarglitter(params);
    console.log(
      `- Total starglitter: ${charResult.totalStarglitter.toFixed(6)}`
    );
    totalStarglitter += charResult.totalStarglitter;
  }

  // Weapon banner calculation
  if (params.weaponWishes > 0) {
    console.log(`\nWeapon Banner:`);
    console.log(`- Wishes: ${params.weaponWishes}`);
    console.log(`- 5-star pity: ${params.weaponPity}`);
    console.log(`- Guaranteed featured: ${params.weaponGuaranteed}`);

    const weaponResult = calculateWeaponBannerStarglitter(params);
    console.log(
      `- Total starglitter: ${weaponResult.totalStarglitter.toFixed(6)}`
    );
    totalStarglitter += weaponResult.totalStarglitter;
  }

  console.log(`\nFinal Result: ${totalStarglitter.toFixed(6)} starglitter`);
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  calculateCharacterBannerStarglitter,
  calculateWeaponBannerStarglitter,
  parseArgs,
};
