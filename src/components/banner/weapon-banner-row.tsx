import WeaponIcon from "@/lib/components/weapon-icon";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import {
  ApiWeapon,
  DEFAULT_PRIORITY,
  Priority,
  PriorityTextToPriority,
  PriorityValueToText,
  WeaponId,
} from "@/lib/types";
import { getCharacterRarityColor } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { LimitedWish } from "../resource";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

    // Helper function to get hint text and color
    const getHint = () => {
      if (currentWishesAllocated === 0) return null;

      if (currentStrategy === "stop") {
        if (currentWishesAllocated < 80) {
          return {
            text: `${
              80 - currentWishesAllocated
            } more wishes recommended to guarantee ${targetWeapon.Name}`,
            color: "text-yellow-400",
          };
        } else if (
          currentWishesAllocated >= 80 &&
          currentWishesAllocated < 160
        ) {
          return {
            text: `Good chance to get ${targetWeapon.Name}`,
            color: "text-green-400",
          };
        } else {
          return {
            text: `Excellent chance to get ${targetWeapon.Name}`,
            color: "text-green-400",
          };
        }
      } else {
        if (currentWishesAllocated < 160) {
          return {
            text: `${
              160 - currentWishesAllocated
            } more wishes recommended for both weapons (path switching resets fate points)`,
            color: "text-yellow-400",
          };
        } else if (currentWishesAllocated < 240) {
          return {
            text: `May need up to ${
              240 - currentWishesAllocated
            } more wishes in worst case for both weapons`,
            color: "text-yellow-400",
          };
        } else {
          return {
            text: `Should be enough to guarantee both weapons`,
            color: "text-green-400",
          };
        }
      }
    };

    return (
      <div className="space-y-4">
        {/* Weapon showcase */}

        {/* Strategy sentence */}
        <div className="p-4">
          <div className="text-sm flex flex-col items-center gap-2 leading-relaxed">
            <div className="flex flex-row gap-1 items-center">
              <span>Allocate</span>

              {mode === "playground" && (
                <Input
                  isLoading={isLoading}
                  type="number"
                  min="0"
                  max={availableWishes}
                  value={currentWishesAllocated}
                  onChange={(e) =>
                    setWishesAllocated(parseInt(e.target.value) || 0)
                  }
                  className="w-16"
                  showPlusMinus={true}
                  unit={<LimitedWish />}
                />
              )}

              {mode === "strategy" && (
                <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/40 rounded text-sm font-medium">
                  {currentWishesAllocated}
                </span>
              )}

              <span>{`wishes to the weapon banner${
                currentWishesAllocated > 0 ? ", chart path for" : "."
              }`}</span>
            </div>

            {currentWishesAllocated > 0 && (
              <>
                <div className="flex justify-center gap-8 p-4 bg-white/5 rounded-lg">
                  {weapons.map((weapon) => (
                    <div key={weapon.Id} className="text-center">
                      <WeaponIcon
                        id={weapon.Id}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <p
                        className={`text-sm font-medium ${getCharacterRarityColor(
                          weapon.Quality || 0
                        )}`}
                      >
                        {weapon.Name}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-row items-center gap-1">
                  <span>and</span>
                  <Select
                    value={currentStrategy}
                    onValueChange={(value: "stop" | "continue") =>
                      setStrategy(value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-auto h-8 bg-void-1 border-void-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-void-1 border-void-2">
                      <SelectItem value="stop">stop once obtained</SelectItem>
                      <SelectItem value="continue">
                        continue for {otherWeapon.Name}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Strategy mode priority selector */}
        {mode === "strategy" &&
          setCurrentPriority &&
          currentPriority !== undefined && (
            <div className="grid grid-cols-4 gap-1 items-center text-sm">
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {weapons.map((weapon) => (
                    <WeaponIcon
                      key={weapon.Id}
                      id={weapon.Id}
                      className="w-6 h-6 border border-void-2 rounded"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-400">
                    Weapon Banner
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {targetWeapon.Name}
                    {currentStrategy === "continue" && ` + ${otherWeapon.Name}`}
                  </p>
                </div>
              </div>
              <div></div>
              <div>
                <div className="text-sm text-gray-400/70">Priority</div>
                <Select
                  value={PriorityValueToText[currentPriority]}
                  onValueChange={(value: string) =>
                    setCurrentPriority(PriorityTextToPriority[value])
                  }
                >
                  <SelectTrigger className="bg-void-1 border-void-2">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-void-1 border-void-2">
                    <SelectItem value="Must Have" className="text-[#ff6b6b]">
                      {PriorityValueToText[1 as Priority]}
                    </SelectItem>
                    <SelectItem value="Want" className="text-[#feca57]">
                      {PriorityValueToText[2 as Priority]}
                    </SelectItem>
                    <SelectItem value="Nice to Have" className="text-[#1dd1a1]">
                      {PriorityValueToText[3 as Priority]}
                    </SelectItem>
                    <SelectItem value="Skip" className="text-muted-foreground">
                      {PriorityValueToText[DEFAULT_PRIORITY]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
      </div>
    );
  }
);
