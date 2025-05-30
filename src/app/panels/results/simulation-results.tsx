import ScenariosGrid from "@/components/scenarios-grid";
import { SimulationResultsGrid } from "@/components/simulation-results-grid";
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
      <Tabs defaultValue="success-rates">
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
            <h3 className="text-lg font-medium">Success Rates by Character</h3>
            <SimulationResultsGrid
              simulationResults={playgroundSimulationResults}
            />
          </div>
        </TabsContent>

        <TabsContent value="common-scenarios" className="mt-0">
          {playgroundSimulationResults?.topScenarios && (
            <ScenariosGrid
              scenarioResults={playgroundSimulationResults?.topScenarios}
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
