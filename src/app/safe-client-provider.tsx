/* eslint-disable mobx/missing-observer */
"use client";

import { GenshinProvider } from "@/lib/mobx/genshin-context";
import { ResponsiveProvider } from "@/lib/responsive-design/responsive-context";
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
      <ResponsiveProvider>{children}</ResponsiveProvider>
    </GenshinProvider>
  );
}
