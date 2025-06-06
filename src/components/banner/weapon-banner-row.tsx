import { useGenshinState } from "@/lib/mobx/genshin-context";
import { Desktop, Mobile } from "@/lib/responsive-design/responsive-context";
import { ApiWeapon, Priority, WeaponId } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { LimitedWish } from "../resource";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import WeaponIcon from "@/lib/components/weapon-icon";
import { InfoIcon } from "../ui/info-icon";

type WeaponBannerRowProps = {
  weapons: [ApiWeapon, ApiWeapon]; // Exactly 2 featured weapons
  currentWishesAllocated: number;
  setWishesAllocated: (value: number) => void;
  currentEpitomizedPath: WeaponId;
  setEpitomizedPath: (weaponId: WeaponId) => void;
  currentMaxRefinement: number;
  setMaxRefinement: (value: number) => void;
  _currentStrategy: "stop" | "continue";
  _setStrategy: (strategy: "stop" | "continue") => void;
  _currentPriority?: Priority; // For strategy mode
  _setCurrentPriority?: (value: Priority) => void;
  _availableWishes?: number; // For hint calculations
};

const WeaponBannerRowMobile = observer(
  ({
    weapons,
    currentWishesAllocated,
    setWishesAllocated,
    currentEpitomizedPath,
    setEpitomizedPath,
    currentMaxRefinement,
    setMaxRefinement,
  }: WeaponBannerRowProps) => {
    const { mode, isLoading } = useGenshinState();
    const [weapon1] = weapons;

    return (
      <div className="grid items-center gap-y-2 text-sm bg-void-3 p-4 relative grid-cols-2">
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        
        <div className="col-span-2">
          <Select
            value={currentEpitomizedPath}
            onValueChange={(value: WeaponId) => setEpitomizedPath(value)}
          >
            <SelectTrigger className="border-none">
              <SelectValue placeholder="Select weapon" />
            </SelectTrigger>
            <SelectContent className="bg-void-1 border-void-2">
              {weapons.map((weapon) => (
                <SelectItem key={weapon.Id} value={weapon.Id}>
                  <WeaponIcon id={weapon.Id} showName />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 gap-4 flex justify-end">
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-1 text-xs text-white">
              Pull until
              <InfoIcon
                content={
                  <div className="flex flex-col gap-2">
                    <div>
                      Tells the simulator to stop pulling once this refinement
                      level is reached, even if you have enough wishes to
                      continue.
                    </div>
                    <div>
                      {`Assumes you don't have the weapon yet. If you have R1 and want R2, put R1 (which equals one copy).`}
                    </div>
                  </div>
                }
                contentMaxWidth={400}
                className="text-white/50"
              />
            </div>
            <Input
              isLoading={isLoading}
              id={`refinement-${weapon1.Id}`}
              type="number"
              min="1"
              max="5"
              value={currentMaxRefinement + 1}
              onChange={(e) => setMaxRefinement(parseInt(e.target.value) - 1)}
              unit={<div className="text-white/50 pl-1 flex-initial">R</div>}
              showPlusMinus={true}
              width={"w-8"}
            />
          </div>

          {mode === "playground" && (
            <div className="flex flex-col items-center">
              <div className="text-xs text-white text-center mr-4">
                Spend up to
              </div>
              <Input
                isLoading={isLoading}
                id={`weapon-wishes-${weapon1.Id}`}
                type="number"
                min="0"
                value={currentWishesAllocated}
                onChange={(e) => setWishesAllocated(parseInt(e.target.value))}
                unit={<LimitedWish />}
                showPlusMinus={true}
                width={"w-8"}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

const WeaponBannerRowDesktop = observer(
  ({
    weapons,
    currentWishesAllocated,
    setWishesAllocated,
    currentEpitomizedPath,
    setEpitomizedPath,
    currentMaxRefinement,
    setMaxRefinement,
  }: WeaponBannerRowProps) => {
    const { mode, isLoading } = useGenshinState();
    const [weapon1] = weapons;

    return (
      <div className="grid gap-2 items-center text-sm bg-void-3 p-3 relative grid-cols-[1fr_auto_auto]">
        <div className="absolute inset-1 border-[1px] border-white/50 rounded pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <Select
            value={currentEpitomizedPath}
            onValueChange={(value: WeaponId) => setEpitomizedPath(value)}
          >
            <SelectTrigger className="border-none">
              <SelectValue placeholder="Select weapon" />
            </SelectTrigger>
            <SelectContent className="bg-void-1 border-void-2">
              {weapons.map((weapon) => (
                <SelectItem key={weapon.Id} value={weapon.Id}>
                  <WeaponIcon id={weapon.Id} showName />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <div className="flex flex-col mr-3">
            <div className="flex flex-row items-center gap-1 text-xs text-white text-right">
              Pull until
              <InfoIcon
                content={
                  <div className="flex flex-col gap-2">
                    <div>
                      Tells the simulator to stop pulling once this refinement
                      level is reached, even if you have enough wishes to
                      continue.
                    </div>
                    <div>
                      {`Assumes you don't have the weapon yet. If you have R1 and want R2, put R1 (which equals one copy).`}
                    </div>
                  </div>
                }
                contentMaxWidth={400}
                className="text-white/50"
              />
            </div>
            <Input
              isLoading={isLoading}
              id={`refinement-${weapon1.Id}`}
              type="number"
              min="1"
              max="5"
              value={currentMaxRefinement + 1}
              onChange={(e) => setMaxRefinement(parseInt(e.target.value) - 1)}
              unit={<div className="text-white/50 pl-1 flex-initial">R</div>}
              showPlusMinus={true}
              width={"w-8"}
            />
          </div>

          {mode === "playground" && (
            <div className="flex flex-col items-end">
              <div className="text-xs text-white text-right mr-4">
                Spend up to
              </div>
              <Input
                isLoading={isLoading}
                id={`weapon-wishes-${weapon1.Id}`}
                type="number"
                min="0"
                value={currentWishesAllocated}
                onChange={(e) => setWishesAllocated(parseInt(e.target.value))}
                unit={<LimitedWish />}
                showPlusMinus={true}
                width={"w-8"}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export const WeaponBannerRow = observer((props: WeaponBannerRowProps) => {
  return (
    <>
      <Mobile>
        <WeaponBannerRowMobile {...props} />
      </Mobile>
      <Desktop>
        <WeaponBannerRowDesktop {...props} />
      </Desktop>
    </>
  );
});
