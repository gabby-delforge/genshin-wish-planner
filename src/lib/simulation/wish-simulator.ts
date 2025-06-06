import {
  BannerConfiguration,
  BannerId,
  BannerOutcome,
  CharacterOutcome,
  CharacterSuccessRate,
  SimulationResult,
  SimulationResults,
  WeaponBannerSimulationResult,
  WeaponId,
  WeaponOutcome,
  WeaponSuccessRate,
  WishForWeaponResult,
} from "../types";

import {
  ApiBanner,
  BannerSimulationResult,
  CharacterId,
  CharacterSimulationResult,
} from "../types";
import { wishForCharacter } from "./character-banner-model";
import { wishForWeapon } from "./weapon-banner-model";

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
      const isPrimaryWeapon =
        weaponId === versionAllocation.weaponBanner!.epitomizedPath;
      const refinementLevel = isPrimaryWeapon
        ? weaponBannerResult!.primaryWeaponRefinement
        : weaponBannerResult!.secondaryWeaponRefinement;

      weaponResults.push({
        weapon: weaponId,
        obtained: weaponBannerResult!.obtainedWeapons.includes(weaponId),
        hasWishesAllocated: isPrimaryWeapon,
        lostSeventyFive: isPrimaryWeapon
          ? !weaponBannerResult!.primaryWeaponObtained
          : false,
        wishesUsed: isPrimaryWeapon ? weaponBannerResult!.wishesUsed : 0,
        // Add refinement level to the result
        refinementLevel: weaponBannerResult!.obtainedWeapons.includes(weaponId)
          ? refinementLevel
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

const runSimulationOnce = (
  banners: ApiBanner[],
  bannerConfiguration: Record<string, BannerConfiguration>,
  pity: number,
  guaranteed: boolean,
  weaponPity: number,
  weaponGuaranteed: boolean
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
  weaponPity: number,
  weaponGuaranteed: boolean
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
        refinementLevel: weaponResult.refinementLevel || 0,
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
          if (weapon.obtained) {
            const refinement =
              weapon.refinementLevel !== undefined ? weapon.refinementLevel : 0;
            return `${weapon.weaponId}:R${refinement + 1}`; // Display as R1-R5
          }
          return "Miss";
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
  const weaponSuccessTotals: Record<
    `${WeaponId}${BannerId}R${number}`,
    number
  > = {};
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

          // Track refinement success totals (similar to constellation tracking)
          if (
            weaponResult.obtained &&
            weaponResult.refinementLevel !== undefined
          ) {
            const refinementLevel = weaponResult.refinementLevel;
            // Track all refinement levels up to the achieved level (R1 to current refinement)
            for (let r = 0; r <= refinementLevel; r++) {
              const refinementCode: `${WeaponId}${BannerId}R${number}` = `${weaponId}${bannerVersion}R${r}`;
              if (!(refinementCode in weaponSuccessTotals)) {
                weaponSuccessTotals[refinementCode] = 0;
              }
              weaponSuccessTotals[refinementCode] += 1;
            }
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
    // Parse character codes like "character_name5.7v1C2"
    // First extract the constellation level from the end
    const constellationMatch = /C(\d+)$/.exec(code);
    if (!constellationMatch) {
      console.warn("No constellation level found in character code ", code);
      continue;
    }

    const constellation = parseInt(constellationMatch[1]);
    const codeWithoutConstellation = code.slice(
      0,
      -constellationMatch[0].length
    ); // Remove "C2" part

    // Now parse the remaining part to separate character ID and banner ID
    let characterId: string = "";
    let bannerId: string = "";

    // Try standard version pattern first (e.g., "5.7v1")
    const standardPattern = /^(.+?)(\d\.\dv\d)$/;
    let result = standardPattern.exec(codeWithoutConstellation);

    // If no match, try finding the last hyphen/dash as separator
    if (!result) {
      const dashPattern = /^(.+?)(-[^-]+)$/;
      result = dashPattern.exec(codeWithoutConstellation);
    }

    // If still no match, try more general approach
    if (!result) {
      const generalPattern = /^(.+?)([^a-zA-Z0-9_-].*)$/;
      result = generalPattern.exec(codeWithoutConstellation);
    }

    if (result && result.length >= 3) {
      characterId = result[1];
      bannerId = result[2];
    } else {
      console.warn(
        "Could not parse character and banner ID from code ",
        codeWithoutConstellation
      );
      continue;
    }

    const successCount =
      characterSuccessTotals[code as `${CharacterId}${BannerId}C${number}`];

    characterSuccessRates.push({
      versionId: bannerId,
      characterId: characterId,
      constellation: constellation,
      successPercent: successCount / numSimulations,
    });
  }

  // Calculate weapon success rates for refinements
  const weaponSuccessRates: WeaponSuccessRate[] = [];
  for (const code of Object.keys(weaponSuccessTotals)) {
    // Parse refinement codes like "azurelight5.7v1R2"
    // First extract the refinement level from the end
    const refinementMatch = /R(\d+)$/.exec(code);
    if (!refinementMatch) {
      console.warn("No refinement level found in weapon code ", code);
      continue;
    }

    const refinementLevel = parseInt(refinementMatch[1]);
    const codeWithoutRefinement = code.slice(0, -refinementMatch[0].length); // Remove "R2" part

    // Now parse the remaining part to separate weapon ID and banner ID
    let weaponId: string = "";
    let bannerId: string = "";

    // Try standard version pattern first (e.g., "5.7v1")
    const standardPattern = /^(.+?)(\d\.\dv\d)$/;
    let result = standardPattern.exec(codeWithoutRefinement);

    // If no match, try finding the last hyphen/dash as separator
    if (!result) {
      const dashPattern = /^(.+?)(-[^-]+)$/;
      result = dashPattern.exec(codeWithoutRefinement);
    }

    // If still no match, try more general approach
    if (!result) {
      const generalPattern = /^(.+?)([^a-zA-Z0-9_-].*)$/;
      result = generalPattern.exec(codeWithoutRefinement);
    }

    if (result && result.length >= 3) {
      weaponId = result[1];
      bannerId = result[2];
    } else {
      console.warn(
        "Could not parse weapon and banner ID from code ",
        codeWithoutRefinement
      );
      continue;
    }

    const attemptCount =
      weaponAttemptTotals[`${weaponId}${bannerId}` as `${WeaponId}${BannerId}`];
    const successCount =
      weaponSuccessTotals[code as `${WeaponId}${BannerId}R${number}`];

    if (attemptCount > 0) {
      weaponSuccessRates.push({
        versionId: bannerId,
        weaponId: weaponId,
        refinement: refinementLevel,
        successPercent: successCount / attemptCount,
      });
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
  characterPity: number,
  characterGuaranteed: boolean,
  weaponPity: number,
  weaponGuaranteed: boolean,
  simulations: number,
  setSimulationProgress?: (progress: number) => void
): Promise<SimulationResults> => {
  const totalSimulations = simulations;
  const batchSize = Math.min(1000, Math.floor(totalSimulations / 10));
  let completedSimulations = 0;
  const allSimulationResults: SimulationResult[] = [];

  return new Promise<SimulationResults>((resolve) => {
    const processBatch = (startIndex: number) => {
      if (startIndex >= totalSimulations) {
        resolve(finalizeResults(allSimulationResults));
        return;
      }

      const currentBatchSize = Math.min(
        batchSize,
        totalSimulations - startIndex
      );
      const batchResults = runSimulationBatch(
        banners,
        bannerConfiguration,
        characterPity,
        characterGuaranteed,
        currentBatchSize,
        weaponPity,
        weaponGuaranteed
      );

      allSimulationResults.push(...batchResults);
      completedSimulations += currentBatchSize;

      if (setSimulationProgress) {
        setSimulationProgress(completedSimulations / totalSimulations);
      }

      // Yield control back to the event loop
      setTimeout(() => processBatch(startIndex + batchSize), 0);
    };

    processBatch(0);
  });
};
