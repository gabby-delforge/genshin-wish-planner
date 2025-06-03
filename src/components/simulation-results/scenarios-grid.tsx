import React from "react";
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
    // Generate explicit grid column classes that Tailwind can detect
    const getGridColsClass = (columnCount: number) => {
      const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        7: "grid-cols-7",
        8: "grid-cols-8",
        9: "grid-cols-9",
        10: "grid-cols-10",
        11: "grid-cols-11",
        12: "grid-cols-12",
      } as const;

      return (
        gridClasses[columnCount as keyof typeof gridClasses] || "grid-cols-12"
      );
    };

    const columnsCount = banners.length + 1;
    const gridColsClass = getGridColsClass(columnsCount);

    return (
      <div className="text-sm">
        <div className="py-2">{label}</div>
        <div
          className={`grid ${gridColsClass} gap-1 @lg/sim:gap-4 justify-center pb-2`}
        >
          <>
            {banners.map((banner) => (
              <BannerVersion version={banner.version} key={banner.version} />
            ))}
            <div className="w-full" />
          </>
        </div>
        <div
          className={`grid ${gridColsClass} gap-x-1 gap-y-6 py-2 ${className}`}
        >
          {scenarios.map((scenario, scenarioIndex) => (
            <React.Fragment key={`scenario-${scenarioIndex}`}>
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
              <div className="text-sm w-full flex flex-col justify-center px-0 @md/sim:px-2">
                <div className="text-muted-foreground">
                  {(scenario.probability * 100).toFixed(2)}%
                </div>
                <ProgressBar percent={scenario.probability} />
              </div>
            </React.Fragment>
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
  const remainingScenarios = scenarios.slice(1);

  // Ensure we show at least 10 scenarios total
  const minScenariosToShow = Math.min(10, scenarios.length);
  const remainingScenariosToShow = minScenariosToShow - 1; // -1 for the most likely scenario

  const likelyScenarios = remainingScenarios
    .filter((s) => s.probability >= 0.2) // 20% threshold for "likely"
    .slice(0, Math.max(0, remainingScenariosToShow));

  const likelyScenariosCount = likelyScenarios.length;
  const remainingCount = remainingScenariosToShow - likelyScenariosCount;

  const unlikelyScenarios = remainingScenarios
    .slice(likelyScenariosCount) // Start after likely scenarios to avoid overlap
    .slice(0, Math.max(0, remainingCount));

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
