/**
 * Utility functions for calculating masterless starglitter from wishes
 *
 * Masterless starglitter is obtained from:
 * - ANY 4-star weapon pull: 2 starglitter (including first copy)
 * - 4-star character duplicate: 2 starglitter (only duplicates beyond first copy)
 * - ANY 5-star weapon pull: 10 starglitter (including first copy)
 * - 5-star character duplicate: 10 starglitter (only duplicates beyond first copy)
 * - 5 starglitter = 1 wish (Intertwined/Acquaint Fate)
 */

import { getCharacter5StarProbability } from "./character-banner-model";
import { getWeapon5StarProbability } from "./weapon-banner-model";

interface WishRates {
  fourStarBaseRate: number;
  fourStarHardPity: number;
  fiveStarBaseRate: number;
  fiveStarHardPity: number;
  softPityStart: number;
}

const STANDARD_RATES: WishRates = {
  fourStarBaseRate: 0.051, // 5.1%
  fourStarHardPity: 10,
  fiveStarBaseRate: 0.006, // 0.6%
  fiveStarHardPity: 90,
  softPityStart: 74,
};

/**
 * Calculate expected number of 4-star pulls from given wishes
 */
const calculateExpected4Stars = (wishes: number): number => {
  if (wishes <= 0) return 0;

  const guaranteed4Stars = Math.floor(wishes / STANDARD_RATES.fourStarHardPity);
  const remainingWishes = wishes % STANDARD_RATES.fourStarHardPity;

  let expected4StarsFromRemaining = 0;
  for (let i = 1; i <= remainingWishes; i++) {
    // 4-star rate increases dramatically after pull 8 in a 10-pull cycle
    const rate = i <= 8 ? STANDARD_RATES.fourStarBaseRate : 1.0; // Guaranteed on 9th or 10th
    expected4StarsFromRemaining += rate;
  }

  return (
    guaranteed4Stars + Math.min(expected4StarsFromRemaining, remainingWishes)
  );
};

export const STARGLITTER_AMOUNTS = {
  "4StarWeapon": 2,
  "5StarWeapon": 10,

  "4StarCharacter": 2,
  "4StarC6Character": 5,
  "5StarStandardCharacter": 10,
  "5StarLimitedCharacter": 10,
  "5StarC6LimitedCharacter": 25,
  "5StarC6StandardCharacter": 25,
};

// How often you will get starglitter; ie. how likely it is you already have that character/weapon.
export const DEFAULT_WEIGHTS: Record<keyof typeof STARGLITTER_AMOUNTS, number> =
  {
    // You always get Starglitter for weapons
    "4StarWeapon": 1,
    "5StarWeapon": 1,

    "4StarCharacter": 0.9,
    "4StarC6Character": 0.1,
    "5StarStandardCharacter": 0.5,
    "5StarLimitedCharacter": 0.05,
    "5StarC6LimitedCharacter": 0.001,
    "5StarC6StandardCharacter": 0.05,
  };

/**
 * Calculate expected starglitter with current pity taken into account
 * This provides deterministic results unlike the simulation-based functions
 */
export const calculateExpectedStarglitterWithPity = (
  characterWishes: number,
  weaponWishes: number,
  characterPity: number = 0,
  weaponPity: number = 0
): {
  totalStarglitter: number;
  characterStarglitter: number;
  weaponStarglitter: number;
} => {
  if (characterWishes <= 0 && weaponWishes <= 0) {
    return {
      totalStarglitter: 0,
      characterStarglitter: 0,
      weaponStarglitter: 0,
    };
  }

  const weaponExpected5Stars = calculateExpected5StarsWithPity(
    weaponWishes,
    weaponPity,
    "weapon"
  );

  // Weapon banner starglitter
  let weaponStarglitter = 0;
  if (weaponWishes > 0) {
    // Calculate expected number of 4- and 5-star weapons acquired
    const expectedNum4StarWeapons = calculateExpected4Stars(weaponWishes);
    // 81.5% chance of getting a weapon, 18.5% chance of getting a character
    // (https://antifandom.com/genshin-impact/wiki/Wish/Expanded_Wish_Probabilities#Non-Featured_Drop_Probability)
    const weapon4StarWeapons = expectedNum4StarWeapons * 0.815;
    const weapon4StarCharacters = expectedNum4StarWeapons * 0.185;

    // Estimate starglitter for those weapons (and potential non-featured 4* characters)
    const weapon4StarStarglitter =
      weapon4StarWeapons *
      DEFAULT_WEIGHTS["4StarWeapon"] *
      STARGLITTER_AMOUNTS["4StarWeapon"];

    const weapon4StarCharactersStarglitter =
      weapon4StarCharacters *
      (DEFAULT_WEIGHTS["4StarCharacter"] *
        STARGLITTER_AMOUNTS["4StarCharacter"] +
        DEFAULT_WEIGHTS["4StarC6Character"] *
          STARGLITTER_AMOUNTS["4StarC6Character"]);

    const weapon5StarStarglitter =
      weaponExpected5Stars * STARGLITTER_AMOUNTS["5StarWeapon"];

    weaponStarglitter =
      weapon4StarStarglitter +
      weapon5StarStarglitter +
      weapon4StarCharactersStarglitter;
  }

  // Character starglitter
  let characterStarglitter = 0;
  if (characterWishes > 0) {
    const expectedNum4StarCharacters = calculateExpected4Stars(characterWishes);
    // 28.33% chance of getting a weapon, 71.67% chance of getting a character
    // (https://antifandom.com/genshin-impact/wiki/Wish/Expanded_Wish_Probabilities#Non-Featured_Drop_Probability)

    const char4StarWeapons = expectedNum4StarCharacters * 0.2833;
    const char4StarCharacters = expectedNum4StarCharacters * 0.7167;
    const char4StarStarglitter =
      char4StarWeapons * STARGLITTER_AMOUNTS["4StarWeapon"] +
      char4StarCharacters *
        (DEFAULT_WEIGHTS["4StarCharacter"] *
          STARGLITTER_AMOUNTS["4StarCharacter"] +
          DEFAULT_WEIGHTS["4StarC6Character"] *
            STARGLITTER_AMOUNTS["4StarC6Character"]);

    const characterExpected5Stars = calculateExpected5StarsWithPity(
      characterWishes,
      characterPity,
      "character"
    );
    const char5StarStarglitter =
      characterExpected5Stars *
      (0.5 *
        (0.5 * DEFAULT_WEIGHTS["5StarLimitedCharacter"] +
          0.5 * DEFAULT_WEIGHTS["5StarC6LimitedCharacter"]) +
        0.5 *
          (0.5 * DEFAULT_WEIGHTS["5StarStandardCharacter"] +
            0.5 * DEFAULT_WEIGHTS["5StarC6LimitedCharacter"]));

    characterStarglitter = char4StarStarglitter + char5StarStarglitter;
  }

  return {
    characterStarglitter,
    weaponStarglitter,
    totalStarglitter: characterStarglitter + weaponStarglitter,
  };
};

/**
 * Calculate expected 5-stars with current pity - reuses simulation probability functions
 */
const calculateExpected5StarsWithPity = (
  wishes: number,
  currentPity: number,
  bannerType: "character" | "weapon"
): number => {
  if (wishes <= 0) return 0;

  let expected5Stars = 0;
  let pity = currentPity;

  for (let wishIndex = 0; wishIndex < wishes; wishIndex++) {
    pity++;

    // Use the exact same probability functions as the simulation
    const probability =
      bannerType === "character"
        ? getCharacter5StarProbability(pity)
        : getWeapon5StarProbability(pity);

    // Add the probability of getting a 5-star on this wish
    expected5Stars += probability;

    // If guaranteed 5-star, reset pity for next cycle
    if (probability >= 1.0) {
      pity = 0;
    }
  }

  return expected5Stars;
};

export const calculateMaxSpendableWishesMultiBanner = (
  plannedCharacterWishes: number,
  plannedWeaponWishes: number
): {
  actualCharacterWishes: number;
  actualWeaponWishes: number;
  starglitterWishesGained: number;
} => {
  const totalPlannedWishes = plannedCharacterWishes + plannedWeaponWishes;

  if (totalPlannedWishes <= 0) {
    return {
      actualCharacterWishes: 0,
      actualWeaponWishes: 0,
      starglitterWishesGained: 0,
    };
  }

  // Calculate starglitter from planned spending
  let starglitterResult = calculateExpectedStarglitterWithPity(
    plannedCharacterWishes,
    plannedWeaponWishes
  );

  // Recalculate starglitter with actual spending amounts
  starglitterResult = calculateExpectedStarglitterWithPity(
    plannedCharacterWishes + starglitterResult.characterStarglitter,
    plannedWeaponWishes + starglitterResult.weaponStarglitter
  );

  return {
    actualCharacterWishes: starglitterResult.characterStarglitter / 5,
    actualWeaponWishes: starglitterResult.weaponStarglitter / 5,
    starglitterWishesGained: starglitterResult.totalStarglitter,
  };
};

/**
 * Iteratively calculates the maximum spendable wishes including starglitter until convergence
 * @param baseCharacterWishes - Base character wishes to spend
 * @param baseWeaponWishes - Base weapon wishes to spend
 * @param characterPity - Current character pity count
 * @param weaponPity - Current weapon pity count
 * @returns Total starglitter wishes earned from the given allocation
 */
export const calculateWishesEarnedFromStarglitter = (
  baseCharacterWishes: number,
  baseWeaponWishes: number,
  characterPity: number = 0,
  weaponPity: number = 0
): number => {
  if (baseCharacterWishes <= 0 && baseWeaponWishes <= 0) {
    return 0;
  }

  let totalCharWishes = baseCharacterWishes;
  let totalWeaponWishes = baseWeaponWishes;
  let previousTotal = 0;
  let iterations = 0;
  const maxIterations = 10; // Safety limit
  const convergenceThreshold = 0.1;

  while (
    Math.abs(totalCharWishes + totalWeaponWishes - previousTotal) >
      convergenceThreshold &&
    iterations < maxIterations
  ) {
    previousTotal = totalCharWishes + totalWeaponWishes;

    const starglitterResult = calculateExpectedStarglitterWithPity(
      totalCharWishes,
      totalWeaponWishes,
      characterPity,
      weaponPity
    );

    const starglitterWishes = Math.floor(
      (starglitterResult.characterStarglitter +
        starglitterResult.weaponStarglitter) /
        5
    );

    // Distribute additional starglitter proportionally to the base allocation
    const totalBase = baseCharacterWishes + baseWeaponWishes;
    if (totalBase > 0) {
      const charRatio = baseCharacterWishes / totalBase;
      const weaponRatio = baseWeaponWishes / totalBase;

      totalCharWishes =
        baseCharacterWishes + Math.floor(starglitterWishes * charRatio);
      totalWeaponWishes =
        baseWeaponWishes + Math.floor(starglitterWishes * weaponRatio);
    }

    iterations++;
  }

  const wishesEarned =
    totalCharWishes +
    totalWeaponWishes -
    (baseCharacterWishes + baseWeaponWishes);

  return wishesEarned;
};
