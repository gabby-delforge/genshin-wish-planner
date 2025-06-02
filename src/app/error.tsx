/* eslint-disable mobx/missing-observer */
"use client";
import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.warn("App error, resetting data:", error);

    // Clear all app-related localStorage data
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes("genshin-store")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.log(e);
        }
      });
    } catch (e) {
      console.log(e);
    }

    // Automatically reload after clearing data
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [error]);

  // This component will only be visible for a brief moment before reload
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-gray-500 text-sm">Oops! Something went wrong...</div>
    </div>
  );
}
