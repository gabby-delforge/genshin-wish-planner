"use client";
import WishOptimizer from "@/app/wish-optimizer";
import { observer } from "mobx-react-lite";

const Home = observer(function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-void-1 to-bg-dark-2 ">
      <WishOptimizer />
    </main>
  );
});

export default Home;
