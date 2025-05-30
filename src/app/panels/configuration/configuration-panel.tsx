"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { GenshinState } from "@/lib/mobx/genshin-state";
import { Cog } from "lucide-react";
import { observer } from "mobx-react-lite";
import { ToggleGroup } from "radix-ui";
import type React from "react";
import { EstimatedFutureWishes } from "./estimated-future-wishes";
import { WishResources } from "./wish-resources";

const ConfigurationPanel = observer(
  ({ genshinState }: { genshinState: GenshinState }) => {
    return (
      <Panel title="Configuration" icon={<Cog className="w-h4 h-h4" />}>
        <div className="space-y-4 @container/config">
          <div className="grid grid-cols-2 @sm/config:grid-cols-4 gap-2">
            <Label htmlFor="currentPity" className="my-auto text-sm">
              Pity
            </Label>
            <Input
              className="w-full"
              id="currentPity"
              isLoading={genshinState.isLoading}
              name="currentPity"
              type="number"
              min="0"
              max="89"
              value={genshinState.accountStatusCurrentPity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                genshinState.setAccountStatusCurrentPity(
                  parseInt(e.target.value) || 0
                )
              }
              showPlusMinus
              width={"w-full"}
            />
            <Label htmlFor="isGuaranteed" className="my-auto text-sm">
              Last 50/50
            </Label>
            <ToggleGroup.Root
              type="single"
              className="items-center justify-center rounded-lg p-1 text-muted-foreground grid grid-cols-2 bg-void-1"
              value={
                genshinState.accountStatusIsNextFiftyFiftyGuaranteed
                  ? "lost"
                  : "won"
              }
              onValueChange={(value) => {
                if (value) {
                  genshinState.setAccountStatusIsNextFiftyFiftyGuaranteed(
                    value === "lost"
                  );
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
          <WishResources />
          <Separator className="bg-void-2/50" />
          <EstimatedFutureWishes
            estimatedNewWishesPerBanner={
              genshinState.estimatedNewWishesPerBanner
            }
            primogemSources={genshinState.accountStatusPrimogemSources}
            handlePrimogemSourceChange={
              genshinState.setAccountStatusPrimogemSources
            }
            excludeCurrentBannerPrimogems={
              genshinState.accountStatusExcludeCurrentBannerPrimogemSources
            }
            handleExcludeCurrentBannerPrimogemSourcesChange={
              genshinState.setAccountStatusExcludeCurrentBannerPrimogemSources
            }
          />
        </div>
      </Panel>
    );
  }
);

export default ConfigurationPanel;
