import "@testing-library/jest-dom";
import { configure } from "mobx";
import React from "react";
import { vi } from "vitest";

configure({ enforceActions: "never" }); // For testing

// Make React globally available for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).React = React;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
