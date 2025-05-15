"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenshin } from "@/lib/context/genshin-context";
import ScenariosGrid from "@/components/scenarios-grid";
import { SimulationResultsGrid } from "@/components/simulation-results-grid";

export default function SimulationResults() {
  const { mode, playgroundSimulationResults, banners } = useGenshin();

  return (
    <Card className="bg-bg-dark-2/80 border-void-2 backdrop-blur-sm mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gold-1">
          Simulation Results
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {mode === "strategy" && (
              <TabsTrigger
                value="recommended-wishes"
                className="data-[state=active]:bg-void-2"
              >
                Recommended Wishes
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="success-rates" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Success Rates by Character
              </h3>
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
      </CardContent>
    </Card>
  );
}
