import { ApiBanner, Scenario } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { BannerVersion } from "../banner/banner-version";
import { ProgressBar } from "../ui/progress-bar";
import { ScenarioCell } from "./scenario-cell";

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
        <div className="py-2">{label}</div>
        <div
          className={`grid grid-cols-${
            banners.length + 1
          } gap-1 @lg/sim:gap-4 justify-center pb-2`}
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
          } gap-x-1 gap-y-6 py-2 ${className}`}
        >
          {scenarios.map((scenario, scenarioIndex) => (
            <>
              {banners.map((banner) => {
                // Find the banner outcome for this banner
                const bannerOutcome = scenario.bannerOutcomes.find(
                  (outcome) => outcome.bannerId === banner.version
                );

                return (
                  <ScenarioCell
                    key={`${scenarioIndex}-${banner.id}`}
                    bannerOutcome={bannerOutcome}
                    banner={banner}
                  />
                );
              })}
              <div className="text-sm w-full flex flex-col justify-center">
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
  scenarios: Scenario[];
  banners: ApiBanner[];
};

const ScenariosGrid = observer(({ scenarios, banners }: ScenariosGridProps) => {
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No scenarios available
      </div>
    );
  }

  const mostLikelyScenario = scenarios.slice(0, 1);
  const likelyScenarios = scenarios
    .slice(1)
    .filter((s) => s.probability >= 0.2); // 20% threshold for "likely"
  const unlikelyScenarios = scenarios
    .slice(1)
    .filter((s) => s.probability > 0.05);

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
});

export default ScenariosGrid;
