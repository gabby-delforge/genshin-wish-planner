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
import { CheckboxWithLabel } from "../ui/checkbox-with-label";
import { Separator } from "../ui/separator";

import { LimitedWish } from "../resource";
import { BannerVersion } from "./banner-version";
import { CharacterRow } from "./character-row";
import { WeaponBannerRow } from "./weapon-banner-row";
import { WishesAvailableTooltip } from "./wishes-available-tooltip";

export type BannerCardProps = {
  id: BannerId;
  bannerData: ApiBanner;
  bannerConfiguration: BannerConfiguration;
  isCurrentBanner: boolean;
  isOldBanner: boolean;
  estimatedWishesEarned: number;
};

const BannerCard = observer(
  ({
    id,
    bannerData,
    bannerConfiguration,
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
      availableWishes,
    } = useGenshinState();

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
              label: isCurrentBanner ? "in account" : "leftover",
              amount: startingWishes,
            },
            { label: "earned", amount: earnedWishes },
            {
              label: "spent",
              amount: 0 - (wishesSpentOnCharacters + wishesSpentOnWeapons),
            },
            { label: "from Starglitter", amount: starglitterWishes },
          ]}
        >
          <div
            className={cn(
              "flex items-center gap-1 text-sm",
              endingWishes < 0 ? "text-red-300" : "text-white"
            )}
          >
            <LimitedWish number={endingWishes} />
            available
          </div>
        </WishesAvailableTooltip>
      );
    }, [availableWishes, estimatedWishesEarned, id, bannerConfiguration]);

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
                bannerId={id}
                bannerWishBreakdown={availableWishes[id]}
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
