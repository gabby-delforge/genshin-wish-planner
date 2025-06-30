/* eslint-disable mobx/missing-observer */
"use client";
import React, { useEffect, useRef } from "react";

import { GenshinProvider } from "@/lib/mobx/genshin-context";
import { ResponsiveProvider } from "@/lib/responsive-design/responsive-context";
import { ChangelogProvider } from "@/components/changelog/changelog-provider";
import { usePathname } from "next/navigation";
import { telemetry, telemetryUtils } from "@/lib/telemetry";
import { initializeMixpanel } from "@/lib/telemetry/client";
import { STATE_VERSION } from "@/lib/mobx/state-version";

export default function SafeClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const appLoadTime = useRef<number>(Date.now());
  const hasTrackedAppLoad = useRef<boolean>(false);
  const hasTrackedSession = useRef<boolean>(false);

  // Track app loaded and session started
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize Mixpanel first, then track events
    const initializeAndTrack = async () => {
      const mixpanelReady = await initializeMixpanel();
      
      if (!mixpanelReady) {
        console.warn("Mixpanel not available, telemetry disabled");
        return;
      }

      // Track app_loaded event
      if (!hasTrackedAppLoad.current) {
        hasTrackedAppLoad.current = true;
        
        const loadTime = Date.now() - appLoadTime.current;
        const isReturningUser = localStorage.getItem("genshin-store") !== null;
        
        telemetry.appLoaded({
          load_time_ms: loadTime,
          is_returning_user: isReturningUser,
          state_version: STATE_VERSION,
          device_type: telemetryUtils.getDeviceType(),
        });
      }

      // Track session_started event
      if (!hasTrackedSession.current) {
        hasTrackedSession.current = true;
        
        const isReturningUser = localStorage.getItem("genshin-store") !== null;
        const referrer = telemetryUtils.getReferrer();
        
        telemetry.sessionStarted({
          is_returning_user: isReturningUser,
          device_type: telemetryUtils.getDeviceType(),
          referrer,
        });
      }
    };

    initializeAndTrack();
  }, []);

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
