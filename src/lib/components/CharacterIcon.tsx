"use client";
import Image from "next/image";
import React, { useState } from "react";

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
  useSquareIcon = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // For square icons, we use a different naming convention
  const iconFilename = useSquareIcon
    ? `UI_AvatarIcon_${name}.png`
    : `UI_AvatarIcon_Side_${name.toLowerCase()}.png`;

  const iconPath = `/images/characters/${iconFilename}`;

  // Fallback placeholder path
  const fallbackIcon = "/images/unknown_character.png";

  const borderClass = useSquareIcon ? "rounded-md" : "rounded-full";

  return (
    <div
      className={`relative overflow-hidden ${borderClass} ${className}`}
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
