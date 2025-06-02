/* eslint-disable mobx/missing-observer */
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SilentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Catch any error and reset user data
    console.warn("Error boundary caught error:", error.message);
    return { hasError: true };
  }

  componentDidCatch(error: Error, _errorInfo: unknown) {
    console.warn("App error encountered, resetting data:", error.message);

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
      // If localStorage is completely broken, just continue
    }

    // Reload the page to restart with clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      // Show nothing - just a brief flash while we auto-recover
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      );
    }

    return this.props.children;
  }
}
