"use client";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { API_WEAPONS } from "../data";
import { getWeaponIconSrc } from "../types";

const UNKNOWN_WEAPON_IMG = "/images/unknown_character.png";

interface WeaponIconProps {
  id: string;
  size?: number;
  className?: string;
  alt?: string;
  useSquareIcon?: boolean; // Option to use square or circular icon
  showName?: boolean;
}

/**
 * Component to display a Genshin Impact weapon icon
 *
 * This component will attempt to display a weapon icon based on the id provided.
 * If the icon fails to load, it will display a fallback placeholder.
 */
const WeaponIcon: React.FC<WeaponIconProps> = observer(
  ({ id, size = 48, className = "", alt, showName = false }) => {
    const [imgError, setImgError] = useState(false);

    const weaponData = useMemo(() => {
      const weapon = API_WEAPONS[id];
      if (!weapon) {
        console.warn(`Couldn't load weapon data for ${id}`);
        return {
          name: id || "Unknown Weapon", // Fallback to id or generic name
          iconSrc: UNKNOWN_WEAPON_IMG, // Use placeholder image
        };
      }
      return {
        name: weapon.Name || id, // Fallback to id if no name
        iconSrc: getWeaponIconSrc(weapon.Id),
      };
    }, [id]);

    if (!weaponData) {
      return null;
    }

    const { name, iconSrc } = weaponData;

    return (
      <div className={`flex flex-row items-center gap-2 ${className}`}>
        <div
          className="relative overflow-hidden shrink-0 rounded-full bg-void-1 border border-white/20"
          style={{ width: size, height: size }}
        >
          <Image
            src={imgError ? UNKNOWN_WEAPON_IMG : iconSrc}
            alt={alt || `${name} icon`}
            width={size}
            height={size}
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        {showName && (
          <p className="text-sm font-genshin text-gold-1 break-words text-left">
            {name}
          </p>
        )}
      </div>
    );
  }
);

export default WeaponIcon;
