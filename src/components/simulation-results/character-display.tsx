import CharacterIcon from "@/lib/components/character-icon";
import { CharacterOutcome } from "@/lib/types";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";

type CharacterDisplayMobileProps = {
  characterResults: CharacterOutcome[];
  resultType?: "success" | "missed" | "standard5star" | "skipped" | "other";
};

type CharacterDisplayDesktopProps = {
  characterResults: CharacterOutcome[];
  resultType?: "success" | "missed" | "standard5star" | "skipped" | "other";
};

export const CharacterDisplayMobile = observer(
  ({ characterResults }: CharacterDisplayMobileProps) => {
    const obtainedCharacters = characterResults.filter(
      (char) => char.obtained
    );

    if (obtainedCharacters.length === 2) {
      return (
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
      return (
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
      return (
        <div className="text-xs font-medium italic">
          {missedCharacters.length > 0 ? "Missed" : "Skipped"}
        </div>
      );
    }
  }
);

export const CharacterDisplayDesktop = observer(
  ({ characterResults }: CharacterDisplayDesktopProps) => {
    const obtainedCharacters = characterResults.filter(
      (char) => char.obtained
    );

    if (obtainedCharacters.length === 2) {
      return (
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
      return (
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
        return (
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
        return <div className="text-xs font-medium italic">Skipped</div>;
      }
    }
  }
);