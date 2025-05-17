// app/safe-client-provider.tsx
"use client";

import { GenshinProvider } from "@/lib/context/genshin-context";
import { usePathname } from "next/navigation";

export default function SafeClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // For error pages, don't wrap with your custom providers
  if (
    pathname === "/error" ||
    pathname === "/not-found" ||
    pathname === "/_error" ||
    pathname === "/404" ||
    pathname === "/500"
  ) {
    return <>{children}</>;
  }

  return <GenshinProvider>{children}</GenshinProvider>;
}
