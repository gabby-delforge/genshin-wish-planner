import { simulationResultsToScenario } from "@/lib/simulation/simulation-utils";
import { ApiBanner, Scenario, ScenarioResult } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { BannerVersion } from "./banner/banner-version";
import { ScenarioCell } from "./scenario-cell";
import { ProgressBar } from "./ui/progress-bar";

const GridSection = observer(
  ({
    scenarios,
    banners,
    label,
    className,
  }: {
    scenarios: Scenario[];
    banners: ApiBanner[];
    label: string;
    className?: string;
  }) => {
    return (
      <div className="text-sm">
        <div className="py-2">{label}:</div>
        <div
          className={`grid grid-cols-${
            banners.length + 1
          } gap-4 px-2 justify-center`}
        >
          <>
            {banners.map((banner) => (
              <BannerVersion version={banner.version} key={banner.version} />
            ))}
            <div className="w-full" />
          </>
        </div>
        <div
          className={`grid grid-cols-${
            banners.length + 1
          } gap-4 p-2 ${className}`}
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
                <ProgressBar percent={scenario.probability} />
              </div>
            </>
          ))}
        </div>
      </div>
    );
  }
);

type ScenariosGridProps = {
  scenarioResults: ScenarioResult[];
  banners: ApiBanner[];
};

const ScenariosGrid = observer(
  ({ scenarioResults, banners }: ScenariosGridProps) => {
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
          className="bg-gradient-to-r from-white/5 via-white/10 to-white/5"
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
);

export default ScenariosGrid;
