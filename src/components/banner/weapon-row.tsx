import WeaponIcon from "@/lib/components/weapon-icon";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import {
  ApiWeapon,
  DEFAULT_PRIORITY,
  Priority,
  PriorityTextToPriority,
  PriorityValueToText,
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

type WeaponRowProps = {
  weaponId: string;
  weapon: ApiWeapon;
  currentWishesAllocated: number;
  setWishesAllocated: (value: number) => void;
  currentPriority: number;
  setCurrentPriority: (value: Priority) => void;
};
export const WeaponRow = observer(
  ({
    weaponId,
    weapon,

    currentWishesAllocated,
    setWishesAllocated,
    currentPriority,
    setCurrentPriority,
  }: WeaponRowProps) => {
    const { mode, isLoading } = useGenshinState();
    return (
      <div
        key={weapon.Name}
        className="grid grid-cols-4 gap-1 items-center text-sm"
      >
        <div className="col-span-2 flex items-center gap-2">
          <WeaponIcon id={weaponId} />
          <div>
            <p
              className={`text-sm font-medium ${getCharacterRarityColor(
                weapon.Quality || 0
              )}`}
            >
              {weapon.Name}
            </p>
            <p className="text-sm text-muted-foreground">{weapon.Quality}★</p>
          </div>
        </div>
        <div className=""></div>{" "}
        {/* Empty div for spacing consistency with characters */}
        <div className="">
          {mode === "playground" && (
            <div className="flex flex-col">
              <div className="text-sm text-gray-400/70">Spend</div>
              <Input
                isLoading={isLoading}
                id={`wishes-${weapon.Id}`}
                type="number"
                min="0"
                value={currentWishesAllocated}
                onChange={(e) => setWishesAllocated(parseInt(e.target.value))}
                unit={<LimitedWish />}
                showPlusMinus={true}
              />
            </div>
          )}

          {mode === "strategy" && (
            <>
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
                  <SelectItem value="1" className="text-[#ff6b6b]">
                    {PriorityValueToText[1]}
                  </SelectItem>
                  <SelectItem value="2" className="text-[#feca57]">
                    {PriorityValueToText[2]}
                  </SelectItem>
                  <SelectItem value="3" className="text-[#1dd1a1]">
                    {PriorityValueToText[3]}
                  </SelectItem>
                  <SelectItem
                    value={DEFAULT_PRIORITY.toString()}
                    className="text-muted-foreground"
                  >
                    {PriorityValueToText[DEFAULT_PRIORITY]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>
    );
  }
);
