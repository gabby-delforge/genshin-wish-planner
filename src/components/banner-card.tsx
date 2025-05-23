"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CharacterIcon from "@/lib/components/CharacterIcon";
import { useGenshinState } from "@/lib/context/genshin-context";
import {
  DEFAULT_PRIORITY,
  PriorityValueToText,
  type AppMode,
  type Banner,
  type BannerAllocation,
  type Priority,
  type VersionId,
} from "@/lib/types";
import { getCharacterRarityColor, isCurrentBanner } from "@/lib/utils";
import { useMemo } from "react";
import { BannerVersion } from "./banner-version";
import { LimitedWish } from "./resource";
import { Pill } from "./ui/pill";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
interface BannerCardProps {
  banner: Banner;
  mode: AppMode;
  allocation: BannerAllocation;
  availableWishes: Record<VersionId, number>;
  estimatedNewWishesPerBanner: number;
  updateBannerConfiguration: (
    bannerId: VersionId,
    newAllocation: BannerAllocation
  ) => void;
}

export default function BannerCard({
  banner,
  mode,
  allocation,
  availableWishes,
  estimatedNewWishesPerBanner,
  updateBannerConfiguration,
}: BannerCardProps) {
  const { isLoading, accountStatus } = useGenshinState();
  const wishesAvailable = useMemo(() => {
    const totalWishes = availableWishes?.[banner.id] || 0;

    // TODO: Add a tooltip that explains how totalWishes was calculated
    const gainedWishes =
      isCurrentBanner(banner) &&
      accountStatus.excludeCurrentBannerPrimogemSources
        ? 0
        : estimatedNewWishesPerBanner;
    // This represents the wishes the user started with
    let spentWishes = 0;
    for (const alloc of Object.values(allocation)) {
      spentWishes += alloc.wishesAllocated;
    }
    // totalWishes = earned + leftover - spent
    // leftover = spent + totalWishes - earned
    const leftover = spentWishes - gainedWishes + totalWishes;

    return (
      <TooltipProvider>
        <Tooltip>
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
  }, [availableWishes, estimatedNewWishesPerBanner, banner.id]);

  const priorityStringToValueRepresentation = (priority: string): Priority => {
    return Object.entries(PriorityValueToText).find(
      ([, value]) => value === priority
    )?.[0] as unknown as Priority;
  };

  const isCurrent = useMemo(() => isCurrentBanner(banner), [banner]);

  return (
    <Card className="bg-bg-dark/80 border-void-2 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#7b68ee] to-[#9370db]"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex justify-between">
          <div className="flex flex-row gap-1">
            <BannerVersion version={banner.version} />
            {isCurrent && <Pill text="Current banner" />}
          </div>
          <span className="text-sm text-white">{wishesAvailable}</span>
        </CardTitle>
        <p className="text-sm text-white opacity-50">
          {banner.startDate} - {banner.endDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {banner.characters.map((character) => (
          <div
            key={character.name}
            className="grid grid-cols-4 gap-1 items-center text-sm"
          >
            <>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </>
            <div className="col-span-2 flex items-center gap-2">
              <CharacterIcon name={character.name} />
              <div>
                <p
                  className={`text-sm font-medium ${getCharacterRarityColor(
                    character.rarity
                  )}`}
                >
                  {character.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {character.rarity}★ {character.weaponType}
                </p>
              </div>
            </div>

            <div className="">
              {mode === "playground" &&
                updateBannerConfiguration &&
                allocation && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400/70">
                      Wishes allocated
                    </div>
                    <Input
                      isLoading={isLoading}
                      id={`wishes-${banner.id}-${character.id}`}
                      type="number"
                      min="0"
                      value={allocation[character.id]?.wishesAllocated || 0}
                      onChange={(e) =>
                        updateBannerConfiguration(banner.id, {
                          ...allocation,
                          [character.id]: {
                            ...allocation[character.id],
                            wishesAllocated:
                              Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      unit={<LimitedWish />}
                      showPlusMinus={true}
                    />
                  </div>
                )}

              {mode === "strategy" && allocation && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-400/70">Priority</div>
                  <Select
                    value={(
                      allocation[character.id]?.pullPriority || DEFAULT_PRIORITY
                    ).toString()}
                    onValueChange={(value: string) =>
                      updateBannerConfiguration(banner.id, {
                        ...allocation,
                        [character.id]: {
                          ...allocation[character.id],
                          pullPriority:
                            priorityStringToValueRepresentation(value),
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 bg-void-1 border-void-2">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-void-1 border-void-2">
                      <SelectItem value="3" className="text-[#ff6b6b]">
                        Must Have
                      </SelectItem>
                      <SelectItem value="2" className="text-[#feca57]">
                        Want
                      </SelectItem>
                      <SelectItem value="1" className="text-[#1dd1a1]">
                        Nice to Have
                      </SelectItem>
                      <SelectItem
                        value={DEFAULT_PRIORITY.toString()}
                        className="text-muted-foreground"
                      >
                        Skip
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-400/70">Max constellation</div>
              <Select
                value={`C${allocation[character.id]?.maxConstellation || 0}`}
                onValueChange={(value) =>
                  updateBannerConfiguration(banner.id, {
                    ...allocation,
                    [character.id]: {
                      ...allocation[character.id],
                      maxConstellation: Number(value.slice(1)),
                    },
                  })
                }
              >
                <SelectTrigger className="h-8 bg-void-1 border-void-2">
                  <SelectValue placeholder="C0" />
                </SelectTrigger>
                <SelectContent className="bg-void-1 border-void-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <SelectItem
                      key={`C${i}`}
                      value={`C${i}`}
                      className="text-white"
                    >
                      C{i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
