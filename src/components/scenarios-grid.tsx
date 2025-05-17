import { simulationResultsToScenario } from "@/lib/simulation/simulation";
import { Banner, Scenario, ScenarioResult } from "@/lib/types";
import { useMemo } from "react";
import ScenarioCell from "./scenario-cell";

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
        result.percentage / 100,
        banners
      )
    );
  }, [scenarioResults, banners]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Common Scenarios</h3>
      <p className="text-sm text-muted-foreground">
        These are the most likely outcomes based on your wish allocation.
      </p>

      <div className="grid grid-cols-5 gap-6">
        <>
          {banners.map((banner) => (
            <div key={banner.id}>
              <h4 className="text-sm font-medium">{banner.name}</h4>
            </div>
          ))}
          <div className="col-span-5" />
        </>
        <>
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
        </>
      </div>
    </div>
  );
}
