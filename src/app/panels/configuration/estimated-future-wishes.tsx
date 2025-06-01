import { LimitedWish, Primogem } from "@/components/resource";
import { CheckboxWithLabel } from "@/components/ui/checkbox-with-label";
import { InfoIcon } from "@/components/ui/info-icon";
import { Label } from "@/components/ui/label";
import { PRIMOGEM_SOURCE_VALUES } from "@/lib/data";
import {
  PrimogemSourceKey,
  PrimogemSourcesEnabled,
  PrimogemSourceValue,
} from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";

// Helper function to get the primogem value from a source
const getPrimogemValue = (sourceValue: PrimogemSourceValue): number => {
  if (Array.isArray(sourceValue)) {
    return sourceValue.reduce((total, resource) => {
      if (resource.type === "primogem") {
        return total + resource.value;
      }
      return total;
    }, 0);
  } else if (sourceValue.type === "primogem") {
    return sourceValue.value;
  }
  return 0;
};

// Helper function to get the limited wish value from a source
const getLimitedWishValue = (sourceValue: PrimogemSourceValue): number => {
  if (Array.isArray(sourceValue)) {
    return sourceValue.reduce((total, resource) => {
      if (resource.type === "limitedWishes") {
        return total + resource.value;
      }
      return total;
    }, 0);
  } else if (sourceValue.type === "limitedWishes") {
    return sourceValue.value;
  }
  return 0;
};

// Define source categories for UI organization
const PRIMOGEM_SOURCE_CATEGORIES = {
  freeToPlay: [
    "gameUpdateCompensation",
    "dailyCommissions",
    "paimonBargain",
    "abyss",
    "imaginarium",
    "archonQuest",
    "storyQuests",
    "newAchievements",
    "characterTestRuns",
    "eventActivities",
    "hoyolabDailyCheckIn",
    "hoyolabWebEvents",
    "livestreamCodes",
    "newVersionCode",
    "limitedExplorationRewards",
    "battlePass",
  ] as PrimogemSourceKey[],
  paid: ["battlePassGnostic", "welkinMoon"] as PrimogemSourceKey[],
};

// Source display names for UI
const SOURCE_DISPLAY_NAMES: Record<PrimogemSourceKey, string> = {
  gameUpdateCompensation: "Game Update Compensation",
  dailyCommissions: "Daily Commissions",
  paimonBargain: "Paimon's Bargain",
  abyss: "Abyss",
  imaginarium: "Imaginarium",
  battlePass: "Battle Pass",
  battlePassGnostic: "Battle Pass (Gnostic Hymn)",
  welkinMoon: "Welkin Moon",
  archonQuest: "Archon Quest",
  storyQuests: "Story Quests",
  newAchievements: "New Achievements",
  characterTestRuns: "Character Test Runs",
  eventActivities: "Event Activities",
  hoyolabDailyCheckIn: "HoYoLAB Daily Check-In",
  hoyolabWebEvents: "HoYoLAB Web Events",
  livestreamCodes: "Livestream Codes",
  newVersionCode: "New Version Code",
  limitedExplorationRewards: "Limited Exploration Rewards",
};

type EstimatedFutureWishesProps = {
  estimatedNewWishesPerBanner: [number, number];
  primogemSources: PrimogemSourcesEnabled;
  handlePrimogemSourceChange: (
    source: PrimogemSourceKey,
    checked: boolean
  ) => void;
  excludeCurrentBannerPrimogems: boolean;

  handleExcludeCurrentBannerPrimogemSourcesChange: (checked: boolean) => void;
};

export const EstimatedFutureWishes = observer(
  ({
    estimatedNewWishesPerBanner,
    primogemSources,
    handlePrimogemSourceChange,
  }: EstimatedFutureWishesProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>();

    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.clientWidth);
        }
      };

      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Calculate totals for each category
    const categoryTotals = useMemo(() => {
      const freeToPlayTotal = PRIMOGEM_SOURCE_CATEGORIES.freeToPlay.reduce(
        (total, key) => {
          if (primogemSources[key]) {
            const primoValue = getPrimogemValue(PRIMOGEM_SOURCE_VALUES[key]);
            const wishValue = getLimitedWishValue(PRIMOGEM_SOURCE_VALUES[key]);
            return total + Math.floor(primoValue / 160) + wishValue;
          }
          return total;
        },
        0
      );

      const paidTotal = PRIMOGEM_SOURCE_CATEGORIES.paid.reduce((total, key) => {
        if (primogemSources[key]) {
          const primoValue = getPrimogemValue(PRIMOGEM_SOURCE_VALUES[key]);
          const wishValue = getLimitedWishValue(PRIMOGEM_SOURCE_VALUES[key]);
          return total + Math.floor(primoValue / 160) + wishValue;
        }
        return total;
      }, 0);

      return {
        freeToPlayTotal,
        paidTotal,
        grandTotal: freeToPlayTotal + paidTotal,
      };
    }, [primogemSources]);

    return (
      <div className="space-y-2">
        <div className="mt-4">
          <Label className="text-sm text-gold-1">Estimated Future Wishes</Label>
        </div>

        {/* Primogem Sources Section */}
        <div className="flex flex-col space-y-4">
          {/* Free-to-Play Category */}
          <div>
            <div className="flex items-center space-x-2">
              <Label className="flex items-center text-sm font-medium text-gold-1">
                {`Free-to-play: `}
                <LimitedWish number={categoryTotals.freeToPlayTotal} />
              </Label>
            </div>

            {/* Free-to-Play Detailed Sources */}
            <div className="grid grid-cols-1 ml-1">
              {PRIMOGEM_SOURCE_CATEGORIES.freeToPlay.map((sourceKey) => {
                const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];
                const primoValue = getPrimogemValue(sourceValue);
                const wishValue = getLimitedWishValue(sourceValue);

                if (primoValue === 0 && wishValue === 0) return null;

                return (
                  <CheckboxWithLabel
                    className="text-white/80 hover:text-white"
                    key={sourceKey}
                    id={sourceKey}
                    checked={primogemSources[sourceKey]}
                    onCheckedChange={(checked) =>
                      handlePrimogemSourceChange(sourceKey, checked === true)
                    }
                    label={
                      <>
                        <span>{SOURCE_DISPLAY_NAMES[sourceKey]}</span>

                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          {primoValue > 0 && <Primogem number={primoValue} />}
                          {wishValue > 0 && <LimitedWish number={wishValue} />}
                          {(sourceKey === "abyss" ||
                            sourceKey === "imaginarium") && (
                            <div className="text-white/40 italic">
                              per season
                            </div>
                          )}
                        </span>
                      </>
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Paid Sources */}
          <div>
            <div className="flex items-center space-x-2">
              <Label className="flex items-center text-sm font-medium text-gold-1">
                {`Premium: `}
                <LimitedWish number={categoryTotals.paidTotal} />
              </Label>
            </div>

            <div className="grid grid-cols-1 ml-1">
              {PRIMOGEM_SOURCE_CATEGORIES.paid.map((sourceKey) => {
                const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];
                const primoValue = getPrimogemValue(sourceValue);
                const wishValue = getLimitedWishValue(sourceValue);

                return (
                  <CheckboxWithLabel
                    className="text-white/80 hover:text-white"
                    key={sourceKey}
                    id={sourceKey}
                    checked={primogemSources[sourceKey]}
                    onCheckedChange={(checked) =>
                      handlePrimogemSourceChange(sourceKey, checked === true)
                    }
                    label={
                      <>
                        <span>{SOURCE_DISPLAY_NAMES[sourceKey]}</span>
                        <span className="text-sm text-muted-foreground flex items-center">
                          {primoValue > 0 && <Primogem number={primoValue} />}
                          {wishValue > 0 && <LimitedWish number={wishValue} />}
                        </span>
                      </>
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-void-1 rounded-md p-3 border border-void-2 mt-4"
        >
          <div className="text-sm flex gap-1 items-center justify-center font-medium text-gold-1">
            <LimitedWish number={estimatedNewWishesPerBanner[0]} />
            -
            <LimitedWish number={estimatedNewWishesPerBanner[1]} />
            gained each banner
            <InfoIcon
              content={
                <div className="flex flex-col gap-2">
                  <div>
                    The amount earned per banner depends on the number of abyss
                    and imaginarium seasons that occur during the banner period.
                  </div>
                  <div className="flex flex-row items-center self-center gap-1">
                    <div>2 abyss and 2 imaginarium =</div>
                    <Primogem number={2400} />
                    <div>=</div>
                    <LimitedWish number={15} />
                  </div>
                  <div className="flex flex-row items-center self-center gap-1">
                    <div>1 abyss and 1 imaginarium =</div>
                    <Primogem number={800} />
                    <div>=</div>
                    <LimitedWish number={5} />
                  </div>
                </div>
              }
              contentMaxWidth={containerWidth ? containerWidth + 36 : undefined}
            />
          </div>
        </div>
      </div>
    );
  }
);
