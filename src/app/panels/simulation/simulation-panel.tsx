import SimulationPanelContent from "@/app/panels/simulation/playground-mode";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import { AppMode } from "@/lib/types";
import { TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Sparkles } from "lucide-react";

export const SimulationPanel = () => {
  const { mode } = useGenshinState();
  const { switchMode } = useGenshinActions();
  return (
    <Tabs
      defaultValue="playground"
      value={mode}
      onValueChange={(value) => switchMode(value as AppMode)}
    >
      <Panel
        title="Simulation"
        icon={<Sparkles className="w-h4 h-h4" />}
        topRight={
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
        }
      >
        <div className="@container/sim">
          <SimulationPanelContent />
        </div>
      </Panel>
    </Tabs>
  );
};
