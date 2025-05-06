"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Banner, Character } from "@/lib/types";
import BannerCard from "@/components/banner-card";
import { Loader2 } from "lucide-react";
import { useGenshin } from "@/lib/context/genshin-context";

export default function StrategyMode() {
  const {
    banners,
    setBanners,
    optimizer,
    simulations,
    setSimulations,
    isSimulating,
  } = useGenshin();
  const handlePriorityChange = (
    bannerId: string | number,
    characterName: string,
    priority: "must-have" | "want" | "nice-to-have" | "skip"
  ) => {
    const updatedBanners: Banner[] = banners.map((banner) => {
      if (banner.id.toString() === bannerId.toString()) {
        const updatedCharacters: Character[] = banner.characters.map((char) => {
          if (char.name === characterName) {
            return { ...char, priority };
          }
          return char;
        });
        return { ...banner, characters: updatedCharacters };
      }
      return banner;
    });

    setBanners(updatedBanners);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Set your character priorities and let the optimizer suggest the best
          wish allocation strategy to maximize your chances of getting the
          characters you want most.
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
            onClick={optimizer.runSimulation}
            disabled={isSimulating}
            className="mt-6 bg-gradient-to-r from-[#7b68ee] to-[#9370db] hover:from-[#6a5acd] hover:to-[#8a2be2] border-none"
          >
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              "Find Optimal Strategy"
            )}
          </Button>
        </div>
      </div>

      <Separator className="bg-[#4a4c72]/50" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#f5d0a9]">
          Character Priorities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onPriorityChange={handlePriorityChange}
              mode="strategy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
