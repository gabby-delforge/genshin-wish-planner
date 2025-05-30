import CharacterIcon from "@/lib/components/CharacterIcon";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import {
  ApiCharacter,
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

type CharacterRowProps = {
  characterId: string;
  character: ApiCharacter;
  currentMaxConstellation: number;
  setMaxConstellation: (value: number) => void;
  currentWishesAllocated: number;
  setWishesAllocated: (value: number) => void;
  currentPriority: number;
  setCurrentPriority: (value: Priority) => void;
};
export const CharacterRow = observer(
  ({
    characterId,
    character,
    currentMaxConstellation,
    setMaxConstellation,
    currentWishesAllocated,
    setWishesAllocated,
    currentPriority,
    setCurrentPriority,
  }: CharacterRowProps) => {
    const { mode, isLoading } = useGenshinState();
    return (
      <div
        key={character.Name}
        className="grid grid-cols-4 gap-2 items-center text-sm"
      >
        <div className="col-span-2 flex items-center gap-2">
          <CharacterIcon id={characterId} />
          <div>
            <p
              className={`text-sm font-medium ${getCharacterRarityColor(
                character.Quality || 0
              )}`}
            >
              {character.Name}
            </p>
            <p className="text-sm text-muted-foreground">
              {character.Quality}★ {character.Weapon}
            </p>
          </div>
        </div>

        <div className="flex flex-col mr-3">
          <div className="text-xs text-gray-400/70">Pull until</div>
          <Select
            value={`C${currentMaxConstellation}`}
            onValueChange={(value: string) =>
              setMaxConstellation(parseInt(value))
            }
          >
            <SelectTrigger className="h-7 bg-void-1 border-void-2">
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

        <div className="">
          {mode === "playground" && (
            <div className="flex flex-col">
              <div className="text-xs text-gray-400/70">Spend</div>
              <Input
                isLoading={isLoading}
                id={`wishes-${character.Id}`}
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
            <div className="space-y-1">
              <div className="text-xs text-gray-400/70">Priority</div>
              <Select
                value={PriorityValueToText[currentPriority]}
                onValueChange={(value: string) =>
                  setCurrentPriority(PriorityTextToPriority[value])
                }
              >
                <SelectTrigger className=" bg-void-1 border-void-2">
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
            </div>
          )}
        </div>
      </div>
    );
  }
);
