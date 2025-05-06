"use client";
import { GenshinProvider } from "@/lib/context/genshin-context";
import WishOptimizer from "@/components/wish-optimizer";
import ExampleComponent from "@/lib/context/example-component";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#2d2e4a] text-white">
      <GenshinProvider>
        <WishOptimizer />
      </GenshinProvider>
    </main>
  );
}
