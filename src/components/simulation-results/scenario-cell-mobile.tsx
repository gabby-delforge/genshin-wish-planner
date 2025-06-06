import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { ProcessedScenario } from "./scenario-utils";
import {
  CharacterDisplayMobile,
} from "./character-display";
import { WeaponDisplayMobile } from "./weapon-display";

type ScenarioCellMobileProps = {
  processedScenario: ProcessedScenario;
};

export const ScenarioCellMobile = observer(
  ({ processedScenario }: ScenarioCellMobileProps) => {
    const {
      characterResults,
      weaponResults,
      resultType,
      showCharacterSection,
      showWeaponSection,
    } = processedScenario;

    const textClass = useMemo(() => {
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
    }, [resultType]);

    // Both sections
    if (showCharacterSection && showWeaponSection) {
      return (
        <div
          className={`min-h-[48px] text-center flex flex-col h-full items-center justify-center gap-1 ${textClass}`}
        >
          <div className="flex-1 flex items-center justify-center">
            <CharacterDisplayMobile characterResults={characterResults} />
          </div>
          <div className="w-full h-px bg-white/20" />
          <div className="flex-1 flex items-center justify-center">
            <WeaponDisplayMobile weaponResults={weaponResults} />
          </div>
        </div>
      );
    }

    // Character section only
    if (showCharacterSection) {
      return (
        <div
          className={`min-h-[48px] text-center flex flex-col h-full items-center justify-center gap-2 ${textClass}`}
        >
          <CharacterDisplayMobile characterResults={characterResults} />
        </div>
      );
    }

    // Weapon section only
    if (showWeaponSection) {
      return (
        <div
          className={`min-h-[48px] text-center flex flex-col h-full items-center justify-center gap-2 ${textClass}`}
        >
          <WeaponDisplayMobile weaponResults={weaponResults} />
        </div>
      );
    }

    // Neither section (should not happen, but fallback)
    return (
      <div
        className={`min-h-[48px] text-center flex flex-col h-full items-center justify-center gap-2 ${textClass}`}
      >
        <div className="text-xs font-medium italic">Skipped</div>
      </div>
    );
  }
);