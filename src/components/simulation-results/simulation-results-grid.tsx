import { API_CHARACTERS, API_WEAPONS } from "@/lib/data";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { CharacterSuccessRate, WeaponSuccessRate } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { SimulationResultsCharacterCategory } from "./simulation-results-character-category";
import { SimulationResultsWeaponCategory } from "./simulation-results-weapon-category";

export const SimulationResultsGrid = observer(() => {
  const { playgroundSimulationResults } = useGenshinState();
  const characterResults = playgroundSimulationResults?.characterSuccessRates;
  const weaponResults = playgroundSimulationResults?.weaponSuccessRates;

  const simulationResultsByCharacter = useMemo(() => {
    if (!characterResults) return {};
    return characterResults.reduce(
      (
        acc: Record<string, CharacterSuccessRate[]>,
        curr: CharacterSuccessRate
      ) => {
        if (!acc[curr.characterId]) acc[curr.characterId] = [];
        acc[curr.characterId].push(curr);
        return acc;
      },
      {} as Record<string, CharacterSuccessRate[]>
    );
  }, [characterResults]);

  const simulationResultsByWeapon = useMemo(() => {
    if (!weaponResults) return {};
    return weaponResults.reduce(
      (acc: Record<string, WeaponSuccessRate[]>, curr: WeaponSuccessRate) => {
        if (!acc[curr.weaponId]) acc[curr.weaponId] = [];
        acc[curr.weaponId].push(curr);
        return acc;
      },
      {} as Record<string, WeaponSuccessRate[]>
    );
  }, [weaponResults]);

  // Show empty state if no characters or weapons were obtained / no wishes were allocated
  const hasCharacterResults =
    simulationResultsByCharacter &&
    Object.keys(simulationResultsByCharacter).length > 0;
  const hasWeaponResults =
    simulationResultsByWeapon &&
    Object.keys(simulationResultsByWeapon).length > 0;

  if (!hasCharacterResults && !hasWeaponResults) {
    return (
      <div className="bg-void-1 rounded-md p-4 text-center">
        <p className="text-muted-foreground text-sm">
          No characters or weapons obtained. Allocate enough wishes to banners
          to see success rates.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Character Results */}
      {hasCharacterResults &&
        Object.keys(simulationResultsByCharacter).map((k) => {
          const simResults = simulationResultsByCharacter[k];
          const character = API_CHARACTERS[k];
          if (!character) return null;
          return (
            <SimulationResultsCharacterCategory
              key={`char-${k}`}
              successRates={simResults}
              character={character}
            />
          );
        })}

      {/* Weapon Results */}
      {hasWeaponResults &&
        Object.keys(simulationResultsByWeapon).map((k) => {
          const simResults = simulationResultsByWeapon[k];
          const weapon = API_WEAPONS[k];
          if (!weapon) return null;
          return (
            <SimulationResultsWeaponCategory
              key={`weapon-${k}`}
              successRates={simResults}
              weapon={weapon}
            />
          );
        })}
    </div>
  );
});
