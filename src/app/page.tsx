/* eslint-disable mobx/missing-observer */
"use client";
import WishOptimizer from "@/app/wish-optimizer";
import { ChangelogFooterButton } from "@/components/changelog/changelog-footer-button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-void-1 to-bg-dark-2 ">
      <WishOptimizer />
      <div className="m-auto w-full mt-4 p-6 text-center text-white/20 text-xs flex flex-col justify-center">
        <div className="mb-6 text-white/40">
          <ChangelogFooterButton />
        </div>
        <div>Irminsul.io © 2025 • contact@irminsul.io</div>

        <div>
          Genshin Impact, game content and materials are trademarks and
          copyrights of HoYoverse.
        </div>
      </div>
    </main>
  );
}
