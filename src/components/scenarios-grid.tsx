import { simulationResultsToScenario } from "@/lib/simulation/simulation-utils";
import { Banner, Scenario, ScenarioResult } from "@/lib/types";
import { useMemo } from "react";
import { BannerVersion } from "./banner-version";
import ScenarioCell from "./scenario-cell";

const GridSection = ({
  scenarios,
  banners,
  label,
  className,
}: {
  scenarios: Scenario[];
  banners: Banner[];
  label: string;
  className?: string;
}) => {
  return (
    <div className="text-xs">
      <div className="py-2">{label}:</div>
      <div className="grid grid-cols-5 gap-x-6 gap-y-2 justify-center">
        <>
          {banners.map((banner) => (
            <BannerVersion version={banner.version} key={banner.version} />
          ))}
          <div className="col-span-5" />
        </>
      </div>
      <div
        className={`grid grid-cols-5 gap-x-6 gap-y-1 p-2 rounded-xl ${className}`}
      >
        {scenarios.map((scenario, scenarioIndex) => (
          <>
            {banners.map((banner) => (
              <ScenarioCell
                key={`${scenarioIndex}-${banner.id}`}
                scenario={scenario.outcomes[banner.id]}
              />
            ))}
            <div className="text-sm w-full">
              <div className="text-muted-foreground">
                {(scenario.probability * 100).toFixed(2)}%
              </div>
              <div className="w-full bg-bg-dark-2 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#7b68ee] to-[#9370db] h-2 rounded-full"
                  style={{ width: `${scenario.probability * 100}%` }}
                ></div>
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

type ScenariosGridProps = {
  scenarioResults: ScenarioResult[];
  banners: Banner[];
};

export default function ScenariosGrid({
  scenarioResults,
  banners,
}: ScenariosGridProps) {
  const scenarios: Scenario[] = useMemo(() => {
    if (!scenarioResults) return [];
    return scenarioResults.map((result) =>
      simulationResultsToScenario(
        result.bannerResults,
        result.percentage,
        banners
      )
    );
  }, [scenarioResults, banners]);

  const mostLikelyScenario = scenarios.slice(0, 1);
  const likelyScenarios = scenarios
    .slice(1)
    .filter((s) => s.probability >= 0.5);
  const unlikelyScenarios = scenarios
    .slice(1)
    .filter((s) => s.probability < 0.5);

  return (
    <div className="flex flex-col gap-2">
      <GridSection
        className="bg-amber-200/30 border border-amber-100"
        scenarios={mostLikelyScenario}
        label={"Most likely scenario"}
        banners={banners}
      />
      {likelyScenarios.length > 0 && (
        <GridSection
          scenarios={likelyScenarios}
          label={"Likely scenarios"}
          banners={banners}
        />
      )}
      {unlikelyScenarios.length > 0 && (
        <GridSection
          scenarios={unlikelyScenarios}
          label={"Other scenarios"}
          banners={banners}
        />
      )}
    </div>
  );
}
