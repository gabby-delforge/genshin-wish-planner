import { WishesAvailableTooltip } from "@/components/banner/wishes-available-tooltip";
import { LimitedWish } from "@/components/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { calculateMaxSpendableWishesMultiBanner } from "@/lib/simulation/starglitter-utils";
import {
  ApiCharacter,
  BannerConfiguration,
  BannerWishBreakdown,
} from "@/lib/types";
import { sum } from "lodash";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

type WishesInputProps = {
  isLoading: boolean;
  character: ApiCharacter;
  numWishesAllocated: number;
  setNumWishesAllocated: (n: number) => void;
  bannerWishBreakdown: BannerWishBreakdown;
  bannerConfig: BannerConfiguration;
};
export const WishesInput = observer(
  ({
    isLoading,
    character,
    numWishesAllocated,
    setNumWishesAllocated,
    bannerWishBreakdown,
    bannerConfig,
  }: WishesInputProps) => {
    const [baseSpendable, setBaseSpendable] = useState(0);
    const [starglitterWishesGained, setStarglitterWishesGained] = useState(0);
    useEffect(() => {
      // "Give back" the wishes spent on this character since they're included in the amount we can spend here
      const x = Object.entries(bannerConfig.characters)
        .filter(([charId]) => charId !== character.Id)
        .map(([, configValue]) => configValue.wishesAllocated);
      const s = Math.max(
        0,
        bannerWishBreakdown.startingWishes +
          bannerWishBreakdown.earnedWishes -
          bannerWishBreakdown.wishesSpentOnWeapons -
          sum(x)
      );
      setBaseSpendable(s);

      const { starglitterWishesGained } =
        calculateMaxSpendableWishesMultiBanner(
          s,
          bannerWishBreakdown.wishesSpentOnWeapons,
          s
        );
      setStarglitterWishesGained(starglitterWishesGained);
    }, [bannerWishBreakdown, numWishesAllocated]);

    const handleMaximumClick = useCallback(() => {
      setNumWishesAllocated(
        Math.floor(baseSpendable + starglitterWishesGained)
      );
    }, [baseSpendable, starglitterWishesGained]);

    return (
      <div className="flex flex-col items-end gap-1">
        <div className="text-xs text-white text-right mr-4">Spend up to</div>
        <div className="flex items-center gap-1">
          <Input
            isLoading={isLoading}
            id={`wishes-${character.Id}`}
            type="number"
            min="0"
            value={numWishesAllocated}
            onChange={(e) => setNumWishesAllocated(parseInt(e.target.value))}
            unit={<LimitedWish />}
            showPlusMinus={true}
            width={"w-8"}
          />
          <WishesAvailableTooltip
            wishSources={[
              { label: "base", amount: baseSpendable },
              { label: "from Starglitter", amount: starglitterWishesGained },
            ]}
          >
            <Button
              onClick={handleMaximumClick}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-6"
            >
              Max
            </Button>
          </WishesAvailableTooltip>
        </div>
      </div>
    );
  }
);
