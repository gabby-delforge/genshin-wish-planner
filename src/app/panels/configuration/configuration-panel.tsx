"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type React from "react";

import { Panel } from "@/components/ui/panel";
import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import {
  AccountStatus as AccountStatusType,
  PrimogemSourceKey,
  ResourceType,
} from "@/lib/types";
import { Cog } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { useCallback } from "react";
import { EstimatedFutureWishes } from "./estimated-future-wishes";
import { WishResources } from "./wish-resources";

export default function ConfigurationPanel() {
  const { accountStatus, estimatedNewWishesPerBanner, isLoading } =
    useGenshinState();
  const { setAccountStatus } = useGenshinActions();
  const updateAccountStatus = useCallback(
    (newStatus: AccountStatusType) => {
      console.log(newStatus.excludeCurrentBannerPrimogemSources);
      setAccountStatus(newStatus);
    },
    [setAccountStatus]
  );

  // Update wish resources
  const handleResourceChange = useCallback(
    (name: ResourceType, amount: number) => {
      console.log(name, amount);
      updateAccountStatus({
        ...accountStatus,
        ownedWishResources: {
          ...accountStatus.ownedWishResources,
          [name]: amount,
        },
      });
    },
    [accountStatus, updateAccountStatus]
  );

  const handlePityChange = useCallback(
    (newPity: number) => {
      updateAccountStatus({
        ...accountStatus,
        currentPity: newPity,
      });
    },
    [accountStatus, updateAccountStatus]
  );

  // Update guarantee status
  const handleGuaranteeChange = useCallback(
    (checked: boolean) => {
      updateAccountStatus({
        ...accountStatus,
        isNextFiftyFiftyGuaranteed: checked,
      });
    },
    [accountStatus, updateAccountStatus]
  );

  // Update primogem source options
  const handlePrimogemSourceChange = useCallback(
    (source: PrimogemSourceKey, checked: boolean) => {
      updateAccountStatus({
        ...accountStatus,
        primogemSources: {
          ...accountStatus.primogemSources,
          [source]: checked,
        },
      });
    },
    [accountStatus, updateAccountStatus]
  );

  const handleExcludeCurrentBannerPrimogemSourcesChange = useCallback(
    (checked: boolean) => {
      console.log(checked);
      updateAccountStatus({
        ...accountStatus,
        excludeCurrentBannerPrimogemSources: checked,
      });
    },
    []
  );

  return (
    <Panel title="Configuration" icon={<Cog className="w-h4 h-h4" />}>
      <div className="space-y-4 @container/config">
        <div className="grid grid-cols-2 @sm/config:grid-cols-4 gap-2">
          <Label htmlFor="currentPity" className="my-auto">
            Pity
          </Label>
          <Input
            className="w-full"
            id="currentPity"
            isLoading={isLoading}
            name="currentPity"
            type="number"
            min="0"
            max="89"
            value={accountStatus.currentPity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handlePityChange(parseInt(e.target.value) || 0)
            }
            showPlusMinus
            onClickPlusMinus={(change: -1 | 1) =>
              handlePityChange(accountStatus.currentPity + change)
            }
          />
          <Label htmlFor="isGuaranteed" className="my-auto">
            Last 50/50
          </Label>
          <ToggleGroup.Root
            type="single"
            className="items-center justify-center rounded-lg p-1 text-muted-foreground grid grid-cols-2 bg-void-1"
            value={accountStatus.isNextFiftyFiftyGuaranteed ? "lost" : "won"}
            onValueChange={(value) => {
              if (value) {
                handleGuaranteeChange(value === "lost");
              }
            }}
          >
            <ToggleGroup.Item
              value="lost"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground data-[state=on]:shadow data-[state=on]:bg-void-2"
            >
              <span className="text-sm">Lost</span>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="won"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-foreground data-[state=on]:shadow data-[state=on]:bg-void-2"
            >
              <span className="text-sm">Won</span>
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
        <Separator className="bg-void-2/50" />
        <WishResources
          accountStatus={accountStatus}
          handleResourceChange={handleResourceChange}
        />
        <Separator className="bg-void-2/50" />
        <EstimatedFutureWishes
          estimatedNewWishesPerBanner={estimatedNewWishesPerBanner}
          accountStatus={accountStatus}
          handlePrimogemSourceChange={handlePrimogemSourceChange}
          handleExcludeCurrentBannerPrimogemSourcesChange={
            handleExcludeCurrentBannerPrimogemSourcesChange
          }
        />
      </div>
    </Panel>
  );
}
