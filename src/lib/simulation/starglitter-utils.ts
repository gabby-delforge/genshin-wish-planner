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

/**
 * Calculate expected number of 5-star pulls from given wishes
 */
const calculateExpected5Stars = (wishes: number): number => {
  if (wishes <= 0) return 0;

  // Simplified calculation - in reality this is more complex due to soft pity
  // But for Starglitter purposes, we can use average rates
  const averageRate = 0.016; // ~1.6% including soft pity effects
  return wishes * averageRate;
};

/**
 * Calculate expected starglitter from weapons and character duplicates
 * @param wishes Number of wishes to simulate
 * @param weaponRate Probability that a 4-star is a weapon (default ~50%)
 * @param duplicateRate Probability that a 4-star character is a duplicate (default ~80% for experienced players)
 * @param fiveStarWeaponRate Probability that a 5-star is a weapon (default ~50% on standard banner)
 * @param fiveStarDuplicateRate Probability that a 5-star character is a duplicate (default ~20%)
 */
export const calculateExpectedStarglitter = (
  wishes: number,
  weaponRate: number = 0.5,
  duplicateRate: number = 0.8,
  fiveStarWeaponRate: number = 0.5,
  fiveStarDuplicateRate: number = 0.2
): number => {
  if (wishes <= 0) return 0;

  const expected4Stars = calculateExpected4Stars(wishes);
  const expected5Stars = calculateExpected5Stars(wishes);

  // 4-star starglitter calculation
  const fourStarWeapons = expected4Stars * weaponRate; // All weapons give starglitter
  const fourStarCharacters = expected4Stars * (1 - weaponRate);
  const fourStarCharacterDuplicates = fourStarCharacters * duplicateRate; // Only duplicates give starglitter
  const fourStarStarglitter =
    (fourStarWeapons + fourStarCharacterDuplicates) * 2;

  // 5-star starglitter calculation
  const fiveStarWeapons = expected5Stars * fiveStarWeaponRate; // All weapons give starglitter
  const fiveStarCharacters = expected5Stars * (1 - fiveStarWeaponRate);
  const fiveStarCharacterDuplicates =
    fiveStarCharacters * fiveStarDuplicateRate; // Only duplicates give starglitter
  const fiveStarStarglitter =
    (fiveStarWeapons + fiveStarCharacterDuplicates) * 10;

  const totalStarglitter = fourStarStarglitter + fiveStarStarglitter;
  return Math.floor(totalStarglitter / 5); // 5 starglitter = 1 wish
};

/**
 * Calculate maximum wishes including starglitter feedback loop
 * This iteratively calculates how many additional wishes can be gained from starglitter
 */
export const calculateMaximumWishesWithStarglitter = (
  initialWishes: number,
  weaponRate: number = 0.5,
  duplicateRate: number = 0.8,
  fiveStarWeaponRate: number = 0.5,
  fiveStarDuplicateRate: number = 0.2
): number => {
  let totalWishes = initialWishes;
  let previousTotal = 0;
  let iteration = 0;
  const maxIterations = 20;
  const convergenceThreshold = 0.1;

  while (
    iteration < maxIterations &&
    Math.abs(totalWishes - previousTotal) > convergenceThreshold
  ) {
    previousTotal = totalWishes;

    const starglitterWishes = calculateExpectedStarglitter(
      totalWishes,
      weaponRate,
      duplicateRate,
      fiveStarWeaponRate,
      fiveStarDuplicateRate
    );

    // Total wishes = initial wishes + starglitter wishes
    totalWishes = initialWishes + starglitterWishes;
    iteration++;
  }

  return Math.floor(totalWishes);
};

/**
 * Calculate starglitter wishes from a specific number of base wishes
 * This is a simpler calculation that doesn't account for the feedback loop
 */
export const calculateStarglitterWishesFromBase = (
  baseWishes: number,
  weaponRate: number = 0.5,
  duplicateRate: number = 0.8,
  fiveStarWeaponRate: number = 0.5,
  fiveStarDuplicateRate: number = 0.2
): number => {
  return calculateExpectedStarglitter(
    baseWishes,
    weaponRate,
    duplicateRate,
    fiveStarWeaponRate,
    fiveStarDuplicateRate
  );
};

/**
 * Calculate maximum wishes available for a banner including starglitter gains
 */
export const calculateMaximumWishesForBanner = (
  availableWishesForBanner: number,
  estimatedNewWishesForBanner: number = 0,
  weaponRate: number = 0.5,
  duplicateRate: number = 0.8,
  fiveStarWeaponRate: number = 0.5,
  fiveStarDuplicateRate: number = 0.2
): number => {
  const totalBaseWishes =
    availableWishesForBanner + estimatedNewWishesForBanner;
  return calculateMaximumWishesWithStarglitter(
    totalBaseWishes,
    weaponRate,
    duplicateRate,
    fiveStarWeaponRate,
    fiveStarDuplicateRate
  );
};

/**
 * Calculate maximum wishes that can be spent on a banner
 * This solves for the amount that when spent, generates exactly enough starglitter
 * to make the total spent wishes equal to the available wishes (including starglitter feedback)
 */
export const calculateMaximumSpendableWishes = (
  availableWishesFromState: number,
  weaponRate: number = 0.5,
  duplicateRate: number = 0.8,
  fiveStarWeaponRate: number = 0.5,
  fiveStarDuplicateRate: number = 0.2
): number => {
  if (availableWishesFromState <= 0) return 0;

  // Use iterative approach to find convergence point
  let totalWishes = availableWishesFromState;
  let previousTotal = 0;
  let iteration = 0;
  const maxIterations = 50;
  const convergenceThreshold = 0.1;

  while (
    iteration < maxIterations &&
    Math.abs(totalWishes - previousTotal) > convergenceThreshold
  ) {
    previousTotal = totalWishes;

    const starglitterWishes = calculateStarglitterWishesFromBase(
      totalWishes,
      weaponRate,
      duplicateRate,
      fiveStarWeaponRate,
      fiveStarDuplicateRate
    );

    // Total available = base available + starglitter from spending
    totalWishes = availableWishesFromState + starglitterWishes;
    iteration++;
  }

  return Math.floor(totalWishes);
};

/**
 * Calculate actual "cashback" rate as a percentage
 * This shows the effective return rate of starglitter
 */
export const calculateStarglitterCashbackRate = (
  wishes: number,
  weaponRate: number = 0.5,
  duplicateRate: number = 0.8,
  fiveStarWeaponRate: number = 0.5,
  fiveStarDuplicateRate: number = 0.2
): number => {
  if (wishes <= 0) return 0;

  const starglitterWishes = calculateExpectedStarglitter(
    wishes,
    weaponRate,
    duplicateRate,
    fiveStarWeaponRate,
    fiveStarDuplicateRate
  );
  return (starglitterWishes / wishes) * 100;
};

/**
 * Banner-specific rates and pity systems
 */
interface BannerRates {
  fourStarRate: number;
  fourStarPity: number;
  fiveStarRate: number;
  fiveStarPity: number;
  softPityStart: number;
  weaponRate: number; // Probability that 4-star is weapon
  fiveStarWeaponRate: number; // Probability that 5-star is weapon
}

const CHARACTER_BANNER: BannerRates = {
  fourStarRate: 0.051,
  fourStarPity: 10,
  fiveStarRate: 0.006,
  fiveStarPity: 90,
  softPityStart: 74,
  weaponRate: 0.5, // 50% weapons, 50% characters
  fiveStarWeaponRate: 0.0, // No 5-star weapons on character banner
};

const WEAPON_BANNER: BannerRates = {
  fourStarRate: 0.051,
  fourStarPity: 10,
  fiveStarRate: 0.007, // Slightly higher base rate
  fiveStarPity: 80, // Lower pity than character banner
  softPityStart: 63,
  weaponRate: 0.75, // 75% weapons, 25% characters
  fiveStarWeaponRate: 1.0, // All 5-stars are weapons
};

const STANDARD_BANNER: BannerRates = {
  fourStarRate: 0.051,
  fourStarPity: 10,
  fiveStarRate: 0.006,
  fiveStarPity: 90,
  softPityStart: 74,
  weaponRate: 0.5, // 50/50 split
  fiveStarWeaponRate: 0.5, // 50/50 split for 5-stars
};

/**
 * Calculate expected 4-star and 5-star pulls for a specific banner
 */
const calculateExpectedPullsForBanner = (
  wishes: number,
  banner: BannerRates
) => {
  if (wishes <= 0) return { fourStars: 0, fiveStars: 0 };

  // 4-star calculation
  const guaranteed4Stars = Math.floor(wishes / banner.fourStarPity);
  const remaining4Star = wishes % banner.fourStarPity;
  let expected4StarsFromRemaining = 0;

  for (let i = 1; i <= remaining4Star; i++) {
    const rate = i <= 8 ? banner.fourStarRate : 1.0;
    expected4StarsFromRemaining += rate;
  }

  const total4Stars =
    guaranteed4Stars + Math.min(expected4StarsFromRemaining, remaining4Star);

  // 5-star calculation with soft pity
  let expected5Stars = 0;
  let currentPity = 0;

  for (let i = 0; i < wishes; i++) {
    currentPity++;
    let rate = banner.fiveStarRate;

    // Soft pity increases rate dramatically
    if (currentPity >= banner.softPityStart) {
      const softPityIncrease = (currentPity - banner.softPityStart + 1) * 0.06;
      rate = Math.min(rate + softPityIncrease, 1.0);
    }

    // Hard pity guarantees 5-star
    if (currentPity >= banner.fiveStarPity) {
      rate = 1.0;
    }

    expected5Stars += rate;

    // Reset pity if we got a 5-star (probabilistically)
    if (rate >= Math.random() || currentPity >= banner.fiveStarPity) {
      currentPity = 0;
    }
  }

  return { fourStars: total4Stars, fiveStars: expected5Stars };
};

/**
 * Calculate starglitter from banner-specific pulls
 */
export const calculateStarglitterFromBanner = (
  wishes: number,
  banner: BannerRates,
  characterDuplicateRate: number = 0.8
): number => {
  if (wishes <= 0) return 0;

  const { fourStars, fiveStars } = calculateExpectedPullsForBanner(
    wishes,
    banner
  );

  // 4-star starglitter
  const fourStarWeapons = fourStars * banner.weaponRate;
  const fourStarCharacters = fourStars * (1 - banner.weaponRate);
  const fourStarCharacterDuplicates =
    fourStarCharacters * characterDuplicateRate;
  const fourStarStarglitter =
    (fourStarWeapons + fourStarCharacterDuplicates) * 2;

  // 5-star starglitter
  const fiveStarWeapons = fiveStars * banner.fiveStarWeaponRate;
  const fiveStarCharacters = fiveStars * (1 - banner.fiveStarWeaponRate);
  const fiveStarCharacterDuplicates =
    fiveStarCharacters * (characterDuplicateRate * 0.25); // Lower duplicate rate for 5-star chars
  const fiveStarStarglitter =
    (fiveStarWeapons + fiveStarCharacterDuplicates) * 10;

  const totalStarglitter = fourStarStarglitter + fiveStarStarglitter;
  return Math.floor(totalStarglitter / 5);
};

/**
 * Calculate total starglitter and maximum spendable wishes across multiple banners
 * @param characterWishes Wishes spent on character banner
 * @param weaponWishes Wishes spent on weapon banner
 * @param standardWishes Wishes spent on standard banner (optional)
 * @param characterDuplicateRate Probability of getting character duplicates
 */
export const calculateMultiBannerStarglitter = (
  characterWishes: number,
  weaponWishes: number,
  standardWishes: number = 0,
  characterDuplicateRate: number = 0.8
): {
  totalStarglitterWishes: number;
  characterBannerStarglitter: number;
  weaponBannerStarglitter: number;
  standardBannerStarglitter: number;
  breakdown: {
    totalWishesSpent: number;
    totalStarglitterEarned: number;
    effectiveCashbackRate: number;
  };
} => {
  const charStarglitter = calculateStarglitterFromBanner(
    characterWishes,
    CHARACTER_BANNER,
    characterDuplicateRate
  );

  const weaponStarglitter = calculateStarglitterFromBanner(
    weaponWishes,
    WEAPON_BANNER,
    characterDuplicateRate
  );

  const standardStarglitter = calculateStarglitterFromBanner(
    standardWishes,
    STANDARD_BANNER,
    characterDuplicateRate
  );

  const totalStarglitterWishes =
    charStarglitter + weaponStarglitter + standardStarglitter;
  const totalWishesSpent = characterWishes + weaponWishes + standardWishes;
  const totalStarglitterEarned = totalStarglitterWishes * 5;
  const effectiveCashbackRate =
    totalWishesSpent > 0
      ? (totalStarglitterWishes / totalWishesSpent) * 100
      : 0;

  return {
    totalStarglitterWishes,
    characterBannerStarglitter: charStarglitter,
    weaponBannerStarglitter: weaponStarglitter,
    standardBannerStarglitter: standardStarglitter,
    breakdown: {
      totalWishesSpent,
      totalStarglitterEarned,
      effectiveCashbackRate,
    },
  };
};

/**
 * Calculate maximum spendable wishes when split across banners using ratios
 * This uses iterative convergence to find the optimal distribution
 * @param availableWishes Total wishes available to spend
 * @param characterRatio Percentage of wishes to spend on character banner (0-1)
 * @param weaponRatio Percentage of wishes to spend on weapon banner (0-1)
 * @param standardRatio Percentage of wishes to spend on standard banner (0-1, should sum to 1 with others)
 * @param characterDuplicateRate Probability of getting character duplicates
 */
export const calculateMaxSpendableWishesMultiBannerByRatio = (
  availableWishes: number,
  characterRatio: number = 0.5,
  weaponRatio: number = 0.5,
  standardRatio: number = 0,
  characterDuplicateRate: number = 0.8
): {
  maxSpendableWishes: number;
  characterWishes: number;
  weaponWishes: number;
  standardWishes: number;
  starglitterWishesGained: number;
  finalCashbackRate: number;
} => {
  if (availableWishes <= 0) {
    return {
      maxSpendableWishes: 0,
      characterWishes: 0,
      weaponWishes: 0,
      standardWishes: 0,
      starglitterWishesGained: 0,
      finalCashbackRate: 0,
    };
  }

  // Normalize ratios to sum to 1
  const totalRatio = characterRatio + weaponRatio + standardRatio;
  const normCharRatio = characterRatio / totalRatio;
  const normWeaponRatio = weaponRatio / totalRatio;
  const normStandardRatio = standardRatio / totalRatio;

  let totalSpendable = availableWishes;
  let previousTotal = 0;
  let iteration = 0;
  const maxIterations = 50;
  const convergenceThreshold = 0.1;

  while (
    iteration < maxIterations &&
    Math.abs(totalSpendable - previousTotal) > convergenceThreshold
  ) {
    previousTotal = totalSpendable;

    const charWishes = Math.floor(totalSpendable * normCharRatio);
    const weaponWishes = Math.floor(totalSpendable * normWeaponRatio);
    const standardWishes = Math.floor(totalSpendable * normStandardRatio);

    const starglitterResult = calculateMultiBannerStarglitter(
      charWishes,
      weaponWishes,
      standardWishes,
      characterDuplicateRate
    );

    // Total spendable = available + starglitter gained
    totalSpendable = availableWishes + starglitterResult.totalStarglitterWishes;
    iteration++;
  }

  const finalCharWishes = Math.floor(totalSpendable * normCharRatio);
  const finalWeaponWishes = Math.floor(totalSpendable * normWeaponRatio);
  const finalStandardWishes = Math.floor(totalSpendable * normStandardRatio);

  const finalResult = calculateMultiBannerStarglitter(
    finalCharWishes,
    finalWeaponWishes,
    finalStandardWishes,
    characterDuplicateRate
  );

  return {
    maxSpendableWishes: Math.floor(totalSpendable),
    characterWishes: finalCharWishes,
    weaponWishes: finalWeaponWishes,
    standardWishes: finalStandardWishes,
    starglitterWishesGained: finalResult.totalStarglitterWishes,
    finalCashbackRate: finalResult.breakdown.effectiveCashbackRate,
  };
};

export const calculateMaxSpendableWishesMultiBanner = (
  plannedCharacterWishes: number,
  plannedWeaponWishes: number,
  startingWishes: number = 0,
  characterDuplicateRate: number = 0.8
): {
  maxSpendableWishes: number;
  actualCharacterWishes: number;
  actualWeaponWishes: number;
  starglitterWishesGained: number;
  finalCashbackRate: number;
  isAffordable: boolean;
  shortfall: number;
} => {
  const totalPlannedWishes = plannedCharacterWishes + plannedWeaponWishes;

  if (totalPlannedWishes <= 0) {
    return {
      maxSpendableWishes: 0,
      actualCharacterWishes: 0,
      actualWeaponWishes: 0,
      starglitterWishesGained: 0,
      finalCashbackRate: 0,
      isAffordable: true,
      shortfall: 0,
    };
  }

  // Calculate starglitter from planned spending
  const starglitterResult = calculateMultiBannerStarglitter(
    plannedCharacterWishes,
    plannedWeaponWishes,
    characterDuplicateRate
  );

  const totalEffectiveWishes =
    plannedCharacterWishes +
    plannedWeaponWishes +
    starglitterResult.totalStarglitterWishes;
  const isAffordable = totalEffectiveWishes >= totalPlannedWishes;
  const shortfall = Math.max(0, totalPlannedWishes - totalEffectiveWishes);

  // If affordable, return the planned amounts
  // If not affordable, scale down proportionally
  let actualCharWishes: number;
  let actualWeaponWishes: number;

  if (isAffordable) {
    actualCharWishes = plannedCharacterWishes;
    actualWeaponWishes = plannedWeaponWishes;
  } else {
    // Scale down proportionally to fit within available wishes (including starglitter)
    const scaleFactor = totalEffectiveWishes / totalPlannedWishes;
    actualCharWishes = Math.floor(plannedCharacterWishes * scaleFactor);
    actualWeaponWishes = Math.floor(plannedWeaponWishes * scaleFactor);
  }

  // Recalculate starglitter with actual spending amounts
  const finalStarglitterResult = calculateMultiBannerStarglitter(
    actualCharWishes,
    actualWeaponWishes,
    characterDuplicateRate
  );

  const maxSpendableWishes = actualCharWishes + actualWeaponWishes;

  return {
    maxSpendableWishes,
    actualCharacterWishes: actualCharWishes,
    actualWeaponWishes: actualWeaponWishes,
    starglitterWishesGained: finalStarglitterResult.totalStarglitterWishes,
    finalCashbackRate: finalStarglitterResult.breakdown.effectiveCashbackRate,
    isAffordable,
    shortfall,
  };
};
