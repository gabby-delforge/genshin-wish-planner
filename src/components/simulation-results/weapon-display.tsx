import WeaponIcon from "@/lib/components/weapon-icon";
import { WeaponOutcome } from "@/lib/types";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";

type WeaponDisplayMobileProps = {
  weaponResults: WeaponOutcome[];
  resultType?: "success" | "missed" | "standard5star" | "skipped" | "other";
};

type WeaponDisplayDesktopProps = {
  weaponResults: WeaponOutcome[];
  resultType?: "success" | "missed" | "standard5star" | "skipped" | "other";
};

export const WeaponDisplayMobile = observer(
  ({ weaponResults }: WeaponDisplayMobileProps) => {
    const obtainedWeapons = weaponResults.filter((weapon) => weapon.obtained);

    if (obtainedWeapons.length === 2) {
      return (
        <div className="flex flex-row-reverse m-auto h-full w-full">
          {obtainedWeapons.reverse().map((weapon, index) => (
            <div key={weapon.weaponId} className="relative">
              <WeaponIcon
                id={weapon.weaponId}
                size={32}
                className={cn(index == 0 ? "-ml-2" : "")}
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                R{(weapon.refinementLevel || 0) + 1}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (obtainedWeapons.length === 1) {
      const weapon = obtainedWeapons[0];
      return (
        <div className="relative">
          <WeaponIcon id={weapon.weaponId} size={32} />
          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            R{(weapon.refinementLevel || 0) + 1}
          </div>
        </div>
      );
    } else {
      const missedWeapons = weaponResults.filter(
        (weapon) => weapon.wishesUsed > 0
      );
      return (
        <div className="text-xs font-medium italic">
          {missedWeapons.length > 0 ? "Missed" : "Skipped"}
        </div>
      );
    }
  }
);

export const WeaponDisplayDesktop = observer(
  ({ weaponResults }: WeaponDisplayDesktopProps) => {
    const obtainedWeapons = weaponResults.filter((weapon) => weapon.obtained);

    if (obtainedWeapons.length === 2) {
      return (
        <div className="flex flex-col gap-1">
          {obtainedWeapons.map((weapon, index) => (
            <div key={index} className="flex flex-row items-center gap-1">
              <WeaponIcon id={weapon.weaponId} showName size={24} />
              <span className="text-xs opacity-75">
                (R{(weapon.refinementLevel || 0) + 1})
              </span>
            </div>
          ))}
        </div>
      );
    } else if (obtainedWeapons.length === 1) {
      const weapon = obtainedWeapons[0];
      return (
        <div className="flex flex-row items-center gap-1">
          <WeaponIcon id={weapon.weaponId} showName size={24} />
          <span className="text-xs opacity-75">
            (R{(weapon.refinementLevel || 0) + 1})
          </span>
        </div>
      );
    } else {
      const missedWeapons = weaponResults.filter(
        (weapon) => weapon.wishesUsed > 0
      );
      if (missedWeapons.length > 0) {
        return (
          <div className="flex flex-col gap-1">
            {missedWeapons.map((weapon) => (
              <div
                key={weapon.weaponId}
                className="flex relative flex-row items-center gap-2"
              >
                <WeaponIcon
                  id={weapon.weaponId}
                  showName
                  size={24}
                  className="opacity-50"
                />
                <div className="absolute text-xs -bottom-1 right-0 font-medium italic opacity-80">
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
