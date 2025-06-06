"use client";

import ConfigurationPanel from "@/app/panels/configuration/configuration-panel";
import { Sparkles } from "lucide-react";
import { observer } from "mobx-react-lite";
import { SimulationPanel } from "./panels/simulation/simulation-panel";

const WishOptimizer = observer(() => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-8xl">
      <div className="flex justify-center mb-12 mt-4">
        <div className="relative flex flex-col gap-2 items-center">
          <h1 className="h1 text-center flex flex-row items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-gold-1 to-yellow-1">
            <Sparkles className="text-gold-1" width={32} height={32} />
            <div>Wish Simulator (Beta)</div>
            <Sparkles
              className="text-yellow-1 -ml-1 -scale-x-100"
              width={32}
              height={32}
            />
          </h1>
          <div className="w-full left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-1 to-transparent"></div>
          <div className="text-white/50">{`AKA "I want Skirk, how screwed am I?"`}</div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6"> */}
      <div className="flex flex-col xl:flex-row justify-center align-center gap-6">
        <div className="overflow-auto grow-1">
          <ConfigurationPanel />
        </div>
        <div className="flex flex-col gap-6 grow-4">
          <SimulationPanel />
        </div>
      </div>
    </div>
  );
});

export default WishOptimizer;
