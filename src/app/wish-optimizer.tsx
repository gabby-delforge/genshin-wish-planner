"use client";

import AccountStatus from "@/app/account-status/account-status";
import PlaygroundMode from "@/app/playground-mode";
import SimulationResults from "@/app/simulation-results";
import StrategyMode from "@/app/strategy-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenshinState } from "@/lib/context/genshin-context";
import { useGenshinActions } from "@/lib/context/useGenshinActions";
import type { AppMode } from "@/lib/types";
import { Sparkles } from "lucide-react";

export default function WishOptimizer() {
  const { mode } = useGenshinState();
  const { switchMode } = useGenshinActions();

  return (
    <div className="container mx-auto py-8 px-4 max-w-8xl">
      <div className="flex justify-center mb-8">
        <div className="relative">
          <h1 className="h0 text-center text-transparent bg-clip-text bg-gradient-to-r from-gold-1 to-yellow-1">
            Genshin Impact Wish Planner
          </h1>
          <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-1 to-transparent"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        <AccountStatus />

        <div className="lg:col-span-3 h-full">
          <Card className="bg-bg-dark-2/80 border-void-2 backdrop-blur-sm h-full">
            <Tabs
              defaultValue="playground"
              value={mode}
              onValueChange={(value) => switchMode(value as AppMode)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="h4 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-h4 h-h4" />{" "}
                      {/* TODO: This size isn't working properly */}
                      Simulation
                    </div>
                  </div>
                  <TabsList className="grid grid-cols-2  bg-void-1">
                    <TabsTrigger
                      value="playground"
                      className="data-[state=active]:bg-void-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-md">Playground</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="strategy"
                      className="data-[state=active]:bg-void-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-md">Strategy</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </CardTitle>
                <Separator className="bg-void-2/50 mb-2" />
              </CardHeader>
              <CardContent>
                <TabsContent value="playground" className="mt-0">
                  <PlaygroundMode />
                </TabsContent>

                <TabsContent value="strategy" className="mt-0">
                  <StrategyMode />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <SimulationResults />
    </div>
  );
}
