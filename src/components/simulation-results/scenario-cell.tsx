import CharacterIcon from "@/lib/components/character-icon";
import { Desktop, Mobile } from "@/lib/responsive-design/responsive-context";
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

// Mobile component - cleaner without duplicate logic
const ScenarioCellMobile = observer(
  ({ processedScenario }: ProcessedScenarioCellProps) => {
    const { characterResults, resultType } = processedScenario;

    const { content, textClass } = useMemo(() => {
      const obtainedCharacters = characterResults.filter(
        (char) => char.obtained
      );

      let displayContent;
      if (obtainedCharacters.length === 2) {
        displayContent = (
          <div className="flex flex-row-reverse m-auto h-full w-full">
            {obtainedCharacters.reverse().map((char, index) => (
              <div key={char.characterId} className="relative">
                <CharacterIcon
                  id={char.characterId}
                  className={cn(index == 0 ? "-ml-3" : "")}
                />
                <div className="absolute -bottom-1 -right-1 bg-white text-black/70 text-xs w-5.5 h-5.5 flex items-center justify-center rounded-full">
                  C{char.constellation}
                </div>
              </div>
            ))}
          </div>
        );
      } else if (obtainedCharacters.length === 1) {
        const char = obtainedCharacters[0];
        displayContent = (
          <div className="relative">
            <CharacterIcon id={char.characterId} />
            <div className="absolute -bottom-1 -right-1 bg-white text-black/70 text-xs w-5.5 h-5.5 flex items-center justify-center rounded-full">
              C{char.constellation}
            </div>
          </div>
        );
      } else {
        const missedCharacters = characterResults.filter(
          (char) => char.wishesUsed > 0
        );
        displayContent = (
          <div className="text-xs font-medium italic">
            {missedCharacters.length > 0 ? "Missed" : "Skipped"}
          </div>
        );
      }

      // Mobile-specific text colors
      const getTextClass = () => {
        switch (resultType) {
          case "success":
            return "text-yellow-1";
          case "missed":
            return "text-[#ff6b6b]";
          case "standard5star":
            return "text-gold-1";
          case "skipped":
            return "text-white/30";
          default:
            return "text-[#1dd1a1]";
        }
      };

      return {
        content: displayContent,
        textClass: getTextClass(),
      };
    }, [characterResults, resultType]);

    return (
      <div
        className={`min-h-[48px] text-center flex flex-col h-full items-center justify-center gap-2 ${textClass}`}
      >
        {content}
      </div>
    );
  }
);

// Desktop component - with full styling
const ScenarioCellDesktop = observer(
  ({ processedScenario }: ProcessedScenarioCellProps) => {
    const { characterResults, resultType } = processedScenario;

    const { content, containerClass, textClass } = useMemo(() => {
      const obtainedCharacters = characterResults.filter(
        (char) => char.obtained
      );

      let displayContent;
      if (obtainedCharacters.length === 2) {
        displayContent = (
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
        const char = obtainedCharacters[0];
        displayContent = (
          <div className="flex flex-row items-center gap-1">
            <CharacterIcon id={char.characterId} showName />
            <span className="text-xs opacity-75">(C{char.constellation})</span>
          </div>
        );
      } else {
        const missedCharacters = characterResults.filter(
          (char) => char.wishesUsed > 0
        );
        if (missedCharacters.length > 0) {
          displayContent = (
            <div className="flex flex-col gap-1">
              {missedCharacters.map((char) => (
                <div
                  key={char.characterId}
                  className="flex relative flex-row items-center gap-2"
                >
                  <CharacterIcon
                    id={char.characterId}
                    showName
                    className="opacity-50"
                  />
                  <div className="absolute text-xs bottom-0 right-0 font-medium italic opacity-80">
                    Missed
                  </div>
                </div>
              ))}
            </div>
          );
        } else {
          displayContent = (
            <div className="text-xs font-medium italic">Skipped</div>
          );
        }
      }

      // Desktop styling with backgrounds and borders
      const getStyles = () => {
        switch (resultType) {
          case "success":
            return {
              bg: "bg-yellow-1/30",
              border: "border-gold-1",
              text: "text-yellow-1",
            };
          case "missed":
            return {
              bg: "bg-[#ff6b6b]/20",
              border: "border-[#ff6b6b]/40",
              text: "text-white",
            };
          case "standard5star":
            return {
              bg: "bg-gold-1/20",
              border: "border-gold-1/40",
              text: "text-gold-1",
            };
          case "skipped":
            return {
              bg: "bg-bg-dark-2/20",
              border: "border-void-2",
              text: "text-white/30",
            };
          default:
            return {
              bg: "bg-bg-dark-2/20",
              border: "border-void-2",
              text: "text-[#1dd1a1]",
            };
        }
      };

      const styles = getStyles();
      return {
        content: displayContent,
        containerClass: `p-2 rounded-md text-center h-full flex flex-col items-center justify-center gap-2 ${styles.bg} border ${styles.border}`,
        textClass: styles.text,
      };
    }, [characterResults, resultType]);

    return (
      <div className={containerClass}>
        <div className={textClass}>{content}</div>
      </div>
    );
  }
);

// Main component using responsive wrappers
export const ScenarioCell = observer(({ bannerOutcome }: ScenarioCellProps) => {
  const processedScenario = useMemo((): ProcessedScenario | null => {
    if (!bannerOutcome) {
      return {
        characterResults: [],
        hasAnySuccess: false,
        resultType: "skipped",
      };
    }

    const characterResults = bannerOutcome.characterOutcomes;
    const hasAnySuccess = characterResults.some((char) => char.obtained);

    let resultType: ProcessedScenario["resultType"];
    if (hasAnySuccess) {
      resultType = "success";
    } else {
      const hasWishesAllocated = characterResults.some(
        (char) => char.wishesUsed > 0
      );
      resultType = hasWishesAllocated ? "missed" : "skipped";
    }

    return { characterResults, hasAnySuccess, resultType };
  }, [bannerOutcome]);

  if (!processedScenario) {
    return null;
  }

  return (
    <>
      <Mobile>
        <ScenarioCellMobile processedScenario={processedScenario} />
      </Mobile>
      <Desktop>
        <ScenarioCellDesktop processedScenario={processedScenario} />
      </Desktop>
    </>
  );
});
