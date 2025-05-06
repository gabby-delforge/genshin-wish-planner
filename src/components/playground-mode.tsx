"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import BannerCard from "@/components/banner-card";
import { Loader2 } from "lucide-react";
import { useGenshin } from "@/lib/context/genshin-context";
import { CharacterId, VersionId } from "@/lib/types";

export default function PlaygroundMode() {
  const {
    banners,
    simulations,
    setSimulations,
    isSimulating,
    runPlaygroundSimulation,
    playground,
    optimizer,
    dispatch,
  } = useGenshin();
  const handleWishChange = (
    bannerId: string | number,
    characterId: CharacterId,
    wishes: number
  ) => {
    dispatch({
      type: "UPDATE_WISH_ALLOCATION",
      payload: {
        bannerVersion: bannerId as VersionId,
        characterId: characterId,
        wishes,
      },
    });
  };

  const handleRunSimulation = () => {
    runPlaygroundSimulation();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Allocate wishes to characters on upcoming banners and see your chances
          of getting them. Perfect for planning your wish strategy.
        </p>

        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="simulationCount" className="text-sm">
              Simulation Count
            </Label>
            <Input
              id="simulationCount"
              type="number"
              min="1000"
              max="100000"
              step="1000"
              value={simulations}
              onChange={(e) =>
                setSimulations(Number.parseInt(e.target.value) || 10000)
              }
              className="bg-[#1a1b2e] border-[#4a4c72]"
            />
          </div>
          <Button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="mt-6 bg-gradient-to-r from-[#7b68ee] to-[#9370db] hover:from-[#6a5acd] hover:to-[#8a2be2] border-none"
          >
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              "Run Simulation"
            )}
          </Button>
        </div>
      </div>

      <Separator className="bg-[#4a4c72]/50" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#f5d0a9]">Banner Setup</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onWishChange={handleWishChange}
              mode="playground"
              wishAllocation={playground.wishAllocation}
              wantAllocation={optimizer.wantAllocation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
