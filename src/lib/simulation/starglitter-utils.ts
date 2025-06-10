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

import {
  CHARACTER_BANNER_4STAR_SPLITS,
  getCharacter4StarProbability,
  getCharacter5StarProbability,
} from "./character-banner-model";
import {
  getWeapon5StarProbability,
  WEAPON_BANNER_4STAR_SPLITS,
} from "./weapon-banner-model";

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
 * Calculate expected number of 4-star pulls from given wishes with current pity state
 * Updated to use character-banner-model probability function for accuracy
 */
const calculateExpected4StarsWithPity = (
  wishes: number,
  starting4StarPity: number = 0
): number => {
  if (wishes <= 0) return 0;

  let expected4Stars = 0;
  let pity = starting4StarPity;

  for (let wishIndex = 0; wishIndex < wishes; wishIndex++) {
    pity++;

    // Probability of pulling a 4-star
    const probability = getCharacter4StarProbability(pity);

    // Always add probability to expected value
    expected4Stars += probability;

    // Weighted pity reset
    pity = pity * (1 - probability);
  }

  return expected4Stars;
};

/**
 * Calculate expected 5-stars with current pity and guarantee states - reuses simulation probability functions
 */
const calculateExpected5StarsWithPityAndGuarantees = (
  wishes: number,
  currentPity: number,
  bannerType: "character" | "weapon",
  guaranteed: boolean = false,
  consecutive5050Losses: number = 0
): number => {
  if (wishes <= 0) return 0;

  let expected5Stars = 0;
  let pity = currentPity;
  let isGuaranteed = guaranteed;
  let consecutiveLosses = consecutive5050Losses;

  for (let wishIndex = 0; wishIndex < wishes; wishIndex++) {
    pity++;

    // Get base probability
    const probability =
      bannerType === "character"
        ? getCharacter5StarProbability(pity)
        : getWeapon5StarProbability(pity);

    expected5Stars += probability;

    // Update guarantee state based on current state and pull outcome
    if (bannerType === "character") {
      if (isGuaranteed) {
        // Next 5-star is guaranteed featured, then back to 50/50
        isGuaranteed = false;
        consecutiveLosses = 0;
      } else if (consecutiveLosses >= 2) {
        // Capturing Radiance guarantees featured
        consecutiveLosses = 0;
      } else {
        // Normal 50/50 - weighted update for expected consecutive losses
        consecutiveLosses = Math.min(2, consecutiveLosses + 0.5 * probability);
        // 50% chance of losing 50/50, weighted by probability of getting 5-star
        isGuaranteed = probability * 0.5 > 0.25; // Simplified logic
      }
    }

    // Weighted pity reset
    pity = pity * (1 - probability);
  }

  return expected5Stars;
};

/**
 * Calculate expected starglitter with current pity taken into account
 * This provides deterministic results unlike the simulation-based functions
 * Updated to use character-banner-model probability functions for more accuracy
 */
export const calculateExpectedStarglitterWithPity = (
  characterWishes: number,
  weaponWishes: number,
  characterPity: number = 0,
  weaponPity: number = 0,
  characterGuaranteed: boolean = false,
  weaponGuaranteed: boolean = false,
  character4StarPity: number = 0,
  characterConsecutive5050Losses: number = 0
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

  const weaponExpected5Stars = calculateExpected5StarsWithPityAndGuarantees(
    weaponWishes,
    weaponPity,
    "weapon",
    weaponGuaranteed
  );

  // Weapon banner starglitter
  let weaponStarglitter = 0;
  if (weaponWishes > 0) {
    // Calculate expected number of 4- and 5-star weapons acquired
    const expectedNum4StarWeapons =
      calculateExpected4StarsWithPity(weaponWishes);
    // Use constants from weapon-banner-model
    const weapon4StarWeapons =
      expectedNum4StarWeapons * WEAPON_BANNER_4STAR_SPLITS.WEAPON_CHANCE;
    const weapon4StarCharacters =
      expectedNum4StarWeapons * WEAPON_BANNER_4STAR_SPLITS.CHARACTER_CHANCE;

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
    const expectedNum4StarCharacters = calculateExpected4StarsWithPity(
      characterWishes,
      character4StarPity
    );
    // Use constants from character-banner-model
    const char4StarWeapons =
      expectedNum4StarCharacters * CHARACTER_BANNER_4STAR_SPLITS.WEAPON_CHANCE;
    const char4StarCharacters =
      expectedNum4StarCharacters *
      CHARACTER_BANNER_4STAR_SPLITS.CHARACTER_CHANCE;
    const char4StarStarglitter =
      char4StarWeapons * STARGLITTER_AMOUNTS["4StarWeapon"] +
      char4StarCharacters *
        (DEFAULT_WEIGHTS["4StarCharacter"] *
          STARGLITTER_AMOUNTS["4StarCharacter"] +
          DEFAULT_WEIGHTS["4StarC6Character"] *
            STARGLITTER_AMOUNTS["4StarC6Character"]);

    const characterExpected5Stars =
      calculateExpected5StarsWithPityAndGuarantees(
        characterWishes,
        characterPity,
        "character",
        characterGuaranteed,
        characterConsecutive5050Losses
      );

    const featuredStarglitter =
      characterExpected5Stars *
      0.5 *
      (DEFAULT_WEIGHTS["5StarLimitedCharacter"] *
        STARGLITTER_AMOUNTS["5StarLimitedCharacter"] +
        DEFAULT_WEIGHTS["5StarC6LimitedCharacter"] *
          STARGLITTER_AMOUNTS["5StarC6LimitedCharacter"]);

    const standardStarglitter =
      characterExpected5Stars *
      0.5 *
      (DEFAULT_WEIGHTS["5StarStandardCharacter"] *
        STARGLITTER_AMOUNTS["5StarStandardCharacter"] +
        DEFAULT_WEIGHTS["5StarC6StandardCharacter"] *
          STARGLITTER_AMOUNTS["5StarC6StandardCharacter"]);

    const char5StarStarglitter = featuredStarglitter + standardStarglitter;

    characterStarglitter = char4StarStarglitter + char5StarStarglitter;
  }

  return {
    characterStarglitter,
    weaponStarglitter,
    totalStarglitter: characterStarglitter + weaponStarglitter,
  };
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
 * Updated to use character-banner-model probability functions for more accuracy
 */
export const calculateWishesEarnedFromStarglitter = (
  baseCharacterWishes: number,
  baseWeaponWishes: number,
  characterPity: number = 0,
  weaponPity: number = 0,
  characterGuaranteed: boolean = false,
  weaponGuaranteed: boolean = false,
  character4StarPity: number = 0,
  character4StarGuaranteed: boolean = false,
  characterConsecutive5050Losses: number = 0
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
      weaponPity,
      characterGuaranteed,
      weaponGuaranteed,
      character4StarPity,
      characterConsecutive5050Losses
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
