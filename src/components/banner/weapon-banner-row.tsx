import { useGenshinState } from "@/lib/mobx/genshin-context";
import { ApiWeapon, Priority, WeaponId } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { LimitedWish } from "../resource";
import { Input } from "../ui/input";

import WeaponIcon from "@/lib/components/weapon-icon";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CheckboxWithLabel } from "../ui/checkbox-with-label";

type WeaponBannerRowProps = {
  weapons: [ApiWeapon, ApiWeapon]; // Exactly 2 featured weapons
  currentWishesAllocated: number;
  setWishesAllocated: (value: number) => void;
  currentEpitomizedPath: WeaponId;
  setEpitomizedPath: (weaponId: WeaponId) => void;
  currentStrategy: "stop" | "continue";
  setStrategy: (strategy: "stop" | "continue") => void;
  currentPriority?: Priority; // For strategy mode
  setCurrentPriority?: (value: Priority) => void;
  availableWishes?: number; // For hint calculations
};

export const WeaponBannerRow = observer(
  ({
    weapons,
    currentWishesAllocated,
    setWishesAllocated,
    currentEpitomizedPath,
    setEpitomizedPath,
    currentStrategy,
    setStrategy,
    currentPriority,
    setCurrentPriority,
    availableWishes,
  }: WeaponBannerRowProps) => {
    const { mode, isLoading } = useGenshinState();

    const [weapon1, weapon2] = weapons;
    const targetWeapon =
      weapons.find((w) => w.Id === currentEpitomizedPath) || weapon1;
    const otherWeapon =
      weapons.find((w) => w.Id !== currentEpitomizedPath) || weapon2;

    const [hoveredWeaponId, setHoveredWeaponId] = useState("");
    const [chosenWeaponId, setChosenWeaponId] = useState("");

    return (
      <div className="flex flex-col gap-1 relative bg-void-3 p-3">
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        <div
          key={weapon1.Id}
          className="grid gap-2 items-center text-sm "
          style={{ gridTemplateColumns: "1fr auto auto" }}
        >
          <div className="flex items-center gap-4">
            {[weapon1, weapon2].map((w) => (
              <button
                key={w.Id}
                className={cn(
                  [hoveredWeaponId, chosenWeaponId].includes(w.Id)
                    ? "outline"
                    : "outline-none",
                  chosenWeaponId === w.Id
                    ? "outline-red-500"
                    : "outline-amber-300"
                )}
                onMouseEnter={(e) => setHoveredWeaponId(w.Id)}
                onMouseLeave={(e) => setHoveredWeaponId("")}
                onClick={(e) =>
                  setChosenWeaponId((prev) => (prev === w.Id ? "" : w.Id))
                }
              >
                <WeaponIcon id={w.Id} showName className="shrink-0" />
                {chosenWeaponId === w.Id
                  ? "Course charted"
                  : hoveredWeaponId === w.Id
                  ? "Chart course"
                  : ""}
              </button>
            ))}
          </div>
          <>
            {mode === "playground" && (
              <div className="flex flex-col">
                <div className="text-xs text-white text-right mr-4">
                  Spend up to
                </div>
                <Input
                  isLoading={isLoading}
                  id={`wishes-${weapon1.Id}`}
                  type="number"
                  min="0"
                  value={currentWishesAllocated}
                  onChange={(e) => setWishesAllocated(parseInt(e.target.value))}
                  unit={<LimitedWish />}
                  showPlusMinus={true}
                  width={"w-8"}
                />
              </div>
            )}
          </>
        </div>
        <CheckboxWithLabel
          id={""}
          label={
            "Obtain Fang of the Mountain King once Engulfing Lightning is obtained"
          }
          checked={true}
          onCheckedChange={() => {}}
        />{" "}
      </div>
    );
  }
);
