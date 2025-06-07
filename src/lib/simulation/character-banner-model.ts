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
  guaranteed: boolean,
  consecutive5050Losses: number
): {
  result: "featured" | "standard" | "non-5-star";
  newPity: number;
  newGuaranteed: boolean;
  newConsecutive5050Losses: number;
} => {
  const newPity = pity + 1;
  const prob = getCharacter5StarProbability(newPity);

  if (Math.random() < prob) {
    // Got a 5-star, reset pity
    if (guaranteed) {
      // Guaranteed featured character
      return { 
        result: "featured", 
        newPity: 0, 
        newGuaranteed: false,
        newConsecutive5050Losses: 0 // Reset counter on guaranteed win
      };
    } else {
      // Check for Capturing Radiance (guaranteed win after 2 consecutive losses)
      if (consecutive5050Losses >= 2) {
        // Capturing Radiance guarantees the featured character
        return { 
          result: "featured", 
          newPity: 0, 
          newGuaranteed: false,
          newConsecutive5050Losses: 0 // Reset counter after guaranteed win
        };
      } else {
        // Normal 50/50 chance
        if (Math.random() < 0.5) {
          return { 
            result: "featured", 
            newPity: 0, 
            newGuaranteed: false,
            newConsecutive5050Losses: 0 // Reset counter on win
          };
        } else {
          return { 
            result: "standard", 
            newPity: 0, 
            newGuaranteed: true,
            newConsecutive5050Losses: consecutive5050Losses + 1 // Increment loss counter
          };
        }
      }
    }
  }

  return { 
    result: "non-5-star", 
    newPity, 
    newGuaranteed: guaranteed,
    newConsecutive5050Losses: consecutive5050Losses // No change to loss counter
  };
};

export const wishForCharacter = (
  character: CharacterId,
  maxWishes: number,
  maxConst: number,
  startingPity: number,
  startingGuaranteed: boolean,
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

  // Simulate pulls for this specific character
  while (charPulls < maxWishes && constellationCount <= maxConst) {
    charPulls++;

    const wishResult = characterWish(pity, guaranteed, consecutive5050Losses);
    pity = wishResult.newPity;
    guaranteed = wishResult.newGuaranteed;
    consecutive5050Losses = wishResult.newConsecutive5050Losses;

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
    consecutive5050Losses,
  };
};
