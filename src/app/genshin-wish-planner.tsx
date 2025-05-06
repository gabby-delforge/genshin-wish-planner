"use client";
import React from "react";
import SimulationResults from "@/components/simulation-results";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountStatus from "@/components/account-status";
import { useGenshin } from "./context/GenshinContext";
import PlaygroundMode from "@/components/playground-mode";
import StrategyMode from "@/components/strategy-mode";
import { AppMode } from "./types";
import { SimulationResults as LibSimulationResults } from "@/lib/types";
const GenshinWishPlanner = () => {
  const {
    mode,
    switchMode,
    accountStatus,
    setAccountStatus,
    totalAvailableWishes,
    estimatedNewWishesPerBanner,
    banners,
    setBanners,
    simulations,
    setSimulations,
    isSimulating,
    playground,
    optimizer,
  } = useGenshin();
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-center mb-8">
        <div className="relative">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#f5d0a9] to-[#f9f9c5]">
            Genshin Impact Wish Planner
          </h1>
          <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f5d0a9] to-transparent"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AccountStatus
          accountStatus={accountStatus}
          setAccountStatus={setAccountStatus}
          totalWishes={totalAvailableWishes}
          estimatedFutureWishes={estimatedNewWishesPerBanner}
        />

        <div className="lg:col-span-2">
          <Card className="bg-[#2a2c42]/80 border-[#4a4c72] backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs
                defaultValue="playground"
                value={mode}
                onValueChange={(value) => switchMode(value as AppMode)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-6 bg-[#1a1b2e]">
                  <TabsTrigger
                    value="playground"
                    className="data-[state=active]:bg-[#4a4c72]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">Playground</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="strategy"
                    className="data-[state=active]:bg-[#4a4c72]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">Strategy</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="playground" className="mt-0">
                  <PlaygroundMode
                    banners={banners}
                    setBanners={setBanners}
                    runSimulation={playground.runSimulation}
                    isSimulating={isSimulating}
                    simulationCount={simulations}
                    setSimulationCount={setSimulations}
                  />
                </TabsContent>

                <TabsContent value="strategy" className="mt-0">
                  <StrategyMode
                    banners={banners}
                    setBanners={setBanners}
                    runSimulation={optimizer.runSimulation}
                    isSimulating={isSimulating}
                    simulationCount={simulations}
                    setSimulationCount={setSimulations}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {mode === "playground" && playground.simulationResults && (
        <SimulationResults
          results={playground.simulationResults as unknown as LibSimulationResults}
          scenarios={playground.simulationResults?.scenarioBreakdown}
          mode={mode}
        />
      )}
      {mode === "strategy" && optimizer.simulationResults && (
        <SimulationResults
          results={optimizer.simulationResults as unknown as LibSimulationResults}
          scenarios={optimizer.simulationResults?.scenarioBreakdown}
          mode={mode}
        />
      )}
    </div>
  );
};

export default GenshinWishPlanner;
