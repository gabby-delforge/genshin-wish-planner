"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useCallback } from "react";
import { useGenshin } from "@/lib/context/genshin-context";
import { AccountStatus as AccountStatusType } from "@/lib/types";
import { ToggleGroup } from "radix-ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
  const {
    accountStatus,
    totalAvailableWishes,
    estimatedNewWishesPerBanner,
    dispatch,
    isLoading,
  } = useGenshin();

  const updateAccountStatus = useCallback(
    (newStatus: AccountStatusType) => {
      dispatch({
        type: "SET_ACCOUNT_STATUS",
        payload: newStatus,
      });
    },
    [dispatch]
  );

  // Update wish resources
  const handleResourceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = Number.parseInt(value) || 0;

      updateAccountStatus({
        ...accountStatus,
        wishResources: {
          ...accountStatus.wishResources,
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
        isGuaranteed: checked,
      });
    },
    [accountStatus, updateAccountStatus]
  );

  // Update welkin/battlepass options
  const handleOptionChange = useCallback(
    (
      name:
        | "hasWelkin"
        | "hasBattlePass"
        | "addEstimatedWishes"
        | "addExplorationWishes",
      checked: boolean
    ) => {
      updateAccountStatus({
        ...accountStatus,
        [name]: checked,
      });
    },
    [accountStatus, updateAccountStatus]
  );

  if (isLoading) {
    return <SkeletonAccountStatus />;
  }

  return (
    <Card className="bg-[#2a2c42]/80 border-[#4a4c72] backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-[#f5d0a9]">Account Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="currentPity" className="text-sm">
                  Current Pity
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Your current pity count on the character event banner
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="currentPity"
                name="currentPity"
                type="number"
                min="0"
                max="89"
                value={accountStatus.currentPity}
                onChange={handlePityChange}
                className="bg-[#1a1b2e] border-[#4a4c72]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isGuaranteed" className="text-sm">
                  Previous 50/50
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Toggle if your next 5★ is guaranteed to be the featured
                        character
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ToggleGroup.Root
                type="single"
                className="h-9 rounded-md border flex border-[#4a4c72] bg-[#1a1b2e]"
                value={accountStatus.isGuaranteed ? "lost" : "won"}
                onValueChange={(value) => {
                  if (value) {
                    handleGuaranteeChange(value === "lost");
                  }
                }}
              >
                <ToggleGroup.Item
                  value="lost"
                  className="flex-1 h-full px-4 border-box data-[state=on]:border data-[state=on]:bg-[#1a1b2e]/50 data-[state=on]:text-[#f5d0a9]"
                >
                  <span className="text-sm">Lost</span>
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="won"
                  className="flex-1 h-full px-4 border-box data-[state=on]:border data-[state=on]:bg-[#1a1b2e]/50 data-[state=on]:text-[#f5d0a9]"
                >
                  <span className="text-sm">Won</span>
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>
          </div>

          <Separator className="bg-[#4a4c72]/50" />

          <div className="space-y-1">
            <Label className="text-sm text-[#f5d0a9]">Wish Resources</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="primogems" className="text-xs">
                  Primogems
                </Label>
                <Input
                  id="primogems"
                  name="primogems"
                  type="number"
                  min="0"
                  value={accountStatus.wishResources.primogems}
                  onChange={handleResourceChange}
                  className="bg-[#1a1b2e] border-[#4a4c72]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starglitter" className="text-xs">
                  Starglitter
                </Label>
                <Input
                  id="starglitter"
                  name="starglitter"
                  type="number"
                  min="0"
                  value={accountStatus.wishResources.starglitter}
                  onChange={handleResourceChange}
                  className="bg-[#1a1b2e] border-[#4a4c72]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wishes" className="text-xs">
                  Wishes
                </Label>
                <Input
                  id="wishes"
                  name="wishes"
                  type="number"
                  min="0"
                  value={accountStatus.wishResources.wishes}
                  onChange={handleResourceChange}
                  className="bg-[#1a1b2e] border-[#4a4c72]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b2e] rounded-md p-3 border border-[#4a4c72] text-sm font-medium mb-2 text-[#f5d0a9]">
            Total Available Wishes: {totalAvailableWishes}
          </div>

          <Separator className="bg-[#4a4c72]/50" />

          <div className="space-y-2">
            <Label className="text-sm text-[#f5d0a9]">
              Estimated Future Wishes
            </Label>

            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="addEstimatedWishes"
                checked={accountStatus.addEstimatedWishes}
                onCheckedChange={(checked) =>
                  handleOptionChange("addEstimatedWishes", checked === true)
                }
              />
              <Label
                htmlFor="addEstimatedWishes"
                className="text-sm cursor-pointer"
              >
                Add estimated wishes
              </Label>
            </div>

            <div className="flex flex-col space-y-2 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasWelkin"
                  checked={accountStatus.hasWelkin}
                  onCheckedChange={(checked) =>
                    handleOptionChange("hasWelkin", checked === true)
                  }
                  disabled={!accountStatus.addEstimatedWishes}
                />
                <Label
                  htmlFor="hasWelkin"
                  className={`text-sm cursor-pointer ${
                    !accountStatus.addEstimatedWishes
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  Welkin Moon
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBattlePass"
                  checked={accountStatus.hasBattlePass}
                  onCheckedChange={(checked) =>
                    handleOptionChange("hasBattlePass", checked === true)
                  }
                  disabled={!accountStatus.addEstimatedWishes}
                />
                <Label
                  htmlFor="hasBattlePass"
                  className={`text-sm cursor-pointer ${
                    !accountStatus.addEstimatedWishes
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  Battle Pass
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addExplorationWishes"
                  checked={accountStatus.addExplorationWishes}
                  onCheckedChange={(checked) =>
                    handleOptionChange("addExplorationWishes", checked === true)
                  }
                  disabled={!accountStatus.addEstimatedWishes}
                />
                <Label
                  htmlFor="addExplorationWishes"
                  className={`text-sm cursor-pointer ${
                    !accountStatus.addEstimatedWishes
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  Exploration
                </Label>
              </div>
            </div>

            <div className="bg-[#1a1b2e] rounded-md p-3 border border-[#4a4c72]">
              <div className="text-sm font-medium text-[#f5d0a9]">
                Wishes gained each banner: {estimatedNewWishesPerBanner}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-2 bg-[#1a1b2e] border-[#4a4c72] text-[#f5d0a9] hover:bg-[#2a2c42] hover:text-[#f5d0a9]"
            onClick={() =>
              updateAccountStatus({
                ...accountStatus,
                currentPity: accountStatus.currentPity + 1,
              })
            }
          >
            Increase Pity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
