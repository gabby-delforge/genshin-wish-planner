import { InfoIcon } from "@/components/ui/info-icon";
import { Input } from "@/components/ui/input";
import { ApiCharacter } from "@/lib/types";
import { observer } from "mobx-react-lite";

type ConstellationInputProps = {
  isLoading: boolean;
  character: ApiCharacter;
  maxConstellation: number;
  setMaxConstellation: (c: number) => void;
};
export const ConstellationInput = observer(
  ({
    isLoading,
    character,
    maxConstellation,
    setMaxConstellation,
  }: ConstellationInputProps) => {
    return (
      <div className="flex flex-col mr-3">
        <div className="flex flex-row items-center gap-1 text-xs text-white text-right">
          Pull until
          <InfoIcon
            content={
              <div className="flex flex-col gap-2">
                <div>
                  Tells the simulator to stop pulling once this constellation is
                  reached, even if you have enough wishes to continue.
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
          value={maxConstellation}
          onChange={(e) => setMaxConstellation(parseInt(e.target.value))}
          unit={<div className="text-white/50 pl-1 flex-initial">C</div>}
          showPlusMinus={true}
          width={"w-8"}
        />
      </div>
    );
  }
);
