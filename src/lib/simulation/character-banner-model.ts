import { CharacterId, WishForCharacterResult } from "../types";

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
 * Simulate a single character wish
 * @returns "featured" if the featured 5-star was pulled, "standard" if a standard 5-star, or "non-5-star" otherwise
 */
export const characterWish = (
  pity: number,
  guaranteed: boolean
): {
  result: "featured" | "standard" | "non-5-star";
  newPity: number;
  newGuaranteed: boolean;
} => {
  const newPity = pity + 1;
  const prob = getCharacter5StarProbability(newPity);

  if (Math.random() < prob) {
    // Got a 5-star, reset pity
    if (guaranteed) {
      // Guaranteed featured character
      return { result: "featured", newPity: 0, newGuaranteed: false };
    } else {
      // 50/50 chance (55% with capturing radiance, but we'll use 50% for now)
      if (Math.random() < 0.5) {
        return { result: "featured", newPity: 0, newGuaranteed: false };
      } else {
        return { result: "standard", newPity: 0, newGuaranteed: true };
      }
    }
  }

  return { result: "non-5-star", newPity, newGuaranteed: guaranteed };
};

export const wishForCharacter = (
  character: CharacterId,
  maxWishes: number,
  maxConst: number,
  startingPity: number,
  startingGuaranteed: boolean
): WishForCharacterResult => {
  let charPulls = 0;
  let obtained = false;
  let lostFiftyFifty = false;
  let constellationCount = 0;
  let gotStandard5Star = false;
  let gotFeatured5Star = false;
  let pity = startingPity;
  let guaranteed = startingGuaranteed;

  // Simulate pulls for this specific character
  while (charPulls < maxWishes && constellationCount <= maxConst) {
    charPulls++;

    const wishResult = characterWish(pity, guaranteed);
    pity = wishResult.newPity;
    guaranteed = wishResult.newGuaranteed;

    if (wishResult.result === "featured") {
      // Successfully got the featured character
      obtained = true;
      gotFeatured5Star = true;
      constellationCount++;

      // If we've reached the desired constellation, break
      if (constellationCount > maxConst) {
        break;
      }
    } else if (wishResult.result === "standard") {
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
  };
};
