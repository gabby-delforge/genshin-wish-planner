import CharacterIcon from "@/lib/components/character-icon";
import { ApiBanner, BannerOutcome, CharacterOutcome } from "@/lib/types";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

type ProcessedScenario = {
  characterResults: CharacterOutcome[];
  hasAnySuccess: boolean;
  resultType: "success" | "missed" | "standard5star" | "skipped" | "other";
};

type ScenarioCellProps = {
  bannerOutcome?: BannerOutcome;
  banner: ApiBanner;
};

type ProcessedScenarioCellProps = {
  processedScenario: ProcessedScenario;
};

const ScenarioCellDesktop = observer(
  ({ processedScenario }: ProcessedScenarioCellProps) => {
    const { characterResults, hasAnySuccess, resultType } = processedScenario;

    const { displayContent, styleClasses } = useMemo(() => {
      const obtainedCharacters = characterResults.filter(
        (char) => char.obtained
      );

      // Determine what to display
      let content;
      if (obtainedCharacters.length === 2) {
        // Both characters obtained
        content = (
          <div className="flex flex-col gap-1">
            {obtainedCharacters.map((char, index) => (
              <div key={index} className="flex flex-row items-center gap-1">
                <CharacterIcon id={char.characterId} showName className="" />
                <span className="text-xs opacity-75">
                  (C{char.constellation})
                </span>
              </div>
            ))}
          </div>
        );
      } else if (obtainedCharacters.length === 1) {
        // Only one character obtained
        const char = obtainedCharacters[0];
        content = (
          <div className="flex flex-row items-center gap-1">
            <CharacterIcon id={char.characterId} showName />
            <span className="text-xs opacity-75">(C{char.constellation})</span>
          </div>
        );
      } else {
        // No characters obtained - determine what to show
        const missedCharacters = characterResults.filter(
          (char) => char.wishesUsed > 0
        );
        if (missedCharacters.length > 0) {
          content = (
            <div className="flex flex-col gap-1">
              {missedCharacters.map((char) => (
                <div
                  key={char.characterId}
                  className="flex relative flex-row items-center gap-2"
                >
                  <CharacterIcon
                    id={char.characterId}
                    showName
                    className="opacity-50 "
                  />
                  <div className="absolute text-xs bottom-0 right-0 font-medium italic opacity-80">
                    Missed
                  </div>
                </div>
              ))}
            </div>
          );
        } else {
          content = <div className="text-xs font-medium italic">Skipped</div>;
        }
      }

      // Determine styling based on result type
      let bgClass, borderClass, textClass;

      if (resultType === "success") {
        bgClass = "bg-yellow-1/30";
        borderClass = "border-gold-1";
        textClass = "text-yellow-1";
      } else if (resultType === "missed") {
        bgClass = "bg-[#ff6b6b]/20";
        borderClass = "border-[#ff6b6b]/40";
        textClass = "text-white";
      } else if (resultType === "standard5star") {
        bgClass = "bg-gold-1/20";
        borderClass = "border-gold-1/40";
        textClass = "text-gold-1";
      } else if (resultType === "skipped") {
        bgClass = "bg-bg-dark-2/20";
        borderClass = "border-void-2";
        textClass = "text-white/30";
      } else {
        bgClass = "bg-bg-dark-2/20";
        borderClass = "border-void-2";
        textClass = "text-[#1dd1a1]";
      }

      return {
        displayContent: content,
        styleClasses: {
          container: `p-2 rounded-md text-center h-full flex flex-col items-center justify-center gap-2 ${bgClass} border ${borderClass}`,
          text: textClass,
        },
      };
    }, [characterResults, hasAnySuccess, resultType]);

    return (
      <div className={styleClasses.container}>
        <div className={styleClasses.text}>{displayContent}</div>
      </div>
    );
  }
);

const ScenarioCellMobile = observer(
  ({ processedScenario }: ProcessedScenarioCellProps) => {
    const { characterResults, hasAnySuccess, resultType } = processedScenario;

    const { displayContent, styleClasses } = useMemo(() => {
      const obtainedCharacters = characterResults.filter(
        (char) => char.obtained
      );

      // Determine what to display
      let content;
      if (obtainedCharacters.length === 2) {
        // Both characters obtained
        content = (
          <div className="flex flex-row-reverse m-auto h-full w-full">
            {obtainedCharacters.reverse().map((char, index) => (
              <div key={char.characterId} className="relative">
                <CharacterIcon
                  id={char.characterId}
                  className={cn(index == 0 ? "-ml-3" : "")}
                />
                <div className="absolute -bottom-1 -right-1 bg-white text-black/70 text-xs w-5.5 h-5.5 flex items-center justify-center rounded-full ">
                  C{char.constellation}
                </div>
              </div>
            ))}
          </div>
        );
      } else if (obtainedCharacters.length === 1) {
        // Only one character obtained
        const char = obtainedCharacters[0];
        content = (
          <div className="relative">
            <CharacterIcon id={char.characterId} />
            <div className="absolute -bottom-1 -right-1 bg-white text-black/70 text-xs w-5.5 h-5.5 flex items-center justify-center rounded-full ">
              C{char.constellation}
            </div>
          </div>
        );
      } else {
        // No characters obtained - determine what to show
        const missedCharacters = characterResults.filter(
          (char) => char.wishesUsed > 0
        );
        if (missedCharacters.length > 0) {
          content = <div className="text-xs font-medium italic">Missed</div>;
        } else {
          content = <div className="text-xs font-medium italic">Skipped</div>;
        }
      }

      // Determine styling based on result type
      let textClass;

      if (resultType === "success") {
        textClass = "text-yellow-1";
      } else if (resultType === "missed") {
        textClass = "text-[#ff6b6b]";
      } else if (resultType === "standard5star") {
        textClass = "text-gold-1";
      } else if (resultType === "skipped") {
        textClass = "text-white/30";
      } else {
        textClass = "text-[#1dd1a1]";
      }

      return {
        displayContent: content,
        styleClasses: {
          container: `  `,
          text: textClass,
        },
      };
    }, [characterResults, hasAnySuccess, resultType]);

    return (
      <div
        className={`min-h-[48px] text-center flex flex-col h-full items-center justify-center gap-2 ${styleClasses.text}`}
      >
        {displayContent}
      </div>
    );
  }
);

export const ScenarioCell = observer(({ bannerOutcome }: ScenarioCellProps) => {
  const processedScenario = useMemo((): ProcessedScenario | null => {
    // If no banner outcome, this banner was skipped
    if (!bannerOutcome) {
      return {
        characterResults: [],
        hasAnySuccess: false,
        resultType: "skipped",
      };
    }

    const characterResults = bannerOutcome.characterOutcomes;
    const hasAnySuccess = characterResults.some((char) => char.obtained);

    // Determine result type
    let resultType: ProcessedScenario["resultType"];
    if (hasAnySuccess) {
      resultType = "success";
    } else {
      // Check if any characters had wishes allocated
      const hasWishesAllocated = characterResults.some(
        (char) => char.wishesUsed > 0
      );
      if (!hasWishesAllocated) {
        resultType = "skipped";
      } else {
        resultType = "missed"; // Had wishes but didn't get characters
      }
    }

    return {
      characterResults,
      hasAnySuccess,
      resultType,
    };
  }, [bannerOutcome]);

  if (!processedScenario) {
    return null;
  }

  return (
    <>
      <div className="block @lg/sim:hidden">
        <ScenarioCellMobile processedScenario={processedScenario} />
      </div>
      <div className="hidden @lg/sim:block">
        <ScenarioCellDesktop processedScenario={processedScenario} />
      </div>
    </>
  );
});
