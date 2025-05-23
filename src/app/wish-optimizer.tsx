"use client";

import ConfigurationPanel from "@/app/panels/configuration/configuration-panel";
import SimulationResultsPanel from "@/app/panels/results/simulation-results-panel";
import { SimulationPanel } from "./panels/simulation/simulation-panel";

export default function WishOptimizer() {
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

      {/* <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6"> */}
      <div className="flex flex-col xl:flex-row justify-center align-center gap-6">
        <div className="overflow-auto grow-1">
          <ConfigurationPanel />
        </div>
        <div className="flex flex-col gap-6 grow-2">
          <SimulationPanel />
          <SimulationResultsPanel />
        </div>
      </div>
    </div>
  );
}
