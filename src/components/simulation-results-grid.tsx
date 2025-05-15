import { CharacterId, SimulationResults, VersionId } from "@/lib/types";
import { getCharacterRarityColor } from "@/lib/utils";
import { useMemo } from "react";

type SimulationResultsGridProps = {
  simulationResults: SimulationResults | null;
};

export const SimulationResultsGrid = ({
  simulationResults,
}: SimulationResultsGridProps) => {
  const results: {
    banner: VersionId;
    character: CharacterId;
    successRate: number;
  }[] = useMemo(() => {
    const results: {
      banner: VersionId;
      character: CharacterId;
      successRate: number;
    }[] = [];
    if (!simulationResults) {
      return results;
    }
    for (const banner in simulationResults.characterSuccessRates) {
      const bannerResults =
        simulationResults.characterSuccessRates[banner as VersionId];
      for (const character in bannerResults) {
        if (bannerResults[character as CharacterId]! === 0) {
          continue;
        }
        results.push({
          banner: banner as VersionId,
          character: character as CharacterId,
          successRate: bannerResults[character as CharacterId]!,
        });
      }
    }
    return results;
  }, [simulationResults]);

  return (
    <div className="grid gap-2">
      {results.length > 0 ? (
        results.map((result, index) => (
          <div
            key={index}
            className="bg-void-1 rounded-md p-3 border border-void-2"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium">{result.banner} — </span>
                <span
                  className={`text-sm font-medium ${getCharacterRarityColor(
                    5
                  )}`}
                >
                  {result.character.charAt(0).toUpperCase() +
                    result.character.slice(1)}
                </span>
              </div>
              <div className="text-sm font-medium">
                {(result.successRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="w-full bg-bg-dark-2 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#7b68ee] to-[#9370db] h-2 rounded-full"
                style={{ width: `${result.successRate * 100}%` }}
              ></div>
            </div>
            {/* <div className="text-sm text-muted-foreground mt-1">
              Average wishes needed: {result.averageWishes}
            </div> */}
          </div>
        ))
      ) : (
        <div className="bg-void-1 rounded-md p-4 text-center">
          <p className="text-muted-foreground">
            No simulation results available. Run a simulation to see results
            here.
          </p>
        </div>
      )}
    </div>
  );
};
