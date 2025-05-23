"use client";
import BannerCard from "@/components/banner-card";
import { Separator } from "@/components/ui/separator";
import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import { Banner, BannerAllocation, VersionId } from "@/lib/types";
import { useMemo } from "react";
import RunSimulationButton from "./run-simulation-button";

export default function SimulationPanelContent() {
  const {
    mode,
    banners,
    bannerAllocations,
    availableWishes,
    estimatedNewWishesPerBanner,
  } = useGenshinState();
  const { setBannerAllocation } = useGenshinActions();

  const updateBannerConfiguration = (
    bannerVersion: VersionId,
    newAllocation: BannerAllocation
  ) => {
    setBannerAllocation(bannerVersion, newAllocation);
  };

  const descriptionText = useMemo(() => {
    if (mode === "playground") {
      return "Allocate wishes to characters on upcoming banners and simulate your chances of getting them.";
    } else {
      return "Set your character priorities and let the simulator suggest the best wish allocation strategy.";
    }
  }, [mode]);

  const headerText = useMemo(() => {
    if (mode === "playground") {
      return "Wish Allocation";
    } else {
      return "Character Priorities";
    }
  }, [mode]);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{descriptionText}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gold-1">{headerText}</h3>

        <div className="grid grid-cols-1  @md/sim:grid-cols-2 gap-4">
          {banners.map((banner: Banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              mode={mode}
              allocation={bannerAllocations[banner.id as VersionId]}
              availableWishes={availableWishes}
              estimatedNewWishesPerBanner={estimatedNewWishesPerBanner}
              updateBannerConfiguration={updateBannerConfiguration}
            />
          ))}
        </div>
      </div>
      <Separator className="bg-void-2/50" />
      <RunSimulationButton className="w-full" />
    </div>
  );
}
