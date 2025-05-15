import { LimitedWish, Primogem } from "@/components/resource";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AccountStatus as AccountStatusType,
  PRIMOGEM_SOURCE_VALUES,
  PrimogemSourceKey,
  PrimogemSourceValue,
} from "@/lib/types";
import { useMemo } from "react";

type EstimatedFutureWishesProps = {
  estimatedNewWishesPerBanner: number;
  accountStatus: AccountStatusType;
  handlePrimogemSourceChange: (
    source: PrimogemSourceKey,
    checked: boolean
  ) => void;
};

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
      if (resource.type === "limited_wish") {
        return total + resource.value;
      }
      return total;
    }, 0);
  } else if (sourceValue.type === "limited_wish") {
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
    "abyssAndTheater",
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
    "thankYouGift",
    "battlePass",
  ] as PrimogemSourceKey[],
  paid: ["battlePassGnostic", "blessingOfWelkin"] as PrimogemSourceKey[],
};

// Source display names for UI
const SOURCE_DISPLAY_NAMES: Record<PrimogemSourceKey, string> = {
  gameUpdateCompensation: "Game Update Compensation",
  dailyCommissions: "Daily Commissions",
  paimonBargain: "Paimon's Bargain",
  abyssAndTheater: "Abyss & Theater",
  battlePass: "Battle Pass",
  battlePassGnostic: "BP (Gnostic Hymn)",
  blessingOfWelkin: "Blessing of Welkin",
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
  thankYouGift: "Thank You Gift",
};

export const EstimatedFutureWishes = ({
  estimatedNewWishesPerBanner,
  accountStatus,
  handlePrimogemSourceChange,
}: EstimatedFutureWishesProps) => {
  // Calculate totals for each category
  const categoryTotals = useMemo(() => {
    const freeToPlayTotal = PRIMOGEM_SOURCE_CATEGORIES.freeToPlay.reduce(
      (total, key) => {
        if (accountStatus.primogemSources[key]) {
          const primoValue = getPrimogemValue(PRIMOGEM_SOURCE_VALUES[key]);
          const wishValue = getLimitedWishValue(PRIMOGEM_SOURCE_VALUES[key]);
          return total + Math.floor(primoValue / 160) + wishValue;
        }
        return total;
      },
      0
    );

    const paidTotal = PRIMOGEM_SOURCE_CATEGORIES.paid.reduce((total, key) => {
      if (accountStatus.primogemSources[key]) {
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
  }, [accountStatus.primogemSources]);

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
              {`Free-to-play (`}
              <LimitedWish number={categoryTotals.freeToPlayTotal} />
              {`)`}
            </Label>
          </div>

          {/* Free-to-Play Detailed Sources */}
          <div className="grid grid-cols-1 ml-1">
            {PRIMOGEM_SOURCE_CATEGORIES.freeToPlay.map((sourceKey) => {
              const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];
              const primoValue = getPrimogemValue(sourceValue);
              const wishValue = getLimitedWishValue(sourceValue);

              return (
                <div key={sourceKey} className="flex items-center space-x-2">
                  <Checkbox
                    id={sourceKey}
                    checked={accountStatus.primogemSources[sourceKey]}
                    onCheckedChange={(checked) =>
                      handlePrimogemSourceChange(sourceKey, checked === true)
                    }
                  />
                  <Label
                    htmlFor={sourceKey}
                    className="text-xs cursor-pointer flex justify-between items-center w-full"
                  >
                    <span>{SOURCE_DISPLAY_NAMES[sourceKey]}</span>
                    <span className="text-sm text-muted-foreground flex items-center">
                      {primoValue > 0 && <Primogem number={primoValue} />}
                      {wishValue > 0 && <LimitedWish number={wishValue} />}
                    </span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paid Sources */}
        <div>
          <div className="flex items-center space-x-2">
            <Label className="flex items-center text-sm font-medium text-gold-1">
              {`Premium (`}
              <LimitedWish number={categoryTotals.paidTotal} />
              {`)`}
            </Label>
          </div>

          <div className="grid grid-cols-1 ml-1">
            {PRIMOGEM_SOURCE_CATEGORIES.paid.map((sourceKey) => {
              const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey];
              const primoValue = getPrimogemValue(sourceValue);
              const wishValue = getLimitedWishValue(sourceValue);

              return (
                <div key={sourceKey} className="flex items-center space-x-2">
                  <Checkbox
                    id={sourceKey}
                    checked={accountStatus.primogemSources[sourceKey]}
                    onCheckedChange={(checked) =>
                      handlePrimogemSourceChange(sourceKey, checked === true)
                    }
                  />
                  <Label
                    htmlFor={sourceKey}
                    className="text-sm cursor-pointer flex justify-between items-center w-full"
                  >
                    <span>{SOURCE_DISPLAY_NAMES[sourceKey]}</span>
                    <span className="text-sm text-muted-foreground flex items-center">
                      {primoValue > 0 && <Primogem number={primoValue} />}
                      {wishValue > 0 && <LimitedWish number={wishValue} />}
                    </span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-void-1 rounded-md p-3 border border-void-2 mt-4">
        <div className="text-sm flex gap-1 items-baseline justify-center font-medium text-gold-1">
          <span className=" font-bold">
            <LimitedWish number={estimatedNewWishesPerBanner} />
          </span>
          gained each banner
        </div>
      </div>
    </div>
  );
};
