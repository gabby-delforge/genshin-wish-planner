/* eslint-disable mobx/missing-observer */
"use client";

import { useEffect } from "react";

function clearAppData() {
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
}

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.warn("Global error handler triggered:", event.error?.message);
      event.preventDefault(); // Prevent the default browser error handling
      clearAppData();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn("Unhandled promise rejection:", event.reason);
      event.preventDefault(); // Prevent the default browser error handling
      clearAppData();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Add error listeners immediately
    window.addEventListener("error", handleError, true); // Use capture phase
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
      true
    );

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        true
      );
    };
  }, []);

  return null;
}
