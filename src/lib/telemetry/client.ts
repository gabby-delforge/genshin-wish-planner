// Mixpanel client initialization and core functionality
import type { Mixpanel } from "mixpanel-browser";

let mixpanel: Mixpanel | null = null;

const DEV_TOKEN = "0261d3322bcadc7bbf2e7a8045b65b33";
const PROD_TOKEN = "0800817846d68ec41a5a48d25107102d";

export const getMixpanel = async (): Promise<Mixpanel | null> => {
  if (typeof window === "undefined") return null;

  if (!mixpanel) {
    try {
      const mixpanelModule = await import("mixpanel-browser");
      const MixpanelLib = mixpanelModule.default;

      // Initialize Mixpanel with proper error handling
      const token =
        process.env.NODE_ENV === "development" ? DEV_TOKEN : PROD_TOKEN;
      
      if (!token) {
        // eslint-disable-next-line no-console
        console.warn("Mixpanel token is missing");
        return null;
      }

      const config = {
        debug: process.env.NODE_ENV === "development",
        track_pageview: false, // Disable automatic pageview tracking
        persistence: "localStorage" as const,
        cross_subdomain_cookie: false,
        secure_cookie: true,
        opt_out_tracking_by_default: false,
        ignore_dnt: true,
        loaded: function(mixpanel_instance: Mixpanel) {
          // This callback is called when Mixpanel is fully loaded
          mixpanel = mixpanel_instance;
        }
      };

      // Initialize Mixpanel
      MixpanelLib.init(token, config, "genshin-wish-planner");
      
      // Get the initialized instance after a delay to ensure it's ready
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // If loaded callback didn't set it, use the library directly
      if (!mixpanel) {
        mixpanel = MixpanelLib;
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load Mixpanel:", error);
      mixpanel = null;
      return null;
    }
  }

  return mixpanel;
};

// Generate unique simulation ID using Mixpanel's user ID + timestamp
export const generateSimulationId = async (): Promise<string> => {
  if (typeof window === "undefined") {
    // Fallback for SSR - just use timestamp + random
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `ssr_${timestamp}_${random}`;
  }

  try {
    const mp = await getMixpanel();
    if (mp) {
      const userId = mp.get_distinct_id();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 6);
      return `${userId}_${timestamp}_${random}`;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to get Mixpanel distinct_id:", error);
  }

  // Fallback to timestamp + random
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `client_${timestamp}_${random}`;
};

// Initialize Mixpanel early to avoid timing issues
export const initializeMixpanel = async (): Promise<boolean> => {
  try {
    const mp = await getMixpanel();
    return mp !== null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to initialize Mixpanel:", error);
    return false;
  }
};

// Helper function to safely track events
export const trackEvent = async (eventName: string, properties: object): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    const mp = await getMixpanel();
    if (mp && typeof mp.track === 'function') {
      // Wait a bit more to ensure Mixpanel is fully initialized
      await new Promise(resolve => setTimeout(resolve, 50));
      
      try {
        mp.track(eventName, properties);
      } catch (trackError) {
        // Silently fail for now to avoid console spam
        // console.warn(`Mixpanel track failed for ${eventName}:`, trackError);
      }
    }
  } catch (error) {
    console.warn(`Failed to track ${eventName}:`, error);
  }
};