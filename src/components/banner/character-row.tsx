import { ConstellationInput } from "@/app/panels/simulation/components/constellation-input";
import { PriorityDropdown } from "@/app/panels/simulation/components/priority-dropdown";
import { WishesInput } from "@/app/panels/simulation/components/wishes-input";
import CharacterIcon from "@/lib/components/character-icon";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { Desktop, Mobile } from "@/lib/responsive-design/responsive-context";
import { ApiCharacter, Priority } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { MaxLabel } from "./max-label";

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
    bannerId,
  }: CharacterRowProps) => {
    const { mode, isLoading, bannerConfiguration, availableWishes } =
      useGenshinState();

    const maxWishesCalculation = availableWishes[bannerId]
      ?.maxWishesPerCharacterOrWeapon[characterId] || {
      baseWishes: 0,
      starglitterWishes: 0,
    };

    return (
      <div
        key={character.Name}
        className="flex flex-col text-sm bg-void-3 px-4 py-6 relative items-end gap-6"
      >
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        <div className="flex items-center gap-4 col-span-2 self-start">
          <CharacterIcon id={characterId} showName className="shrink-0" />
        </div>

        <ConstellationInput
          isLoading={isLoading}
          characterId={character.Id}
          maxConstellation={currentMaxConstellation}
          setMaxConstellation={setMaxConstellation}
        />
        <>
          {mode === "playground" && (
            <div className="w-full flex flex-col gap-2">
              <WishesInput
                bannerId={bannerId}
                isLoading={isLoading}
                type="character"
                characterId={character.Id}
                numWishesAllocated={currentWishesAllocated}
                setNumWishesAllocated={setWishesAllocated}
                bannerConfig={bannerConfiguration[bannerId]}
              />
              <div className="flex self-center gap-0.5 items-center text-white text-xxs  bg-gold-1/20  rounded-md py-0.5 px-2 w-full">
                {maxWishesCalculation.baseWishes +
                  maxWishesCalculation.starglitterWishes >
                0 ? (
                  <MaxLabel
                    baseWishes={maxWishesCalculation.baseWishes}
                    starglitterWishes={maxWishesCalculation.starglitterWishes}
                  />
                ) : (
                  <>No wishes available to allocate.</>
                )}
              </div>
            </div>
          )}

          {mode === "strategy" && (
            <PriorityDropdown
              currentPriority={currentPriority}
              setCurrentPriority={setCurrentPriority}
            />
          )}
        </>
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
    bannerId,
  }: CharacterRowProps) => {
    const { mode, isLoading, bannerConfiguration } = useGenshinState();

    return (
      <div
        key={character.Name}
        className="grid gap-2 items-center text-sm bg-void-3 p-3 relative grid-cols-[1fr_auto_auto]"
      >
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        <div className="flex items-center gap-4 col-span-2 md:col-span-1">
          <CharacterIcon id={characterId} showName className="shrink-0" />
        </div>
        <div className="col-span-2 flex gap-6 justify-end">
          <ConstellationInput
            isLoading={isLoading}
            characterId={character.Id}
            maxConstellation={currentMaxConstellation}
            setMaxConstellation={setMaxConstellation}
          />
          <>
            {mode === "playground" && (
              <WishesInput
                bannerId={bannerId}
                isLoading={isLoading}
                type="character"
                characterId={character.Id}
                numWishesAllocated={currentWishesAllocated}
                setNumWishesAllocated={setWishesAllocated}
                bannerConfig={bannerConfiguration[bannerId]}
              />
            )}

            {mode === "strategy" && (
              <PriorityDropdown
                currentPriority={currentPriority}
                setCurrentPriority={setCurrentPriority}
              />
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
  bannerId: string;
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
