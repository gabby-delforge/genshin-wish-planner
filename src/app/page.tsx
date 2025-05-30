"use client";
import WishOptimizer from "@/app/wish-optimizer";
import { observer } from "mobx-react-lite";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-void-1 to-bg-dark-2 ">
      <WishOptimizer />
    </main>
  );
}