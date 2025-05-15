"use client";
import WishOptimizer from "@/app/wish-optimizer";
import { GenshinProvider } from "@/lib/context/genshin-context";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-void-1 to-bg-dark-2 text-white">
      <GenshinProvider>
        <WishOptimizer />
      </GenshinProvider>
    </main>
  );
}
