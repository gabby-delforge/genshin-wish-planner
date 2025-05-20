"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type React from "react";

import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import {
  AccountStatus as AccountStatusType,
  PrimogemSourceKey,
} from "@/lib/types";
import { Cog } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { useCallback } from "react";
import { EstimatedFutureWishes } from "./estimated-future-wishes";
import { WishResources } from "./wish-resources";

const SkeletonAccountStatus: React.FC = () => {
  return (
    <div className="skeleton-account-status">
      <h1
        className="skeleton-title"
        style={{
          width: "200px",
          height: "24px",
          backgroundColor: "#ccc",
          marginBottom: "16px",
        }}
      />
      <div
        className="skeleton-pity"
        style={{
          width: "100px",
          height: "20px",
          backgroundColor: "#ccc",
          marginBottom: "8px",
        }}
      />
      <div className="skeleton-resources">
        <div
          className="skeleton-resource"
          style={{
            width: "80px",
            height: "20px",
            backgroundColor: "#ccc",
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-resource"
          style={{
            width: "80px",
            height: "20px",
            backgroundColor: "#ccc",
            marginBottom: "4px",
          }}
        />
        <div
          className="skeleton-resource"
          style={{
            width: "80px",
            height: "20px",
            backgroundColor: "#ccc",
            marginBottom: "4px",
          }}
        />
      </div>
    </div>
  );
};

export default function AccountStatus() {
  const { accountStatus, estimatedNewWishesPerBanner, isLoading } =
    useGenshinState();
  const { setAccountStatus } = useGenshinActions();
  const updateAccountStatus = useCallback(
    (newStatus: AccountStatusType) => {
      setAccountStatus(newStatus);
    },
    [setAccountStatus]
  );

  // Update wish resources
  const handleResourceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = Number.parseInt(value) || 0;

      updateAccountStatus({
        ...accountStatus,
        ownedWishResources: {
          ...accountStatus.ownedWishResources,
          [name]: numValue,
        },
      });
    },
    [accountStatus, updateAccountStatus]
  );

  // Update pity
  const handlePityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const pity = Number.parseInt(e.target.value) || 0;
      updateAccountStatus({
        ...accountStatus,
        currentPity: pity,
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
      updateAccountStatus({
        ...accountStatus,
        excludeCurrentBannerPrimogemSources: checked,
      });
    },
    []
  );

  if (isLoading) {
    return <SkeletonAccountStatus />;
  }

  return (
    <Card className="bg-bg-dark-2/80 border-void-2 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="h4 flex items-center gap-2">
          <Cog className="w-h4 h-h4" />{" "}
          {/* TODO: This size isn't working properly */}
          Configuration
        </CardTitle>
        <Separator className="bg-void-2/50 mb-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="currentPity" className="w-full">
                  Current Pity
                </Label>

                <Input
                  id="currentPity"
                  name="currentPity"
                  type="number"
                  min="0"
                  max="89"
                  value={accountStatus.currentPity}
                  onChange={handlePityChange}
                  className="bg-void-1 border-void-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isGuaranteed" className="text-sm">
                  Previous 50/50
                </Label>
              </div>
              <ToggleGroup.Root
                type="single"
                className="h-9 rounded-md border flex border-void-2 bg-bg-dark"
                value={
                  accountStatus.isNextFiftyFiftyGuaranteed ? "lost" : "won"
                }
                onValueChange={(value) => {
                  if (value) {
                    handleGuaranteeChange(value === "lost");
                  }
                }}
              >
                <ToggleGroup.Item
                  value="lost"
                  className="flex-1 h-full px-4 border-box data-[state=on]:border data-[state=on]:bg-bg-dark/50 data-[state=on]:text-gold-1"
                >
                  <span className="text-sm">Lost</span>
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="won"
                  className="flex-1 h-full px-4 border-box data-[state=on]:border data-[state=on]:bg-bg-dark/50 data-[state=on]:text-gold-1"
                >
                  <span className="text-sm">Won</span>
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>
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
      </CardContent>
    </Card>
  );
}
