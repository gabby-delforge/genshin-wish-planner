import {
  BannerConfiguration,
  BannerId,
  BannerOutcome,
  CharacterOutcome,
  CharacterSuccessRate,
  SimulationResult,
  SimulationResults,
  WeaponBannerConfig,
  WeaponBannerSimulationResult,
  WeaponId,
  WeaponOutcome,
  WeaponSuccessRate,
  WishForWeaponResult,
} from "../types";
import {
  getCharacter5StarProbability,
  getWeapon5StarProbability,
} from "./simulation-utils";

import {
  ApiBanner,
  BannerSimulationResult,
  CharacterId,
  CharacterSimulationResult,
  WishForCharacterResult,
} from "../types";

/**
 * Simulate a single character wish
 * @returns "featured" if the featured 5-star was pulled, "standard" if a standard 5-star, or "non-5-star" otherwise
 */
const characterWish = (
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

const wishForCharacter = (
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

// Updated weaponWish function to work with your existing structure
const weaponWish = (
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

// New function to simulate weapon banner with your sentence-based approach
const wishForWeapon = (
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

    // If we got a 5-star weapon, add it to obtained list
    if (wishResult.weaponObtained) {
      obtainedWeapons.push(wishResult.weaponObtained);
    }

    // Check if we should stop or switch strategy
    const gotPrimaryWeapon = obtainedWeapons.includes(config.epitomizedPath);
    const gotSecondaryWeapon = obtainedWeapons.includes(otherFeaturedWeapon);

    if (config.strategy === "stop" && gotPrimaryWeapon) {
      // Stop strategy: we got our target weapon, we're done
      break;
    }

    if (config.strategy === "continue" && gotPrimaryWeapon && !pathSwitched) {
      // Continue strategy: got primary weapon, now switch to secondary
      currentTarget = otherFeaturedWeapon;
      fatePoints = 0; // Reset fate points when switching path
      pathSwitched = true;
    }

    if (
      config.strategy === "continue" &&
      gotPrimaryWeapon &&
      gotSecondaryWeapon
    ) {
      // Continue strategy: got both weapons, we're done
      break;
    }
  }

  return {
    obtainedWeapons,
    primaryWeaponObtained: obtainedWeapons.includes(config.epitomizedPath),
    secondaryWeaponObtained: obtainedWeapons.includes(otherFeaturedWeapon),
    wishesUsed,
    pathSwitched,
    endPity: pity,
    endGuaranteed: guaranteed,
  };
};

// Updated wishForBanner function to handle the new weapon banner approach
const wishForBanner = (
  banner: ApiBanner,
  bannerConfiguration: Record<string, BannerConfiguration>,
  currentPity: number,
  isGuaranteed: boolean,
  currentWeaponPity: number = 0,
  isWeaponGuaranteed: boolean = false,
  _weaponFatePoints: number = 0
): BannerSimulationResult | undefined => {
  const bannerVersion = banner.version;
  const versionAllocation = bannerConfiguration[bannerVersion] || {};

  // Get characters with allocated wishes (existing logic)
  const charactersWithWishes: string[] = banner.characters.filter(
    (charId: string) =>
      versionAllocation.characters[charId] &&
      versionAllocation.characters[charId]!.wishesAllocated > 0
  );

  // Check if weapon banner has wishes allocated
  const hasWeaponWishes =
    versionAllocation.weaponBanner &&
    versionAllocation.weaponBanner.wishesAllocated > 0;

  // Skip banner if no wishes allocated
  if (charactersWithWishes.length === 0 && !hasWeaponWishes) {
    return;
  }

  // CHARACTERS (your existing logic)
  const characterResults: CharacterSimulationResult[] = [];
  let charPity = currentPity;
  let charGuaranteed = isGuaranteed;

  for (const targetCharId of charactersWithWishes) {
    const wishesToSpend =
      versionAllocation.characters[targetCharId]!.wishesAllocated || 0;
    const maxConst =
      versionAllocation.characters[targetCharId]!.maxConstellation || 0;

    const charResult = wishForCharacter(
      targetCharId,
      wishesToSpend,
      maxConst,
      charPity,
      charGuaranteed
    );

    characterResults.push({
      character: targetCharId,
      obtained: charResult.obtained,
      hasWishesAllocated: true,
      lostFiftyFifty: charResult.lostFiftyFifty,
      wishesUsed: charResult.wishesUsed,
      constellation: charResult.constellation,
    });

    charPity = charResult.pity;
    charGuaranteed = charResult.guaranteed;
  }

  // WEAPONS (new approach using sentence-based strategy)
  let weaponBannerResult: WeaponBannerSimulationResult | undefined;

  if (hasWeaponWishes) {
    weaponBannerResult = wishForWeapon(
      versionAllocation.weaponBanner!,
      banner.weapons as [WeaponId, WeaponId], // Assuming exactly 2 featured weapons
      currentWeaponPity,
      isWeaponGuaranteed
    );
  }

  // Convert weapon banner result to individual weapon results for compatibility
  const weaponResults: WishForWeaponResult[] = [];
  if (weaponBannerResult) {
    // Create results for each featured weapon
    banner.weapons.forEach((weaponId: WeaponId) => {
      weaponResults.push({
        weapon: weaponId,
        obtained: weaponBannerResult!.obtainedWeapons.includes(weaponId),
        hasWishesAllocated:
          weaponId === versionAllocation.weaponBanner!.epitomizedPath,
        lostSeventyFive:
          weaponId === versionAllocation.weaponBanner!.epitomizedPath
            ? !weaponBannerResult!.primaryWeaponObtained
            : false,
        wishesUsed:
          weaponId === versionAllocation.weaponBanner!.epitomizedPath
            ? weaponBannerResult!.wishesUsed
            : 0,
      });
    });
  }

  const totalCharWishes = characterResults.reduce(
    (sum, r) => sum + r.wishesUsed,
    0
  );
  const totalWeaponWishes = weaponBannerResult?.wishesUsed || 0;

  return {
    bannerId: bannerVersion,
    characterResults,
    weaponResults,
    wishesUsed: totalCharWishes + totalWeaponWishes,
    endPity: charPity,
    endGuaranteed: charGuaranteed,
    endWeaponPity: weaponBannerResult?.endPity || currentWeaponPity,
    endWeaponGuaranteed:
      weaponBannerResult?.endGuaranteed || isWeaponGuaranteed,
    endWeaponFatePoints: 0, // Always reset to 0 at banner end
  };
};

// Updated runSimulationOnce to pass weapon parameters
const runSimulationOnce = (
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  pity: number,
  guaranteed: boolean,
  weaponPity: number = 0,
  weaponGuaranteed: boolean = false
) => {
  const simulationResults: SimulationResult = banners.reduce((acc, banner) => {
    acc[banner.version] = {
      bannerId: banner.version,
      characterResults: [],
      weaponResults: [],
      wishesUsed: 0,
      endPity: 0,
      endGuaranteed: false,
      endWeaponPity: 0,
      endWeaponGuaranteed: false,
      endWeaponFatePoints: 0,
    };
    return acc;
  }, {} as SimulationResult);

  let currentPity = pity;
  let currentGuaranteed = guaranteed;
  let currentWeaponPity = weaponPity;
  let currentWeaponGuaranteed = weaponGuaranteed;

  for (const banner of banners) {
    const bannerResult = wishForBanner(
      banner,
      bannerConfiguration,
      currentPity,
      currentGuaranteed,
      currentWeaponPity,
      currentWeaponGuaranteed,
      0 // Fate points always start at 0 for each banner
    );

    if (bannerResult) {
      simulationResults[banner.version] = bannerResult;

      // Update state for next banner
      currentPity = bannerResult.endPity;
      currentGuaranteed = bannerResult.endGuaranteed;
      currentWeaponPity = bannerResult.endWeaponPity;
      currentWeaponGuaranteed = bannerResult.endWeaponGuaranteed;
      // Weapon fate points always reset between banners
    }
  }

  return simulationResults;
};

// Update runSimulationBatch to include weapon parameters
export const runSimulationBatch = (
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  pity: number,
  guaranteed: boolean,
  batchSize: number,
  weaponPity: number = 0,
  weaponGuaranteed: boolean = false
) => {
  const batchResults: SimulationResult[] = [];
  for (let i = 0; i < batchSize; i++) {
    const results = runSimulationOnce(
      banners,
      bannerConfiguration,
      pity,
      guaranteed,
      weaponPity,
      weaponGuaranteed
    );
    batchResults.push(results);
  }

  return batchResults;
};

type ScenarioString = string;

const scenarioToScenarioString = (
  scenario: SimulationResult
): ScenarioString => {
  const banners = Object.values(scenario);
  let s = "";
  for (const b of banners) {
    s += `[${b.bannerId}]`;
    for (const r of Object.values(b.characterResults)) {
      if (r.wishesUsed > 0) {
        s += r.character;
        if (r.obtained) {
          s += `Y:C${r.constellation}`;
        } else {
          s += "N";
        }
      } else {
        s += "Skipped";
      }
    }
  }
  return s;
};

// New function to convert SimulationResult to BannerOutcome
const simulationResultToBannerOutcomes = (
  simulationResult: SimulationResult
): BannerOutcome[] => {
  return Object.values(simulationResult).map((bannerResult) => {
    const characterOutcomes: CharacterOutcome[] =
      bannerResult.characterResults.map((charResult) => ({
        characterId: charResult.character,
        obtained: charResult.obtained,
        constellation: charResult.constellation,
        wishesUsed: charResult.wishesUsed,
      }));

    const weaponOutcomes: WeaponOutcome[] = bannerResult.weaponResults.map(
      (weaponResult) => ({
        weaponId: weaponResult.weapon,
        obtained: weaponResult.obtained,
        wishesUsed: weaponResult.wishesUsed,
      })
    );

    return {
      bannerId: bannerResult.bannerId,
      characterOutcomes,
      weaponOutcomes,
      totalWishesUsed: bannerResult.wishesUsed,
    };
  });
};

// New function to generate scenario ID from banner outcomes
const generateScenarioId = (bannerOutcomes: BannerOutcome[]): string => {
  return bannerOutcomes
    .map((banner) => {
      const charResults = banner.characterOutcomes
        .map((char) => {
          if (char.wishesUsed === 0) return "Skip";
          return char.obtained
            ? `${char.characterId}:C${char.constellation}`
            : "Miss";
        })
        .join(",");

      const weaponResults = banner.weaponOutcomes
        .map((weapon) => {
          if (weapon.wishesUsed === 0) return "Skip";
          return weapon.obtained ? `${weapon.weaponId}:Y` : "Miss";
        })
        .join(",");

      const allResults = [charResults, weaponResults]
        .filter((r) => r)
        .join("|");
      return `[${banner.bannerId}]${allResults}`;
    })
    .join("");
};

export const finalizeResults = (
  allSimulationResults: SimulationResult[]
): SimulationResults => {
  const bannerResults: Record<BannerId, BannerSimulationResult[]> = {};
  const characterSuccessTotals: Record<
    `${CharacterId}${BannerId}C${number}`,
    number
  > = {};
  const weaponSuccessTotals: Record<`${WeaponId}${BannerId}`, number> = {};
  const weaponAttemptTotals: Record<`${WeaponId}${BannerId}`, number> = {};

  const numSimulations = allSimulationResults.length;
  const scenarios: Record<
    ScenarioString,
    { count: number; simulationResult: SimulationResult }
  > = {};

  // New scenario tracking
  const newScenarios: Record<
    string,
    { count: number; bannerOutcomes: BannerOutcome[] }
  > = {};

  for (let i = 0; i < numSimulations; i++) {
    const simulationResult = allSimulationResults[i];

    // Convert to new banner outcomes structure
    const bannerOutcomes = simulationResultToBannerOutcomes(simulationResult);
    const scenarioId = generateScenarioId(bannerOutcomes);

    if (!(scenarioId in newScenarios)) {
      newScenarios[scenarioId] = { count: 0, bannerOutcomes };
    }
    newScenarios[scenarioId].count += 1;

    // Existing logic for backwards compatibility
    for (const bannerId in simulationResult) {
      // Add to banner results
      const bannerVersion = bannerId;
      const bannerResult = simulationResult[bannerVersion];
      if (!bannerResults[bannerVersion]) {
        bannerResults[bannerVersion] = [];
      }
      bannerResults[bannerVersion].push(bannerResult);

      // Add to character success totals
      for (const c of bannerResult.characterResults) {
        const characterId = c.character;
        const characterResult = bannerResult.characterResults.find(
          (c) => c.character === characterId
        );
        if (characterResult && characterResult.obtained) {
          const constellation = characterResult.constellation;
          for (let i = 0; i <= constellation; i++) {
            const code: `${CharacterId}${BannerId}C${number}` = `${characterId}${bannerVersion}C${i}`;
            if (!(code in characterSuccessTotals)) {
              characterSuccessTotals[code] = 0;
            }
            characterSuccessTotals[code] += 1;
          }
        }
      }

      // Add to weapon success totals (only for weapons with wishes allocated)
      for (const w of bannerResult.weaponResults) {
        const weaponId = w.weapon;
        const weaponResult = bannerResult.weaponResults.find(
          (w) => w.weapon === weaponId
        );
        // Only track weapons that had wishes allocated to them
        if (weaponResult && weaponResult.hasWishesAllocated) {
          const code: `${WeaponId}${BannerId}` = `${weaponId}${bannerVersion}`;

          // Track attempts
          if (!(code in weaponAttemptTotals)) {
            weaponAttemptTotals[code] = 0;
          }
          weaponAttemptTotals[code] += 1;

          // Track successes
          if (!(code in weaponSuccessTotals)) {
            weaponSuccessTotals[code] = 0;
          }
          if (weaponResult.obtained) {
            weaponSuccessTotals[code] += 1;
          }
        }
      }
    }

    const scenarioString = scenarioToScenarioString(simulationResult);
    if (!(scenarioString in scenarios)) {
      scenarios[scenarioString] = { count: 0, simulationResult };
    }
    scenarios[scenarioString].count += 1;
  }

  // Calculate success rates (divide each number by the number of simulations)
  const characterSuccessRates: CharacterSuccessRate[] = [];
  for (const code of Object.keys(characterSuccessTotals)) {
    const regexLiteral: RegExp = /(\w*)(\d\.\dv\d)(C\d)/;
    const result: string[] | null = regexLiteral.exec(code);
    if (result) {
      characterSuccessRates.push({
        versionId: result[2],
        characterId: result[1],
        constellation: parseInt(result[3].slice(1)),
        successPercent:
          characterSuccessTotals[
            code as `${CharacterId}${BannerId}C${number}`
          ] / numSimulations,
      });
    } else {
      console.warn("No match found for ", code);
    }
  }

  // Calculate weapon success rates
  const weaponSuccessRates: WeaponSuccessRate[] = [];
  for (const code of Object.keys(weaponAttemptTotals)) {
    // Match weapon ID (everything before the version pattern) and version pattern
    const regexLiteral: RegExp = /^(.+?)(\d\.\dv\d)$/;
    const result: string[] | null = regexLiteral.exec(code);
    if (result) {
      const successCount =
        weaponSuccessTotals[code as `${WeaponId}${BannerId}`] || 0;
      const attemptCount =
        weaponAttemptTotals[code as `${WeaponId}${BannerId}`];
      weaponSuccessRates.push({
        versionId: result[2],
        weaponId: result[1],
        refinement: 0, // TODO: This is hard-coded
        successPercent: successCount / attemptCount,
      });
    } else {
      console.warn("No match found for weapon code ", code);
    }
  }

  // Sort old scenarios by count and return top 10 (backwards compatibility)
  const sortedScenarios = Object.values(scenarios)
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      bannerResults: s.simulationResult,
      count: s.count,
      percentage: s.count / numSimulations,
    }));

  // Sort new scenarios by count and return top 10
  const sortedNewScenarios = Object.entries(newScenarios)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([id, data]) => ({
      id,
      bannerOutcomes: data.bannerOutcomes,
      probability: data.count / numSimulations,
      count: data.count,
    }));

  return {
    // bannerResults, TODO: This is commented out because it contains info about EVERY single run, so we can't save it to local storage.
    bannerResults: {},
    characterSuccessRates,
    weaponSuccessRates,
    topScenarios: sortedScenarios.slice(0, 10),
    scenarios: {
      scenarios: sortedNewScenarios,
      totalSimulations: numSimulations,
    },
  };
};

export const runSimulation = async (
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  pity: number,
  guaranteed: boolean,
  simulations: number,
  setSimulationProgress?: (progress: number) => void
): Promise<SimulationResults> => {
  // Run simulation with progress updates
  const totalSimulations = simulations;
  const batchSize = Math.min(1000, Math.floor(totalSimulations / 10));
  let completedSimulations = 0;

  // Return a promise that resolves when the simulation is complete
  const allSimulationResults: SimulationResult[] = [];

  return new Promise<SimulationResults>((resolve) => {
    // Run the simulation in batches
    for (let i = 0; i < totalSimulations; i += batchSize) {
      const batchResults = runSimulationBatch(
        banners,
        bannerConfiguration,
        pity,
        guaranteed,
        batchSize
      );
      allSimulationResults.push(...batchResults);

      completedSimulations += batchSize;
      if (setSimulationProgress) {
        setSimulationProgress(completedSimulations / totalSimulations);
      }
    }

    resolve(finalizeResults(allSimulationResults));
  });
};
