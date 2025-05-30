"use client";
import BannerCard from "@/components/banner/banner-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GenshinState } from "@/lib/mobx/genshin-state";
import { ApiBanner } from "@/lib/types";
import { isCurrentBanner, isPastDate } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import RunSimulationButton from "./run-simulation-button";

export const SimulationPanelContent = observer(
  ({ genshinState }: { genshinState: GenshinState }) => {
    const headerText = useMemo(() => {
      if (genshinState.mode === "playground") {
        return "Wish Allocation";
      } else {
        return "Character Priorities";
      }
    }, [genshinState.mode]);
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gold-1">{headerText}</h3>

          <div className="grid grid-cols-1  @4xl/sim:grid-cols-2 gap-4">
            {genshinState.banners.map((banner: ApiBanner) => (
              <BannerCard
                key={banner.id}
                id={banner.id}
                bannerData={banner}
                bannerConfiguration={
                  genshinState.bannerConfiguration[banner.id]
                }
                wishesAvailable={genshinState.availableWishes}
                isCurrentBanner={isCurrentBanner(banner)}
                isOldBanner={isPastDate(banner.endDate)}
                estimatedWishesEarned={
                  genshinState.estimatedNewWishesMap[banner.id]
                }
              />
            ))}
          </div>
        </div>
        <RunSimulationButton className="w-full" />
        <ProgressBar percent={genshinState.simulationProgress} />
      </div>
    );
  }
);

export default SimulationPanelContent;
