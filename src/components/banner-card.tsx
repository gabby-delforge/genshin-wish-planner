"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Banner, WantAllocation, WishAllocation } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCharacterRarityColor, getCharacterElementColor } from "@/lib/utils";

interface BannerCardProps {
  banner: Banner;
  onWishChange?: (
    bannerId: string | number,
    characterName: string,
    wishes: number
  ) => void;
  onPriorityChange?: (
    bannerId: string | number,
    characterName: string,
    priority: "must-have" | "want" | "nice-to-have" | "skip"
  ) => void;
  mode: "playground" | "strategy";
  wishAllocation: WishAllocation;
  wantAllocation: WantAllocation;
}

export default function BannerCard({
  banner,
  onWishChange,
  onPriorityChange,
  mode,
  wishAllocation,
  wantAllocation,
}: BannerCardProps) {
  return (
    <Card className="bg-[#1a1b2e]/80 border-[#4a4c72] overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#7b68ee] to-[#9370db]"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">
          <span className="text-[#f5d0a9]">Banner: {banner.name}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Available {banner.startDate} - {banner.endDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {banner.characters.map((character) => (
          <div
            key={character.name}
            className="grid grid-cols-5 gap-2 items-center"
          >
            <div className="col-span-2 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getCharacterElementColor(
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
                <p className="text-xs text-muted-foreground">
                  {character.rarity}★ {character.weaponType}
                </p>
              </div>
            </div>

            <div className="col-span-3">
              {mode === "playground" && onWishChange && (
                <div className="space-y-1">
                  <Label
                    htmlFor={`wishes-${banner.id}-${character.name}`}
                    className="text-xs"
                  >
                    Wishes to Spend
                  </Label>
                  <Input
                    id={`wishes-${banner.id}-${character.name}`}
                    type="number"
                    min="0"
                    value={wishAllocation[banner.id][character.name] || 0}
                    onChange={(e) =>
                      onWishChange(
                        banner.id,
                        character.id,
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    className="h-8 bg-[#2a2c42] border-[#4a4c72]"
                  />
                </div>
              )}

              {mode === "strategy" && onPriorityChange && (
                <div className="space-y-1">
                  <Label
                    htmlFor={`priority-${banner.id}-${character.name}`}
                    className="text-xs"
                  >
                    Priority
                  </Label>
                  <Select
                    value={wantAllocation[banner.id][character.name] || "skip"}
                    onValueChange={(value) =>
                      onPriorityChange(
                        banner.id,
                        character.name,
                        value as "must-have" | "want" | "nice-to-have" | "skip"
                      )
                    }
                  >
                    <SelectTrigger className="h-8 bg-[#2a2c42] border-[#4a4c72]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2c42] border-[#4a4c72]">
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
