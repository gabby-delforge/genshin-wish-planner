import { useGenshinState } from "@/lib/mobx/genshin-context";
import { Desktop, Mobile } from "@/lib/responsive-design/responsive-context";
import {
  ApiWeapon,
  BannerConfiguration,
  BannerId,
  BannerWishBreakdown,
  WeaponId,
} from "@/lib/types";
import { observer } from "mobx-react-lite";
import { LimitedWish } from "../resource";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { ConstellationInput } from "@/app/panels/simulation/components/constellation-input";
import { WishesInput } from "@/app/panels/simulation/components/wishes-input";
import WeaponIcon from "@/lib/components/weapon-icon";

type WeaponBannerRowProps = {
  bannerId: BannerId;
  weapons: [ApiWeapon, ApiWeapon]; // Exactly 2 featured weapons
  currentWishesAllocated: number;
  setWishesAllocated: (value: number) => void;
  currentEpitomizedPath: WeaponId;
  setEpitomizedPath: (weaponId: WeaponId) => void;
  currentMaxRefinement: number;
  setMaxRefinement: (value: number) => void;
  availableWishes: BannerWishBreakdown;
  bannerConfig: BannerConfiguration;
};

const WeaponBannerRowMobile = observer(
  ({
    bannerId,
    weapons,
    currentWishesAllocated,
    setWishesAllocated,
    currentEpitomizedPath,
    setEpitomizedPath,
    currentMaxRefinement,
    setMaxRefinement,
    bannerConfig,
  }: WeaponBannerRowProps) => {
    const { mode, isLoading, availableWishes } = useGenshinState();
    const maxWishesCalculation = availableWishes[bannerId]
      ?.maxWishesPerCharacterOrWeapon[currentEpitomizedPath] || {
      baseWishes: 0,
      starglitterWishes: 0,
    };

    return (
      <div className="flex flex-col text-sm bg-void-3 px-4 py-6 relative items-end gap-6">
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

        <ConstellationInput
          isLoading={isLoading}
          type="weapon"
          weaponId={currentEpitomizedPath}
          maxConstellation={currentMaxRefinement}
          setMaxConstellation={setMaxRefinement}
        />

        {mode === "playground" && (
          <div className="w-full flex flex-col gap-2">
            <WishesInput
              bannerId={bannerId}
              isLoading={isLoading}
              type="weapon"
              weaponId={currentEpitomizedPath}
              numWishesAllocated={currentWishesAllocated}
              setNumWishesAllocated={setWishesAllocated}
              bannerConfig={bannerConfig}
            />
            <div className="flex self-center gap-0.5 items-center text-white text-xxs bg-gold-1/20 rounded-md py-0.5 px-2 w-full">
              {maxWishesCalculation.baseWishes +
                maxWishesCalculation.starglitterWishes >
              0 ? (
                <>
                  <span className="text-gold-1">Max:</span>
                  {[
                    {
                      label: "",
                      amount: maxWishesCalculation.baseWishes,
                    },
                    {
                      label: "from Starglitter",
                      amount: maxWishesCalculation.starglitterWishes,
                    },
                  ]
                    .filter((w) => w.amount !== 0)
                    .map((w, i) => (
                      <div className="flex gap-1 items-center" key={w.label}>
                        {i !== 0 && <div>{w.amount > 0 ? "+" : "-"}</div>}
                        <LimitedWish number={Math.abs(w.amount)} />
                        <div>{w.label}</div>
                      </div>
                    ))}
                </>
              ) : (
                <>No wishes available to allocate.</>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

const WeaponBannerRowDesktop = observer(
  ({
    bannerId,
    weapons,
    currentWishesAllocated,
    setWishesAllocated,
    currentEpitomizedPath,
    setEpitomizedPath,
    currentMaxRefinement,
    setMaxRefinement,
    bannerConfig,
  }: WeaponBannerRowProps) => {
    const { mode, isLoading } = useGenshinState();

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

        <div className="flex gap-8 col-span-2 justify-end">
          <ConstellationInput
            isLoading={isLoading}
            type="weapon"
            weaponId={currentEpitomizedPath}
            maxConstellation={currentMaxRefinement}
            setMaxConstellation={setMaxRefinement}
          />
          {mode === "playground" && (
            <WishesInput
              bannerId={bannerId}
              isLoading={isLoading}
              type="weapon"
              weaponId={currentEpitomizedPath}
              numWishesAllocated={currentWishesAllocated}
              setNumWishesAllocated={setWishesAllocated}
              bannerConfig={bannerConfig}
            />
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
