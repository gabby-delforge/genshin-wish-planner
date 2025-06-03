import { observer } from "mobx-react-lite";
import { ProcessedScenario, getScenarioStyling, getSectionStyling } from "./scenario-utils";
import {
  CharacterDisplayDesktop,
} from "./character-display";
import { WeaponDisplayDesktop } from "./weapon-display";

type ScenarioCellDesktopProps = {
  processedScenario: ProcessedScenario;
};

export const ScenarioCellDesktop = observer(
  ({ processedScenario }: ScenarioCellDesktopProps) => {
    const {
      characterResults,
      weaponResults,
      charResultType,
      weaponResultType,
      showCharacterSection,
      showWeaponSection,
    } = processedScenario;

    // Both sections - render as separate stacked cards
    if (showCharacterSection && showWeaponSection) {
      const characterStyling = getSectionStyling(charResultType);
      const weaponStyling = getSectionStyling(weaponResultType);

      return (
        <div className="flex flex-col gap-2 h-full">
          {/* Character card */}
          <div className={characterStyling.containerClass}>
            <div className={characterStyling.textClass}>
              <CharacterDisplayDesktop characterResults={characterResults} />
            </div>
          </div>
          
          {/* Weapon card */}
          <div className={weaponStyling.containerClass}>
            <div className={weaponStyling.textClass}>
              <WeaponDisplayDesktop weaponResults={weaponResults} />
            </div>
          </div>
        </div>
      );
    }

    // Single section - use unified styling
    const styling = getScenarioStyling(processedScenario);

    const renderContent = () => {
      // Character section only
      if (showCharacterSection) {
        return <CharacterDisplayDesktop characterResults={characterResults} />;
      }

      // Weapon section only
      if (showWeaponSection) {
        return <WeaponDisplayDesktop weaponResults={weaponResults} />;
      }

      // Neither section (fallback)
      return <div className="text-xs font-medium italic">Skipped</div>;
    };

    return (
      <div className={styling.containerClass}>
        <div className={styling.textClass}>{renderContent()}</div>
      </div>
    );
  }
);