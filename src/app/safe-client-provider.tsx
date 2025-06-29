/* eslint-disable mobx/missing-observer */
"use client";
import React from "react";

import { GenshinProvider } from "@/lib/mobx/genshin-context";
import { ResponsiveProvider } from "@/lib/responsive-design/responsive-context";
import { ChangelogProvider } from "@/components/changelog/changelog-provider";
import { usePathname } from "next/navigation";

export default function SafeClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (
    pathname === "/error" ||
    pathname === "/not-found" ||
    pathname === "/_error" ||
    pathname === "/404" ||
    pathname === "/500"
  ) {
    return <>{children}</>;
  }

  return (
    <GenshinProvider>
      <ResponsiveProvider>
        <ChangelogProvider>{children}</ChangelogProvider>
      </ResponsiveProvider>
    </GenshinProvider>
  );
}
