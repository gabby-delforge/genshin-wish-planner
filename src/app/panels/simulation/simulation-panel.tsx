import SimulationPanelContent from "@/app/panels/simulation/simulation-panel-content";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelBasic } from "@/components/ui/panel-basic";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FLAGS } from "@/lib/feature-flags";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { GenshinState } from "@/lib/mobx/genshin-state";
import { AppMode } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { observer } from "mobx-react-lite";
import { SimulationResults } from "../results/simulation-results";

export const SimulationPanel = observer(
  ({ genshinState }: { genshinState: GenshinState }) => {
    const { mode, switchMode } = useGenshinState();
    return (
      <Tabs
        defaultValue="playground"
        value={mode}
        onValueChange={(value) => switchMode(value as AppMode)}
      >
        <PanelBasic>
          <div className="absolute top-0 right-0 mr-3 mt-3">
            {FLAGS.STRATEGY_MODE ? (
              <TabsList className="grid grid-cols-2 bg-void-1 items-center justify-center rounded-lg p-1 text-muted-foreground">
                <TabsTrigger
                  value="playground"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:bg-void-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Playground</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="strategy"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:bg-void-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Strategy</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            ) : null}
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="pb-2">
              <div className="flex w-full justify-between">
                <div className="flex items-center gap-2 h4">
                  <Sparkles className="w-h4 h-h4" />
                  Simulation
                </div>
              </div>
            </CardTitle>
            <Separator className="bg-void-2/50 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="@container/sim">
              <SimulationPanelContent genshinState={genshinState} />
            </div>
          </CardContent>
          <Separator className="bg-void-2 mb-2" />

          <CardHeader className="pb-2">
            <CardTitle className="h4 pb-2">
              <div className="flex w-full justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-h4 h-h4" />
                  Results
                </div>
              </div>
            </CardTitle>
            <Separator className="bg-void-2/50 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="@container/sim">
              <SimulationResults />
            </div>
          </CardContent>
        </PanelBasic>
      </Tabs>
    );
  }
);
