import CharacterIcon from "@/lib/components/character-icon";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { Desktop, Mobile } from "@/lib/responsive-design/responsive-context";
import {
  ApiCharacter,
  DEFAULT_PRIORITY,
  Priority,
  PriorityTextToPriority,
  PriorityValueToText,
} from "@/lib/types";
import { observer } from "mobx-react-lite";
import { LimitedWish } from "../resource";
import { InfoIcon } from "../ui/info-icon";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CharacterRowMobile = observer(
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
        className="grid items-center gap-y-2 text-sm bg-void-3 p-4 relative grid-cols-2"
      >
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        <div className="flex items-center gap-4 col-span-2">
          <CharacterIcon id={characterId} showName className="shrink-0" />
        </div>

        <div className="col-span-2 gap-4 flex justify-end">
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center gap-1 text-xs text-white text-center">
              Pull until
              <InfoIcon
                content={
                  <div className="flex flex-col gap-2">
                    <div>
                      Tells the simulator to stop pulling once this
                      constellation is reached, even if you have enough wishes
                      to continue.
                    </div>
                    <div>
                      {`Assumes you don't have the character yet. If you have C0 and want C2, put C1 (which equals two copies).`}
                    </div>
                  </div>
                }
                contentMaxWidth={400}
                className="text-white/50"
              />
            </div>
            <Input
              isLoading={isLoading}
              id={`constellation-${character.Id}`}
              type="number"
              min="0"
              value={currentMaxConstellation}
              onChange={(e) => setMaxConstellation(parseInt(e.target.value))}
              unit={<div className="text-white/50 pl-1 flex-initial">C</div>}
              showPlusMinus={true}
              width={"w-8"}
            />
          </div>

          <>
            {mode === "playground" && (
              <div className="flex flex-col items-center">
                <div className="text-xs text-white text-center mr-4">
                  Spend up to
                </div>
                <Input
                  isLoading={isLoading}
                  id={`wishes-${character.Id}`}
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

            {mode === "strategy" && (
              <div className="space-y-1 flex flex-col items-center">
                <div className="text-xs text-white text-center mr-4">
                  Priority
                </div>
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
          </>
        </div>
      </div>
    );
  }
);

const CharacterRowDesktop = observer(
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
        className="grid gap-2 items-center text-sm bg-void-3 p-3 relative grid-cols-[1fr_auto_auto]"
      >
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        <div className="flex items-center gap-4 col-span-2 md:col-span-1">
          <CharacterIcon id={characterId} showName className="shrink-0" />
        </div>

        <div className="col-span-2 flex justify-end">
          <div className="flex flex-col mr-3 items-end">
            <div className="flex flex-row items-center gap-1 text-xs text-white text-right">
              Pull until
              <InfoIcon
                content={
                  <div className="flex flex-col gap-2">
                    <div>
                      Tells the simulator to stop pulling once this
                      constellation is reached, even if you have enough wishes
                      to continue.
                    </div>
                    <div>
                      {`Assumes you don't have the character yet. If you have C0 and want C2, put C1 (which equals two copies).`}
                    </div>
                  </div>
                }
                contentMaxWidth={400}
                className="text-white/50"
              />
            </div>
            <Input
              isLoading={isLoading}
              id={`constellation-${character.Id}`}
              type="number"
              min="0"
              value={currentMaxConstellation}
              onChange={(e) => setMaxConstellation(parseInt(e.target.value))}
              unit={<div className="text-white/50 pl-1 flex-initial">C</div>}
              showPlusMinus={true}
              width={"w-8"}
            />
          </div>

          <>
            {mode === "playground" && (
              <div className="flex flex-col items-end ">
                <div className="text-xs text-white text-right mr-4">
                  Spend up to
                </div>
                <Input
                  isLoading={isLoading}
                  id={`wishes-${character.Id}`}
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

            {mode === "strategy" && (
              <div className="space-y-1 flex flex-col items-end ">
                <div className="text-xs text-white text-right mr-4">
                  Priority
                </div>
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
          </>
        </div>
      </div>
    );
  }
);

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

export const CharacterRow = observer((props: CharacterRowProps) => {
  return (
    <>
      <Mobile>
        <CharacterRowMobile {...props} />
      </Mobile>
      <Desktop>
        <CharacterRowDesktop {...props} />
      </Desktop>
    </>
  );
});
