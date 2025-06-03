/* eslint-disable mobx/missing-observer */
"use client";
import { useEffect, useState } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [dataCleared, setDataCleared] = useState(false);

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

    setDataCleared(true);
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <div className="text-gray-500 text-sm">Oops! Something went wrong...</div>
      {dataCleared && (
        <>
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </>
      )}
    </div>
  );
}
