import { BannerInputBase } from "@/components/banner/banner-input-base";
import { InfoIcon } from "@/components/ui/info-icon";
import { Input } from "@/components/ui/input";
import { CharacterId, WeaponId } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

type RefinementInputProps = {
  isLoading: boolean;
  weaponId: WeaponId;
  maxRefinement: number;
  setMaxRefinement: (r: number) => void;
};
export const RefinementInput = observer(
  ({
    isLoading,
    weaponId,
    maxRefinement,
    setMaxRefinement,
  }: RefinementInputProps) => (
    <BaseConstellationOrRefinementInput
      isLoading={isLoading}
      type="weapon"
      id={weaponId}
      currValue={maxRefinement}
      setCurrValue={setMaxRefinement}
      onClickMax={() => setMaxRefinement(4)}
      onReset={() => setMaxRefinement(0)}
    />
  )
);

type ConstellationInputProps = {
  isLoading: boolean;
  characterId: CharacterId;
  maxConstellation: number;
  setMaxConstellation: (c: number) => void;
};
export const ConstellationInput = observer(
  ({
    isLoading,
    characterId,
    maxConstellation,
    setMaxConstellation,
  }: ConstellationInputProps) => (
    <BaseConstellationOrRefinementInput
      isLoading={isLoading}
      type="character"
      id={characterId}
      currValue={maxConstellation}
      setCurrValue={setMaxConstellation}
      onClickMax={() => setMaxConstellation(6)}
      onReset={() => setMaxConstellation(0)}
    />
  )
);
export type BaseConstellationOrRefinementInputProps = {
  type: "character" | "weapon";
  id: CharacterId | WeaponId;
  isLoading: boolean;
  currValue: number;
  setCurrValue: (v: number) => void;
  onClickMax: () => void;
  onReset: () => void;
};

const BaseConstellationOrRefinementInput = observer(
  ({
    type,
    id,
    isLoading,
    currValue,
    setCurrValue,
    onClickMax,
    onReset,
  }: BaseConstellationOrRefinementInputProps) => {
    const hintText = useMemo(() => {
      if (type === "character") {
        return (
          <>
            <div>
              Tells the simulator to stop pulling once this constellation is
              reached, even if you have enough wishes to continue.
            </div>
            <div>
              {`Assumes you don't have the character yet. If you have C0 and want C2, put C1 (which equals two copies).`}
            </div>
          </>
        );
      } else {
        return (
          <>
            <div>
              Tells the simulator to stop pulling once this refinement level is
              reached, even if you have enough wishes to continue.
            </div>
            <div>
              {`Assumes you don't have the weapon yet. If you have R1 and want R2, put R1 (which equals one copy).`}
            </div>
          </>
        );
      }
    }, [type]);

    return (
      <BannerInputBase
        title={
          <>
            Pull until
            <InfoIcon
              content={<div className="flex flex-col gap-2">{hintText}</div>}
              contentMaxWidth={400}
              className="text-white/50"
            />
          </>
        }
        isLoading={isLoading}
        showMaxButton={false}
        showResetButton={false}
        onClickMax={onClickMax}
        onClickReset={onReset}
      >
        <Input
          isLoading={isLoading}
          id={`constellation-input-${id}`}
          type="number"
          min="0"
          value={currValue}
          onChange={(e) => setCurrValue(parseInt(e.target.value))}
          unit={
            <div className="text-white/50 pl-1 flex-initial">
              {type === "character" ? "C" : "R"}
            </div>
          }
          showPlusMinus={true}
          width={"w-10"}
        />
      </BannerInputBase>
    );
  }
);
