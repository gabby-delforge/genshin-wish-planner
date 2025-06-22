import { CharacterId, WishForCharacterResult } from "../types";

/**
 * 4-star drop distribution constants for character banner
 * When a 4-star item is obtained on character banner:
 * - 28.33% chance of getting a weapon
 * - 71.67% chance of getting a character
 * Source: https://antifandom.com/genshin-impact/wiki/Wish/Expanded_Wish_Probabilities#Non-Featured_Drop_Probability
 */
export const CHARACTER_BANNER_4STAR_SPLITS = {
  WEAPON_CHANCE: 0.2833,
  CHARACTER_CHANCE: 0.7167,
} as const;

export type PullResult = {
  result:
    | "5-star-featured"
    | "5-star-standard"
    | "4-star-featured"
    | "4-star-standard"
    | "3-star";
  newPity: number;
  new4StarPity: number;
  newGuaranteed: boolean;
  new4StarGuaranteed: boolean;
  newConsecutive5050Losses: number;
};

/**
 * Calculate the probability of getting a 5-star based on current pity
 * Implements Genshin Impact's soft and hard pity system
 */
export const getCharacter5StarProbability = (pity: number): number => {
  if (pity < 73) {
    return 0.006; // Base rate
  } else if (pity < 89) {
    // Soft pity - increases with each pull
    return 0.006 + (pity - 72) * 0.06;
  } else {
    return 1.0; // Hard pity (90th pull)
  }
};

/**
 * 4★ drop guarantee: If a player does not obtain any 4★ (or above) item within 9 wishes in a row, the 10th wish is guaranteed to be a 4★ (or higher) item.
 * (On guarantee, the probability of getting a 4★ item is 99.4%, and the probability of getting a 5★ item is 0.6%.)
 * This counter will reset if the player obtains any 4★ item.
 *
 * Featured 4★ character guarantee: Every time a player obtains a 4★ item, there is a 50% chance it will be one of the featured 4★ characters.
 * If the 4★ item obtained is not one of the featured characters, then the next 4★ item obtained is guaranteed to be one of the featured characters.
 * Thus it requires a maximum of 20 wishes to obtain one of the featured 4★ characters.
 */
export const getCharacter4StarProbability = (pity: number): number => {
  if (pity < 10) {
    return 0.051; // Base rate for 4-star (5.1%)
  } else {
    return 1.0; // Hard pity (10th pull)
  }
};

export const pull5StarCharacter = (
  guaranteed: boolean,
  consecutive5050Losses: number
): Partial<PullResult> => {
  if (guaranteed) {
    // Guaranteed featured character
    return {
      result: "5-star-featured",
      newPity: 0,
      newGuaranteed: false,
      newConsecutive5050Losses: 0, // Reset counter on guaranteed win
    };
  } else {
    // Check for Capturing Radiance (guaranteed win after 2 consecutive losses)
    if (consecutive5050Losses >= 2) {
      // Capturing Radiance guarantees the featured character
      return {
        result: "5-star-featured",
        newPity: 0,
        newGuaranteed: false,
        newConsecutive5050Losses: 0, // Reset counter after guaranteed win
      };
    } else {
      // Normal 50/50 chance
      if (Math.random() < 0.5) {
        return {
          result: "5-star-featured",
          newPity: 0,
          newGuaranteed: false,
          newConsecutive5050Losses: 0, // Reset counter on win
        };
      } else {
        return {
          result: "5-star-standard",
          newPity: 0,
          newGuaranteed: true,
          newConsecutive5050Losses: consecutive5050Losses + 1, // Increment loss counter
        };
      }
    }
  }
};

export const pull4StarCharacter = (
  fourStarGuaranteed: boolean
): Partial<PullResult> => {
  if (fourStarGuaranteed) {
    // Guaranteed featured 4-star character
    return {
      result: "4-star-featured",
      new4StarPity: 0,
      new4StarGuaranteed: false,
    };
  } else {
    // 50% chance for featured 4-star character
    if (Math.random() < 0.5) {
      return {
        result: "4-star-featured",
        new4StarPity: 0,
        new4StarGuaranteed: false,
      };
    } else {
      // Non-featured 4-star, next 4-star will be guaranteed featured
      return {
        result: "4-star-standard",
        new4StarPity: 0,
        new4StarGuaranteed: true,
      };
    }
  }
};

/**
 * Simulate a single character wish
 * @returns "5-star-featured" if the featured 5-star was pulled, "standard" if a standard 5-star, or "non-5-star" otherwise
 */
export const characterWish = (
  pity: number,
  fourStarPity: number,
  guaranteed: boolean,
  fourStarGuaranteed: boolean,
  consecutive5050Losses: number
): PullResult => {
  const newPity = pity + 1;
  const new4StarPity = fourStarPity + 1;

  const pullResult: PullResult = {
    result: "3-star",
    newPity,
    new4StarPity: new4StarPity,
    newGuaranteed: guaranteed,
    new4StarGuaranteed: fourStarGuaranteed,
    newConsecutive5050Losses: consecutive5050Losses,
  };

  const fiveStarProb = getCharacter5StarProbability(newPity);
  if (Math.random() < fiveStarProb) {
    return {
      ...pullResult,
      ...pull5StarCharacter(guaranteed, consecutive5050Losses),
    };
  }

  const fourStarProb = getCharacter4StarProbability(new4StarPity);
  if (Math.random() < fourStarProb) {
    return { ...pullResult, ...pull4StarCharacter(fourStarGuaranteed) };
  }

  return pullResult;
};

export const wishForCharacter = (
  character: CharacterId,
  maxWishes: number,
  maxConst: number,
  startingPity: number,
  starting4StarPity: number,
  startingGuaranteed: boolean,
  starting4StarGuaranteed: boolean,
  startingConsecutive5050Losses: number
): WishForCharacterResult => {
  let charPulls = 0;
  let obtained = false;
  let lostFiftyFifty = false;
  let constellationCount = 0;
  let gotStandard5Star = false;
  let gotFeatured5Star = false;
  let pity = startingPity;
  let guaranteed = startingGuaranteed;
  let consecutive5050Losses = startingConsecutive5050Losses;
  const fourStarPity = starting4StarPity;
  const fourStarGuaranteed = starting4StarGuaranteed;

  // Simulate pulls for this specific character
  while (charPulls < maxWishes && constellationCount <= maxConst) {
    charPulls++;

    const wishResult = characterWish(
      pity,
      fourStarPity,
      guaranteed,
      fourStarGuaranteed,
      consecutive5050Losses
    );
    pity = wishResult.newPity;
    guaranteed = wishResult.newGuaranteed;
    consecutive5050Losses = wishResult.newConsecutive5050Losses;

    if (wishResult.result === "5-star-featured") {
      // Successfully got the featured character
      obtained = true;
      gotFeatured5Star = true;
      constellationCount++;

      // If we've reached the desired constellation, break
      if (constellationCount > maxConst) {
        break;
      }
    } else if (wishResult.result === "5-star-standard") {
      // Got a standard 5-star
      gotStandard5Star = true;
    }
  }

  // We only consider the 50/50 as "lost" if the player got a standard 5* character
  // but didn't get any copies of the featured character.
  lostFiftyFifty = gotStandard5Star && !gotFeatured5Star;

  return {
    character,
    obtained,
    lostFiftyFifty,
    wishesUsed: charPulls,
    pity,
    guaranteed,
    constellation: constellationCount > 0 ? constellationCount - 1 : 0,
    consecutive5050Losses,
  };
};
