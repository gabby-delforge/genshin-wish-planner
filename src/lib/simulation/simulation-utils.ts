import {
  ApiBanner,
  BannerId,
  BannerSimulationResult,
  ResultType,
  ScenarioOld,
  ScenarioOutcome,
} from "../types";

const bannerResultToOutcome = (
  bannerResult: BannerSimulationResult
): ScenarioOutcome => {
  // Extract results for up to two featured characters
  const characterResults = Object.values(bannerResult.characterResults);

  // Initialize result and constellation arrays
  const result: [ResultType, ResultType] = ["Skipped", "Skipped"];
  const constellation: [number, number] = [0, 0];

  // Process each character result (up to 2)
  for (let i = 0; i < Math.min(characterResults.length, 2); i++) {
    const charResult = characterResults[i];

    if (!charResult.hasWishesAllocated) {
      result[i] = "Skipped";
    } else if (charResult.obtained) {
      if (charResult.lostFiftyFifty) {
        result[i] = "Standard 5*";
      } else {
        result[i] = charResult.character;
        constellation[i] = charResult.constellation;
      }
    } else {
      result[i] = "Missed";
    }
  }

  return {
    banner: bannerResult.bannerId,
    result,
    constellation,
  };
};

// New function to directly convert BannerSimulationResult[] to Scenario
export const simulationResultsToScenario = (
  bannerResults: Record<BannerId, BannerSimulationResult>,
  probability: number,
  allBanners: ApiBanner[]
): ScenarioOld => {
  // Create outcomes for all banners, including those not in the simulation results
  const outcomes: Record<BannerId, ScenarioOutcome> = {};

  // First set default outcomes for all banners
  allBanners.forEach((banner) => {
    outcomes[banner.id] = {
      banner: banner.id,
      result: ["Skipped", "Skipped"],
      constellation: [0, 0],
    };
  });

  // Then update with actual results
  Object.values(bannerResults).forEach((result) => {
    outcomes[result.bannerId] = bannerResultToOutcome(result);
  });

  return {
    outcomes,
    probability,
  };
};
