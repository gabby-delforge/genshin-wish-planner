"use client";
import BannerCard from "@/components/banner/banner-card";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { ApiBanner } from "@/lib/types";
import { isCurrentBanner, isPastDate } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import RunSimulationButton from "./run-simulation-button";

export const SimulationPanelContent = observer(() => {
  const {
    mode,
    banners,
    bannerConfiguration,
    availableWishes,
    estimatedNewWishesMap,
  } = useGenshinState();
  const headerText = useMemo(() => {
    if (mode === "playground") {
      return "Wish Allocation";
    } else {
      return "Character Priorities";
    }
  }, [mode]);

  const descriptionText = useMemo(() => {
    if (mode === "playground") {
      return "Assign your available wishes to banners and run the simulation to see your chances of getting each character.";
    } else {
      return "Character Priorities";
    }
  }, [mode]);
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gold-1">{headerText}</h3>
        <div className="text-sm text-white/80">{descriptionText}</div>

        <div className="grid grid-cols-1 @4xl/sim:grid-cols-2 gap-4">
          {banners.map((banner: ApiBanner) => (
            <BannerCard
              key={banner.id}
              id={banner.id}
              bannerData={banner}
              bannerConfiguration={bannerConfiguration[banner.id]}
              wishesAvailable={availableWishes}
              isCurrentBanner={isCurrentBanner(banner)}
              isOldBanner={isPastDate(banner.endDate)}
              estimatedWishesEarned={estimatedNewWishesMap[banner.id]}
            />
          ))}
        </div>
      </div>
      <RunSimulationButton className="w-full" />
    </div>
  );
});

export default SimulationPanelContent;
