"use client";
import { Separator } from "@/components/ui/separator";
import BannerCard from "@/components/banner-card";
import { useGenshin } from "@/lib/context/genshin-context";
import RunSimulationButton from "./runSimulationButton";
import { VersionId } from "@/lib/types";

export default function StrategyMode() {
  const {
    banners,
    bannerAllocations,
    availableWishes,
    estimatedNewWishesPerBanner,
  } = useGenshin();
  const handlePriorityChange = () => {
    console.log("TODO: update banner allocation");
  };

  const handleStopAtChange = () => {
    console.log("TODO: update stop at");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Set your character priorities and let the strategy suggest the best
          wish allocation strategy.
        </p>
      </div>

      <Separator className="bg-void-2/50" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gold-1">
          Character Priorities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              mode="strategy"
              onPriorityChange={handlePriorityChange}
              allocation={bannerAllocations[banner.id as VersionId]}
              availableWishes={availableWishes}
              estimatedNewWishesPerBanner={estimatedNewWishesPerBanner}
              onStopAtChange={handleStopAtChange}
            />
          ))}
        </div>
      </div>
      <Separator className="bg-void-2/50" />
      <RunSimulationButton />
    </div>
  );
}
