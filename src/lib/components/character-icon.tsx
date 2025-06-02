"use client";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { API_CHARACTERS } from "../data";
import { CharacterId } from "../types";
import { getCharacterElementColor } from "../utils";

const UNKNOWN_CHAR_IMG = "/images/unknown_character.png";

export interface CharacterIconProps {
  id: CharacterId;
  size?: number;
  className?: string;
  alt?: string;
  showName?: boolean;
}

/**
 * Component to display a Genshin Impact character icon
 *
 * This component will attempt to display a character icon based on the id provided.
 * If the icon fails to load, it will display a fallback placeholder.
 */
const CharacterIcon: React.FC<CharacterIconProps> = observer(
  ({ id, size = 48, className = "", alt, showName = false }) => {
    const [imgError, setImgError] = useState(false);

    const characterData = useMemo(() => {
      const char = API_CHARACTERS[id];
      if (!char) {
        console.warn(`Couldn't load character data for ${id}`);
        return null;
      }
      return {
        name: char.Name,
        iconSrc: char.IconSrc,
        backgroundColor: getCharacterElementColor(char.Element),
      };
    }, [id]);

    if (!characterData) {
      return null;
    }

    const { name, iconSrc, backgroundColor } = characterData;

    return (
      <div className={`flex flex-row items-center gap-2 ${className}`}>
        <div
          className={`relative overflow-hidden shrink-0 rounded-full border-gold-1 border-1 shadow-lg ${backgroundColor}`}
          style={{
            width: "var(--icon-size, " + size + "px)",
            height: "var(--icon-size, " + size + "px)",
          }}
        >
          <Image
            src={imgError ? UNKNOWN_CHAR_IMG : iconSrc}
            alt={alt || `${name} icon`}
            width={size}
            height={size}
            className="object-cover w-full h-full"
            onError={() => setImgError(true)}
          />
        </div>
        {showName && <p className="text-sm font-genshin text-gold-1">{name}</p>}
      </div>
    );
  }
);

export default CharacterIcon;
