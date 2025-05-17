"use client";
import BannerCard from "@/components/banner-card";
import { Separator } from "@/components/ui/separator";
import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import { Banner, BannerAllocation, VersionId } from "@/lib/types";
import RunSimulationButton from "./runSimulationButton";

export default function PlaygroundMode() {
  const {
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Allocate wishes to characters on upcoming banners and see your chances
          of getting them. Perfect for planning your wish strategy.
        </p>
      </div>

      <Separator className="bg-void-2/50" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gold-1">Banner Setup</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner: Banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              mode="playground"
              allocation={bannerAllocations[banner.id as VersionId]}
              availableWishes={availableWishes}
              estimatedNewWishesPerBanner={estimatedNewWishesPerBanner}
              updateBannerConfiguration={updateBannerConfiguration}
            />
          ))}
        </div>
      </div>
      <Separator className="bg-void-2/50" />

      <RunSimulationButton />
    </div>
  );
}
