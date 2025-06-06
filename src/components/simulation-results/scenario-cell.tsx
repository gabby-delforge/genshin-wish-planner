import { Desktop, Mobile } from "@/lib/responsive-design/responsive-context";
import { ApiBanner, BannerOutcome } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { ScenarioCellMobile } from "./scenario-cell-mobile";
import { ScenarioCellDesktop } from "./scenario-cell-desktop";
import { processScenario } from "./scenario-utils";

type ScenarioCellProps = {
  bannerOutcome?: BannerOutcome;
  banner: ApiBanner;
};

// Main component using responsive wrappers
export const ScenarioCell = observer(({ bannerOutcome }: ScenarioCellProps) => {
  const processedScenario = useMemo(() => {
    return processScenario(bannerOutcome);
  }, [bannerOutcome]);

  return (
    <>
      <Mobile>
        <ScenarioCellMobile processedScenario={processedScenario} />
      </Mobile>
      <Desktop>
        <ScenarioCellDesktop processedScenario={processedScenario} />
      </Desktop>
    </>
  );
});
