// Utility functions for common telemetry needs

export const telemetryUtils = {
  // Get device type based on screen width
  getDeviceType(): "mobile" | "tablet" | "desktop" {
    if (typeof window === "undefined") return "desktop";
    
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  },

  // Get referrer safely
  getReferrer(): string | undefined {
    if (typeof document === "undefined") return undefined;
    return document.referrer || undefined;
  },

  // Truncate stack trace to avoid huge payloads
  truncateStackTrace(stackTrace: string, maxLength: number = 1000): string {
    if (stackTrace.length <= maxLength) return stackTrace;
    return stackTrace.substring(0, maxLength) + "...";
  },

  // Calculate time difference
  getTimeDifference(startTime: number): number {
    return Date.now() - startTime;
  },
};