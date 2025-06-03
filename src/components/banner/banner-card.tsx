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
import { cn, toFriendlyDate } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { LimitedWish } from "../resource";
import { CheckboxWithLabel } from "../ui/checkbox-with-label";
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
      shouldExcludeCurrentBannerEarnedWishes:
        accountStatusExcludeCurrentBannerPrimogemSources,
      setAccountStatusExcludeCurrentBannerPrimogemSources,
      allocateWishesToCharacter,
      allocateWishesToWeaponBanner,
      setCharacterPullPriority,
      setEpitomizedPath,
      setWeaponBannerStrategy,
      setWeaponBannerMaxRefinement,
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
      const leftover = spentWishes - gainedWishes + totalWishes;

      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm",
                  totalWishes < 0 ? "text-red-300" : "text-white"
                )}
              >
                <LimitedWish number={totalWishes} />
                available
              </div>
            </TooltipTrigger>
            <TooltipContent className="flex gap-1 items-center">
              <LimitedWish number={leftover} />
              <div>{isCurrentBanner ? "owned" : "leftover"}</div>
              {gainedWishes > 0 && (
                <>
                  <div className="text-black/50">+</div>
                  <LimitedWish number={gainedWishes} />
                  <div>earned</div>
                </>
              )}

              {spentWishes > 0 && (
                <>
                  <div className="text-black/50">-</div>
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
      () => toFriendlyDate(new Date(bannerData.startDate)),
      [bannerData.startDate]
    );

    const displayEndDate = useMemo(
      () => toFriendlyDate(new Date(bannerData.endDate)),
      [bannerData.endDate]
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
            </div>
            <div className=" flex flex-row items-center text-sm text-white">
              {wishesAvailableLabel}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className=" px-2 md:px-6 flex flex-col">
          {FLAGS.WEAPON_BANNER && (
            <div className="text-xs italic text-white/50">
              Character Banners
            </div>
          )}
          {bannerData.characters.map((characterId) => {
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
              <div className="text-xs italic text-white/50">Weapon Banner</div>
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
                currentEpitomizedPath={
                  bannerConfiguration.weaponBanner.epitomizedPath
                }
                setEpitomizedPath={(weaponId: WeaponId) =>
                  setEpitomizedPath(id, weaponId)
                }
                currentMaxRefinement={
                  bannerConfiguration.weaponBanner.maxRefinement
                }
                setMaxRefinement={(value: number) =>
                  setWeaponBannerMaxRefinement(id, value)
                }
                _currentStrategy={bannerConfiguration.weaponBanner.strategy}
                _setStrategy={(strategy: "stop" | "continue") =>
                  setWeaponBannerStrategy(id, strategy)
                }
              />
            </>
          )}
          {isCurrentBanner && (
            <div className="flex flex-row justify-between w-full text-xs mt-2 text-white/40">
              <div className="italic">Current banner</div>
              <CheckboxWithLabel
                id={""}
                className="text-xs"
                label={"Exclude wishes earned this banner"}
                checked={accountStatusExcludeCurrentBannerPrimogemSources}
                onCheckedChange={
                  setAccountStatusExcludeCurrentBannerPrimogemSources
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

export default BannerCard;
