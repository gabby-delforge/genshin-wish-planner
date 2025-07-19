import { useGenshinState } from "@/lib/mobx/genshin-context";
import {
  ApiBanner,
  BannerConfiguration,
  BannerWishBreakdown,
} from "@/lib/types";
import { cn, toFriendlyDate } from "@/lib/utils";
import { Info } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { LimitedWish } from "../resource";
import { Button } from "../ui/button";
import { CardHeader, CardTitle } from "../ui/card";
import { BannerVersion } from "./banner-version";
import { WishesAvailableTooltip } from "./wishes-available-tooltip";

type BannerHeaderProps = {
  id: string;
  bannerData: ApiBanner;
  isCurrentBanner: boolean;
  estimatedWishesEarned: number;
  bannerConfiguration: BannerConfiguration;
  availableWishes: Record<string, BannerWishBreakdown>;
};
export const BannerHeader = observer(
  ({
    id,
    bannerData,
    isCurrentBanner,
    estimatedWishesEarned,
    bannerConfiguration,
    availableWishes,
  }: BannerHeaderProps) => {
    const { resetBanner } = useGenshinState();
    const displayStartDate = useMemo(
      () => toFriendlyDate(new Date(bannerData.startDate)),
      [bannerData.startDate]
    );

    const displayEndDate = useMemo(
      () => toFriendlyDate(new Date(bannerData.endDate)),
      [bannerData.endDate]
    );

    const wishesAvailableLabel = useMemo(() => {
      if (!availableWishes[id]) return null;

      const {
        startingWishes,
        earnedWishes,
        starglitterWishes,
        wishesSpentOnWeapons,
        wishesSpentOnCharacters,
        endingWishes,
      } = availableWishes[id];

      return (
        <WishesAvailableTooltip
          wishSources={[
            {
              label: isCurrentBanner ? "in account" : "carryover",
              amount: startingWishes,
            },
            { label: "earned", amount: earnedWishes },
            { label: "from Starglitter", amount: starglitterWishes },
            {
              label: "spent",
              amount: 0 - (wishesSpentOnCharacters + wishesSpentOnWeapons),
            },
          ]}
        >
          <div
            className={cn(
              "flex items-center gap-1 text-sm",
              endingWishes + starglitterWishes < 0
                ? "text-red-300"
                : "text-white"
            )}
          >
            <LimitedWish number={endingWishes + starglitterWishes} />
            available
            <Info width={12} height={12} />
          </div>
        </WishesAvailableTooltip>
      );
    }, [availableWishes, estimatedWishesEarned, id, bannerConfiguration]);

    return (
      <CardHeader className="pb-6">
        <CardTitle className="text-md font-medium flex justify-between">
          <div className="flex flex-col items-start @md/card:flex-row @md/card:items-center  gap-2 ">
            <BannerVersion version={id} />
            <p className=" text-white/80 uppercase font-bold text-xs">
              {displayStartDate} - {displayEndDate}
            </p>
            {bannerData.status === "leaked" ? (
              <div className="ml-2 italic text-xs rounded-xl px-2 py-0.5 bg-white/20 border-1 border-white">
                Not yet confirmed
              </div>
            ) : null}
          </div>
          <div className=" flex flex-col items-end text-sm text-white">
            {wishesAvailableLabel}
            <Button
              variant="link"
              size="sm"
              className="text-xs italic px-2 py-1 h-6 text-white/40"
              onClick={() => resetBanner(id)}
            >
              Reset allocation
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
    );
  }
);
