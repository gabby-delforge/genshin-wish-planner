import { BannerInputBase } from "@/components/banner/banner-input-base";
import { WishesAvailableTooltip } from "@/components/banner/wishes-available-tooltip";
import { LimitedWish } from "@/components/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { useIsMobile } from "@/lib/responsive-design/hooks/useMediaQuery";

import {
  BannerConfiguration,
  BannerId,
  CharacterId,
  WeaponId,
} from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo } from "react";

type WishesInputProps = {
  isLoading: boolean;
  bannerId: BannerId;
  numWishesAllocated: number;
  setNumWishesAllocated: (n: number) => void;
  bannerConfig: BannerConfiguration;
} & (
  | { type: "character"; characterId: CharacterId }
  | { type: "weapon"; weaponId: WeaponId }
);

export const WishesInput = observer((props: WishesInputProps) => {
  const {
    isLoading,
    bannerId,
    numWishesAllocated,
    setNumWishesAllocated,
    type,
    ...rest
  } = props;

  const isMobile = useIsMobile();
  const { availableWishes } = useGenshinState();

  const targetId =
    type === "character"
      ? (rest as { characterId: CharacterId }).characterId
      : (rest as { weaponId: WeaponId }).weaponId;

  // Get the max spendable wishes using unified calculation
  const maxWishesCalculation =
    targetId && availableWishes[bannerId]
      ? availableWishes[bannerId].maxWishesPerCharacterOrWeapon[targetId] || {
          baseWishes: 0,
          starglitterWishes: 0,
        }
      : { baseWishes: 0, starglitterWishes: 0 };

  const { baseWishes, starglitterWishes } = maxWishesCalculation;
  const totalSpendable = Math.floor(baseWishes + starglitterWishes);

  const handleMaximumClick = useCallback(() => {
    setNumWishesAllocated(totalSpendable);
  }, [totalSpendable, setNumWishesAllocated]);

  const wishSources = useMemo(() => {
    if (isLoading || totalSpendable < 1) {
      return [{ label: "available", amount: baseWishes }];
    }
    return [
      { label: "", amount: baseWishes },
      { label: "from Starglitter", amount: starglitterWishes },
    ];
  }, [isLoading, totalSpendable, baseWishes, starglitterWishes]);

  const maxButton = useMemo(() => {
    if (isMobile) {
      return (
        <>
          <Button
            onClick={handleMaximumClick}
            disabled={isLoading || totalSpendable < 1}
            variant="filled"
            size="sm"
            className="text-xs px-2 py-1 h-8"
          >
            Max
          </Button>
        </>
      );
    } else {
      return (
        <>
          <WishesAvailableTooltip wishSources={wishSources} showEmptySources>
            <Button
              onClick={handleMaximumClick}
              disabled={
                isLoading ||
                totalSpendable < 1 ||
                totalSpendable === numWishesAllocated
              }
              variant="filled"
              size="sm"
              className="text-xs px-2 py-1 h-8"
            >
              Max
            </Button>
          </WishesAvailableTooltip>
        </>
      );
    }
  }, [
    isMobile,
    isLoading,
    baseWishes,
    starglitterWishes,
    totalSpendable,
    wishSources,
    handleMaximumClick,
  ]);

  return (
    <BannerInputBase
      title="Spend up to"
      isLoading={isLoading}
      onClickMax={handleMaximumClick}
      onClickReset={() => setNumWishesAllocated(0)}
      isResetDisabled={numWishesAllocated === 0}
      maxButton={maxButton}
    >
      <Input
        isLoading={isLoading}
        id={`wishes-${targetId}`}
        type="number"
        min="0"
        value={numWishesAllocated}
        onChange={(e) => {
          const value =
            e.target.value === "" ? 0 : parseInt(e.target.value, 10);
          setNumWishesAllocated(isNaN(value) ? 0 : Math.max(0, value));
        }}
        unit={<LimitedWish />}
        showPlusMinus={true}
        width={"w-18"}
      />
    </BannerInputBase>
  );
});
