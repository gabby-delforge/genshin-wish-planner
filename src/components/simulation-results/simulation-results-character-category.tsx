import CharacterIcon from "@/lib/components/character-icon";
import { ApiCharacter, CharacterSuccessRate } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ProgressBar } from "../ui/progress-bar";

type SimulationResultsCharacterCategoryProps = {
  character: ApiCharacter;
  successRates: CharacterSuccessRate[];
};
export const SimulationResultsCharacterCategory = observer(
  ({ character, successRates }: SimulationResultsCharacterCategoryProps) => {
    const sorted = useMemo(() => {
      return successRates.sort((a, b) => a.constellation - b.constellation);
    }, []);
    return (
      <Card variant="light">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CharacterIcon id={character.Id} showName />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {sorted.map((s) => (
              <div
                key={`${s.characterId}${s.constellation}${s.successPercent}`}
                className="bg-void-1 rounded-md p-3 border border-void-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className={`text-sm font-medium `}>
                      {`C${s.constellation}`}
                    </span>
                  </div>
                  {s.successPercent === 1 ? (
                    <div className="text-sm font-medium text-yellow-400">
                      Guaranteed
                    </div>
                  ) : (
                    <div className="text-sm font-medium">
                      {(s.successPercent * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
                <ProgressBar percent={s.successPercent} />
                {/* <div className="text-sm text-muted-foreground mt-1">
                      Average wishes needed: {result.averageWishes}
                    </div> */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
);
