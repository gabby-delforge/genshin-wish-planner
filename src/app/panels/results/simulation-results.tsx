import ScenariosGrid from "@/components/simulation-results/scenarios-grid";
import { SimulationResultsGrid } from "@/components/simulation-results/simulation-results-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenshinState } from "@/lib/mobx/genshin-context";
import { observer } from "mobx-react-lite";
import RunSimulationButton from "../simulation/run-simulation-button";

export const SimulationResults = observer(() => {
  const {
    playgroundSimulationResults,
    optimizerSimulationResults,
    isSimulating,
    mode,
    banners,
    trackResultsTabViewed,
  } = useGenshinState();

  const noResults = (
    <div className="bg-void-1 rounded-md p-4 text-center">
      {isSimulating ? (
        ""
      ) : (
        <p className="text-muted-foreground">
          <span>No simulation results available. </span>{" "}
          <RunSimulationButton
            customText="Run simulation"
            showSimulationCountInput={false}
            className="inline mt-0"
          />
          <span> to see results here.</span>
        </p>
      )}
    </div>
  );

  if (mode === "playground") {
    if (!playgroundSimulationResults) {
      return noResults;
    }

    return (
      <Tabs
        defaultValue="success-rates"
        onValueChange={(value) => {
          // Track tab views, mapping tab values to telemetry format
          const tabMap: Record<string, "success_rates" | "scenarios"> = {
            "success-rates": "success_rates",
            "common-scenarios": "scenarios",
          };
          const telemetryTab = tabMap[value];
          if (telemetryTab) {
            trackResultsTabViewed(telemetryTab);
          }
        }}
      >
        <TabsList className="bg-void-1 mb-4">
          <TabsTrigger
            value="success-rates"
            className="data-[state=active]:bg-void-2"
          >
            Success Rates
          </TabsTrigger>
          <TabsTrigger
            value="common-scenarios"
            className="data-[state=active]:bg-void-2"
          >
            Common Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="success-rates" className="mt-0">
          <div className="space-y-4">
            <SimulationResultsGrid />
          </div>
        </TabsContent>

        <TabsContent value="common-scenarios" className="mt-0">
          {playgroundSimulationResults?.scenarios && (
            <ScenariosGrid
              scenarios={playgroundSimulationResults.scenarios.scenarios}
              banners={banners}
            />
          )}
        </TabsContent>
      </Tabs>
    );
  } else {
    if (!optimizerSimulationResults) {
      return noResults;
    }

    return (
      <Tabs defaultValue="success-rates">
        <TabsList className="bg-void-1 mb-4">
          <TabsTrigger
            value="recommended-wishes"
            className="data-[state=active]:bg-void-2"
          >
            Recommended Wishes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended-wishes" className="mt-0">
          TODO
        </TabsContent>
      </Tabs>
    );
  }
});
