"use client";
import Image from "next/image";
import React, { useState } from "react";
import { API_CHARACTERS } from "../data";
import { prefix } from "../prefix";
import { getCharacterElementColor } from "../utils";

interface CharacterIconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
  useSquareIcon?: boolean; // Option to use square or circular icon
}

/**
 * Component to display a Genshin Impact character icon
 *
 * This component will attempt to display a character icon based on the name provided.
 * If the icon fails to load, it will display a fallback placeholder.
 */
const CharacterIcon: React.FC<CharacterIconProps> = ({
  name,
  size = 48,
  className = "",
  alt,
}) => {
  const [imgError, setImgError] = useState(false);

  const iconFilename = `UI_AvatarIcon_${name.toLowerCase()}.png`;

  const iconPath = `${prefix}/images/characters/${iconFilename}`;

  // Fallback placeholder path
  const fallbackIcon = `${prefix}/images/unknown_character.png`;

  const backgroundColor = getCharacterElementColor(
    API_CHARACTERS[name].element
  );
  return (
    <div
      className={`relative overflow-hidden rounded-full ${backgroundColor} ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imgError ? fallbackIcon : iconPath}
        alt={alt || `${name} icon`}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export default CharacterIcon;
