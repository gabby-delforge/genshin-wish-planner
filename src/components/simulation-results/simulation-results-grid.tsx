import { API_CHARACTERS } from "@/lib/data";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { CharacterSuccessRate } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { SimulationResultsCharacterCategory } from "./simulation-results-character-category";

export const SimulationResultsGrid = observer(() => {
  const { playgroundSimulationResults } = useGenshinState();
  const results = playgroundSimulationResults?.characterSuccessRates;

  const simulationResultsByCharacter = useMemo(() => {
    if (!results) return {};
    return results.reduce(
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
  }, [playgroundSimulationResults]);

  // Show empty state if no characters were obtained / no wishes were allocated
  if (!simulationResultsByCharacter || !results || results.length === 0) {
    return (
      <div className="bg-void-1 rounded-md p-4 text-center">
        <p className="text-muted-foreground text-sm">
          No characters obtained. Allocate enough wishes to banners to see
          success rates.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {Object.keys(simulationResultsByCharacter).map((k) => {
        const simResults = simulationResultsByCharacter[k];
        const character = API_CHARACTERS[k];
        if (!character) return null;
        return (
          <SimulationResultsCharacterCategory
            key={k}
            successRates={simResults}
            character={character}
          />
        );
      })}
    </div>
  );
  // return (
  //   <div className="grid gap-2">
  //     {results &&
  //       results.length > 0 &&
  //       results.map((result, index) => (
  //         <div
  //           key={index}
  //           className="bg-void-1 rounded-md p-3 border border-void-2"
  //         >
  //           <div className="flex justify-between items-center mb-2">
  //             <div>
  //               <BannerVersion version={result.versionId} />
  //               <span
  //                 className={`text-sm font-medium ${getCharacterRarityColor(
  //                   5
  //                 )}`}
  //               >
  //                 {`${
  //                   result.characterId.charAt(0).toUpperCase() +
  //                   result.characterId.slice(1)
  //                 } (C${result.constellation} or higher)`}
  //               </span>
  //             </div>
  //             {result.successPercent === 1 ? (
  //               <div className="text-sm font-medium text-yellow-400">
  //                 Guaranteed
  //               </div>
  //             ) : (
  //               <div className="text-sm font-medium">
  //                 {(result.successPercent * 100).toFixed(1)}%
  //               </div>
  //             )}
  //           </div>
  //           <ProgressBar percent={result.successPercent} />
  //           {/* <div className="text-sm text-muted-foreground mt-1">
  //           Average wishes needed: {result.averageWishes}
  //         </div> */}
  //         </div>
  //       ))}
  //   </div>
  // );
});
