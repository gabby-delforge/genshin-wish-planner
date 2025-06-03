import WeaponIcon from "@/lib/components/weapon-icon";
import { ApiWeapon, WeaponSuccessRate } from "@/lib/types";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ProgressBar } from "../ui/progress-bar";

type SimulationResultsWeaponCategoryProps = {
  weapon: ApiWeapon;
  successRates: WeaponSuccessRate[];
};

export const SimulationResultsWeaponCategory = observer(
  ({ weapon, successRates }: SimulationResultsWeaponCategoryProps) => {
    const sorted = useMemo(() => {
      return successRates.sort((a, b) =>
        a.versionId.localeCompare(b.versionId)
      );
    }, [successRates]);

    return (
      <Card variant="light">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <WeaponIcon id={weapon.Id} showName />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {sorted.map((s) => (
              <div
                key={`${s.weaponId}${s.versionId}${s.successPercent}`}
                className="bg-void-1 rounded-md p-3 border border-void-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className={`text-sm font-medium `}>R1</span>
                  </div>
                  {s.successPercent === 1 ? (
                    <div className="text-sm font-medium text-yellow-400">
                      Guaranteed
                    </div>
                  ) : (
                    <div className="text-sm font-medium">
                      {(s.successPercent * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
                <ProgressBar percent={s.successPercent} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
);
