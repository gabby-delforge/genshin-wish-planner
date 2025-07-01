"use client";

import { Panel } from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { Cog } from "lucide-react";
import { observer } from "mobx-react-lite";
import { EstimatedFutureWishes } from "./estimated-future-wishes";
import { PityStatus } from "./pity-status";
import { WishResources } from "./wish-resources";

const ConfigurationPanel = observer(() => {
  const {
    estimatedNewWishesPerBanner,
    primogemSources,
    setAccountStatusPrimogemSources,
    selectAllPrimogemSources,
    deselectAllPrimogemSources,
    shouldExcludeCurrentBannerEarnedWishes,
    setAccountStatusExcludeCurrentBannerPrimogemSources,
  } = useGenshinState();

  const handleBulkPrimogemSourceChange = (
    action: "select_all" | "deselect_all",
    category: "free_to_play" | "premium"
  ) => {
    if (action === "select_all") {
      selectAllPrimogemSources(category);
    } else {
      deselectAllPrimogemSources(category);
    }
  };
  return (
    <Panel title="Configuration" icon={<Cog className="w-h4 h-h4" />}>
      <div className="space-y-4 @container/config">
        <PityStatus />
        <Separator className="bg-void-2/50" />
        <WishResources />
        <Separator className="bg-void-2/50" />
        <EstimatedFutureWishes
          estimatedNewWishesPerBanner={estimatedNewWishesPerBanner}
          primogemSources={primogemSources}
          handlePrimogemSourceChange={setAccountStatusPrimogemSources}
          handleBulkPrimogemSourceChange={handleBulkPrimogemSourceChange}
          excludeCurrentBannerPrimogems={shouldExcludeCurrentBannerEarnedWishes}
          handleExcludeCurrentBannerPrimogemSourcesChange={
            setAccountStatusExcludeCurrentBannerPrimogemSources
          }
        />
      </div>
    </Panel>
  );
});

export default ConfigurationPanel;
