"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { API_CHARACTERS, API_WEAPONS } from "@/lib/data";
import { FLAGS } from "@/lib/feature-flags";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import {
  ApiBanner,
  BannerConfiguration,
  DEFAULT_PRIORITY,
  Priority,
  WeaponId,
  type BannerId,
} from "@/lib/types";
import { toFriendlyDate } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { LimitedWish } from "../resource";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { BannerVersion } from "./banner-version";
import { CharacterRow } from "./character-row";
import { WeaponBannerRow } from "./weapon-banner-row";

export type BannerCardProps = {
  id: BannerId;
  bannerData: ApiBanner;
  bannerConfiguration: BannerConfiguration;
  wishesAvailable: Record<BannerId, number>;
  isCurrentBanner: boolean;
  isOldBanner: boolean;
  estimatedWishesEarned: number;
};

const BannerCard = observer(
  ({
    id,
    bannerData,
    bannerConfiguration,
    wishesAvailable,
    isCurrentBanner,
    isOldBanner,
    estimatedWishesEarned,
  }: BannerCardProps) => {
    const {
      accountStatusExcludeCurrentBannerPrimogemSources,
      allocateWishesToCharacter,
      allocateWishesToWeaponBanner,
      setCharacterPullPriority,
      setEpitomizedPath,
      setWeaponBannerStrategy,
      setCharacterMaxConstellation,
    } = useGenshinState();
    const wishesAvailableLabel = useMemo(() => {
      const totalWishes = wishesAvailable[id] || 0;

      const gainedWishes =
        isCurrentBanner && accountStatusExcludeCurrentBannerPrimogemSources
          ? 0
          : estimatedWishesEarned;
      // This represents the wishes the user started with
      let spentWishes = 0;
      for (const char of Object.values(bannerConfiguration.characters)) {
        spentWishes += char.wishesAllocated;
      }
      // totalWishes = earned + leftover - spent
      // leftover = spent + totalWishes - earned
      const leftover = spentWishes - gainedWishes + totalWishes;

      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-sm text-white ">
                <LimitedWish number={totalWishes} />
                available
              </div>
            </TooltipTrigger>
            <TooltipContent className="flex gap-1 items-center">
              <LimitedWish number={leftover} />
              <div>leftover</div>
              {gainedWishes > 0 && (
                <>
                  <div>+</div>
                  <LimitedWish number={gainedWishes} />
                  <div>earned</div>
                </>
              )}

              {spentWishes > 0 && (
                <>
                  <div>-</div>
                  <LimitedWish number={spentWishes} />
                  <div>spent</div>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }, [wishesAvailable, estimatedWishesEarned, id]);

    const displayStartDate = useMemo(
      () => toFriendlyDate(new Date(bannerConfiguration.banner.startDate)),
      [bannerConfiguration.banner.startDate]
    );

    const displayEndDate = useMemo(
      () => toFriendlyDate(new Date(bannerConfiguration.banner.endDate)),
      [bannerConfiguration.banner.endDate]
    );

    return (
      <Card
        className={`bg-void-3/30 ${
          isOldBanner ? "opacity-40" : "opacity-100"
        } border-void-2 overflow-hidden shadow @container/card`}
      >
        <div className="h-2 bg-gradient-to-r from-[#7b68ee] to-[#9370db]"></div>
        <div className="h-[1px]  bg-gradient-to-r from-gold-1/50 via-gold-1 to-gold-1/50"></div>

        <CardHeader className="pb-6">
          <CardTitle className="text-md font-medium flex justify-between">
            <div className="flex flex-col items-start @md/card:flex-row @md/card:items-center  gap-2 ">
              <BannerVersion version={id} />
              <p className=" text-white/80 uppercase font-bold text-xs">
                {displayStartDate} - {displayEndDate}
              </p>
              {isCurrentBanner && (
                <div className="text-sm text-white/40">(Current banner)</div>
              )}
            </div>
            <div className=" flex flex-row items-center text-sm text-white">
              {wishesAvailableLabel}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-2 md:px-6">
          {bannerConfiguration.banner.characters.map((characterId) => {
            const character = API_CHARACTERS[characterId];
            if (!character) return null;
            return (
              <CharacterRow
                key={characterId}
                characterId={characterId}
                character={character}
                currentMaxConstellation={
                  bannerConfiguration.characters[characterId]
                    ?.maxConstellation || 0
                }
                setMaxConstellation={(value: number) =>
                  setCharacterMaxConstellation(id, characterId, value)
                }
                currentWishesAllocated={
                  bannerConfiguration.characters[characterId]
                    ?.wishesAllocated || 0
                }
                setWishesAllocated={(value: number) =>
                  allocateWishesToCharacter(id, characterId, value)
                }
                currentPriority={
                  bannerConfiguration.characters[characterId]?.priority ||
                  DEFAULT_PRIORITY
                }
                setCurrentPriority={(value: Priority) =>
                  setCharacterPullPriority(id, characterId, value)
                }
              />
            );
          })}
          {FLAGS.WEAPON_BANNER && (
            <>
              <Separator />
              <WeaponBannerRow
                weapons={[
                  API_WEAPONS[bannerData.weapons[0]!]!, // Lol
                  API_WEAPONS[bannerData.weapons[1]!]!,
                ]}
                currentWishesAllocated={
                  bannerConfiguration.weaponBanner.wishesAllocated
                }
                setWishesAllocated={(value: number) =>
                  allocateWishesToWeaponBanner(id, value)
                }
                currentEpitomizedPath={""}
                setEpitomizedPath={(weaponId: WeaponId) =>
                  setEpitomizedPath(id, weaponId)
                }
                currentStrategy={"stop"}
                setStrategy={(strategy: "stop" | "continue") =>
                  setWeaponBannerStrategy(id, strategy)
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    );
  }
);

export default BannerCard;
