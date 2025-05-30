"use client";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { useState } from "react";
import { API_WEAPONS } from "../data";
import { prefix } from "../prefix";

interface WeaponIconProps {
  id: string;
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
const WeaponIcon: React.FC<WeaponIconProps> = observer(
  ({ id, size = 48, className = "", alt }) => {
    const [imgError, setImgError] = useState(false);

    const iconFilename = API_WEAPONS[id]?.IconSrc;

    const iconPath = `${prefix}/${iconFilename}`;

    // Fallback placeholder path
    const fallbackIcon = `${prefix}/images/unknown_character.png`;

    return (
      <div
        className={`relative overflow-hidden rounded-full bg-void-1 border border-white/20 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={imgError ? fallbackIcon : iconPath}
          alt={alt || `${id} icon`}
          width={size}
          height={size}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
);

export default WeaponIcon;
