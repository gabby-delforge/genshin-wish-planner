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
import {
  DEFAULT_PRIORITY,
  PriorityValueToText,
  type AppMode,
  type Banner,
  type BannerAllocation,
  type Priority,
  type VersionId,
} from "@/lib/types";
import { getCharacterElementColor, getCharacterRarityColor } from "@/lib/utils";
import { useMemo } from "react";
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
  const wishesAvailable = useMemo(() => {
    const totalWishes = availableWishes?.[banner.id] || 0;
    const gainedWishes = estimatedNewWishesPerBanner;
    const totalMinusGained = totalWishes - gainedWishes;

    return (
      <span className="text-sm text-white opacity-50">
        <span className="font-bold">{totalWishes}</span> wishes available{" "}
        {estimatedNewWishesPerBanner > 0 ? (
          <span>
            {`(${totalMinusGained}+`}
            <span className="text-lime-300">{estimatedNewWishesPerBanner}</span>
            )
          </span>
        ) : (
          ""
        )}
      </span>
    );
  }, [availableWishes, estimatedNewWishesPerBanner, banner.id]);

  const priorityToStringRepresentation = (priority: Priority): string => {
    return PriorityValueToText[priority];
  };

  const priorityStringToValueRepresentation = (priority: string): Priority => {
    return Object.entries(PriorityValueToText).find(
      ([, value]) => value === priority
    )?.[0] as unknown as Priority;
  };

  return (
    <Card className="bg-bg-dark/80 border-void-2 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#7b68ee] to-[#9370db]"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex justify-between">
          <span className="text-gold-1">Banner: {banner.name}</span>
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
              <div>{mode === "playground" ? "Wishes" : "Priority"}</div>
              <div>Stop at</div>
            </>
            <div className="col-span-2 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getCharacterElementColor(
                  character.element
                )}`}
              >
                {character.element.charAt(0)}
              </div>
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
                    <Input
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
                      className="h-8 bg-bg-dark-2 border-void-2"
                    />
                  </div>
                )}

              {mode === "strategy" && allocation && (
                <div className="space-y-1">
                  <Select
                    value={priorityToStringRepresentation(
                      allocation[character.id]?.pullPriority || DEFAULT_PRIORITY
                    )}
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
                    <SelectTrigger className="h-8 bg-bg-dark-2 border-void-2">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-dark-2 border-void-2">
                      <SelectItem value="must-have" className="text-[#ff6b6b]">
                        Must Have
                      </SelectItem>
                      <SelectItem value="want" className="text-[#feca57]">
                        Want
                      </SelectItem>
                      <SelectItem
                        value="nice-to-have"
                        className="text-[#1dd1a1]"
                      >
                        Nice to Have
                      </SelectItem>
                      <SelectItem
                        value="skip"
                        className="text-muted-foreground"
                      >
                        Skip
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="">
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
                <SelectTrigger className="h-8 bg-bg-dark-2 border-void-2">
                  <SelectValue placeholder="C0" />
                </SelectTrigger>
                <SelectContent className="bg-bg-dark-2 border-void-2">
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
