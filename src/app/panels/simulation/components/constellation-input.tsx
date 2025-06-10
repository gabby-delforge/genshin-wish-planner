import { BannerInputBase } from "@/components/banner/banner-input-base";
import { InfoIcon } from "@/components/ui/info-icon";
import { Input } from "@/components/ui/input";
import { CharacterId, WeaponId } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

type ConstellationInputProps = {
  isLoading: boolean;
  type: "character" | "weapon";
  characterOrWeaponId: CharacterId | WeaponId;
  maxConstellation: number;
  setMaxConstellation: (c: number) => void;
};
export const ConstellationInput = observer(
  ({
    isLoading,
    type,
    characterOrWeaponId,
    maxConstellation,
    setMaxConstellation,
  }: ConstellationInputProps) => {
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
        onClickMax={() => setMaxConstellation(6)}
        onClickReset={() => setMaxConstellation(0)}
      >
        <Input
          isLoading={isLoading}
          id={`constellation-${characterOrWeaponId}`}
          type="number"
          min="0"
          value={maxConstellation}
          onChange={(e) => setMaxConstellation(parseInt(e.target.value))}
          unit={<div className="text-white/50 pl-1 flex-initial">C</div>}
          showPlusMinus={true}
          width={"w-10"}
        />
      </BannerInputBase>
    );
  }
);
