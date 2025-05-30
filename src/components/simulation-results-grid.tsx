import { SimulationResults } from "@/lib/types";
import { getCharacterRarityColor } from "@/lib/utils";
import { BannerVersion } from "./banner/banner-version";
import { ProgressBar } from "./ui/progress-bar";

type SimulationResultsGridProps = {
  simulationResults: SimulationResults | null;
};

export const SimulationResultsGrid = ({
  simulationResults,
}: SimulationResultsGridProps) => {
  const results = simulationResults?.characterSuccessRates;

  return (
    <div className="grid gap-2">
      {results &&
        results.length > 0 &&
        results.map((result, index) => (
          <div
            key={index}
            className="bg-void-1 rounded-md p-3 border border-void-2"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <BannerVersion version={result.versionId} />
                <span
                  className={`text-sm font-medium ${getCharacterRarityColor(
                    5
                  )}`}
                >
                  {`${
                    result.characterId.charAt(0).toUpperCase() +
                    result.characterId.slice(1)
                  } (C${result.constellation} or higher)`}
                </span>
              </div>
              {result.successPercent === 1 ? (
                <div className="text-sm font-medium text-yellow-400">
                  Guaranteed
                </div>
              ) : (
                <div className="text-sm font-medium">
                  {(result.successPercent * 100).toFixed(1)}%
                </div>
              )}
            </div>
            <ProgressBar percent={result.successPercent} />
            {/* <div className="text-sm text-muted-foreground mt-1">
              Average wishes needed: {result.averageWishes}
            </div> */}
          </div>
        ))}
    </div>
  );
};
