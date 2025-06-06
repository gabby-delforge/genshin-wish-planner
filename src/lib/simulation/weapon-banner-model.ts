import {
  WeaponBannerConfig,
  WeaponBannerSimulationResult,
  WeaponId,
} from "../types";

export const getWeapon5StarProbability = (pity: number): number => {
  if (pity < 63) {
    return 0.007; // Base rate (0.7%)
  } else if (pity < 77) {
    // Soft pity - increases with each pull from 63 onwards
    return 0.007 + (pity - 62) * 0.07;
  } else {
    return 1.0; // Hard pity (77th pull)
  }
};

// Updated weaponWish function to work with your existing structure
export const weaponWish = (
  pity: number,
  guaranteed: boolean,
  fatePoints: number,
  targetWeapon: WeaponId,
  featuredWeapons: [WeaponId, WeaponId]
): {
  result: "desired" | "other" | "standard" | "non-5-star";
  weaponObtained?: WeaponId;
  newPity: number;
  newGuaranteed: boolean;
  newFatePoints: number;
} => {
  const newPity = pity + 1;
  const prob = getWeapon5StarProbability(newPity);

  if (Math.random() < prob) {
    // Got a 5-star weapon, reset pity

    // Epitomized path guarantee: if we have 1+ fate points, guaranteed target weapon
    if (fatePoints >= 1) {
      return {
        result: "desired",
        weaponObtained: targetWeapon,
        newPity: 0,
        newGuaranteed: false,
        newFatePoints: 0, // Reset after getting epitomized weapon
      };
    }

    if (guaranteed) {
      // Guaranteed featured weapon (50/50 between the two featured)
      const weaponObtained =
        Math.random() < 0.5 ? featuredWeapons[0] : featuredWeapons[1];
      const newFatePoints =
        weaponObtained === targetWeapon ? 0 : fatePoints + 1;

      return {
        result: weaponObtained === targetWeapon ? "desired" : "other",
        weaponObtained,
        newPity: 0,
        newGuaranteed: false,
        newFatePoints,
      };
    } else {
      // 75% featured, 25% standard
      if (Math.random() < 0.75) {
        // Got featured weapon (50/50 between the two)
        const weaponObtained =
          Math.random() < 0.5 ? featuredWeapons[0] : featuredWeapons[1];
        const newFatePoints =
          weaponObtained === targetWeapon ? 0 : fatePoints + 1;

        return {
          result: weaponObtained === targetWeapon ? "desired" : "other",
          weaponObtained,
          newPity: 0,
          newGuaranteed: false,
          newFatePoints,
        };
      } else {
        // Got standard weapon - you'd need to implement getRandomStandardWeapon()
        return {
          result: "standard",
          weaponObtained: "standard_weapon" as WeaponId, // Placeholder
          newPity: 0,
          newGuaranteed: true,
          newFatePoints: fatePoints + 1,
        };
      }
    }
  }

  // Didn't get 5-star
  return {
    result: "non-5-star",
    newPity,
    newGuaranteed: guaranteed,
    newFatePoints: fatePoints,
  };
};

export const wishForWeapon = (
  config: WeaponBannerConfig,
  featuredWeapons: [WeaponId, WeaponId],
  startingPity: number,
  startingGuaranteed: boolean
): WeaponBannerSimulationResult => {
  let pity = startingPity;
  let guaranteed = startingGuaranteed;
  let fatePoints = 0; // Always starts at 0 for new banner
  let wishesUsed = 0;
  let pathSwitched = false;

  const obtainedWeapons: WeaponId[] = [];
  let currentTarget = config.epitomizedPath;

  // Track refinement levels for each weapon (0 = R1, 4 = R5)
  const weaponRefinements: Record<WeaponId, number> = {};
  featuredWeapons.forEach((weapon) => {
    weaponRefinements[weapon] = -1; // -1 means not obtained yet
  });

  const otherFeaturedWeapon = featuredWeapons.find(
    (w) => w !== config.epitomizedPath
  )!;

  while (wishesUsed < config.wishesAllocated) {
    wishesUsed++;

    const wishResult = weaponWish(
      pity,
      guaranteed,
      fatePoints,
      currentTarget,
      featuredWeapons
    );
    pity = wishResult.newPity;
    guaranteed = wishResult.newGuaranteed;
    fatePoints = wishResult.newFatePoints;

    // If we got a 5-star weapon, add it to obtained list and update refinement
    if (
      wishResult.weaponObtained &&
      wishResult.weaponObtained !== "standard_weapon"
    ) {
      const weaponId = wishResult.weaponObtained;
      obtainedWeapons.push(weaponId);

      // Update refinement level
      if (weaponRefinements[weaponId] === -1) {
        weaponRefinements[weaponId] = 0; // First copy = R1
      } else {
        weaponRefinements[weaponId] = Math.min(
          4,
          weaponRefinements[weaponId] + 1
        ); // Max R5
      }
    }

    // Check refinement-based stopping conditions
    const primaryWeaponRefinement = weaponRefinements[config.epitomizedPath];
    const secondaryWeaponRefinement = weaponRefinements[otherFeaturedWeapon];

    // Check if we've reached max refinement for our target weapon
    if (
      primaryWeaponRefinement >= config.maxRefinement &&
      config.strategy === "stop"
    ) {
      break;
    }

    // Handle strategy switching and stopping
    if (config.strategy === "continue") {
      // If we haven't switched paths yet and got primary weapon to desired refinement
      if (!pathSwitched && primaryWeaponRefinement >= config.maxRefinement) {
        currentTarget = otherFeaturedWeapon;
        fatePoints = 0; // Reset fate points when switching path
        pathSwitched = true;
      }

      // If we've gotten both weapons to desired refinement, stop
      if (
        primaryWeaponRefinement >= config.maxRefinement &&
        secondaryWeaponRefinement >= config.maxRefinement
      ) {
        break;
      }

      // If we switched paths and got secondary weapon to desired refinement, stop
      if (pathSwitched && secondaryWeaponRefinement >= config.maxRefinement) {
        break;
      }
    }
  }

  return {
    obtainedWeapons,
    primaryWeaponObtained: weaponRefinements[config.epitomizedPath] >= 0,
    secondaryWeaponObtained: weaponRefinements[otherFeaturedWeapon] >= 0,
    wishesUsed,
    pathSwitched,
    endPity: pity,
    endGuaranteed: guaranteed,
    // Add refinement info to the result
    primaryWeaponRefinement: Math.max(
      0,
      weaponRefinements[config.epitomizedPath]
    ),
    secondaryWeaponRefinement: Math.max(
      0,
      weaponRefinements[otherFeaturedWeapon]
    ),
  };
};
