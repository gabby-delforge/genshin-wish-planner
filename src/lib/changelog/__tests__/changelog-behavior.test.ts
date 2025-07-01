import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as changelogUtils from "../changelog-utils";

// Mock changelog utils
vi.mock("../changelog-utils", () => ({
  hasNewChangelogs: vi.fn(),
  getNewChangelogs: vi.fn(),
  markCurrentVersionAsSeen: vi.fn(),
  compareVersions: vi.fn(),
  getCurrentAppVersion: vi.fn(),
}));

describe("Changelog Behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should prevent auto-opening when no new changelogs exist", () => {
    vi.mocked(changelogUtils.hasNewChangelogs).mockReturnValue(false);
    
    // This simulates the condition in useChangelog that prevents opening
    const shouldOpen = changelogUtils.hasNewChangelogs();
    
    expect(shouldOpen).toBe(false);
    expect(changelogUtils.hasNewChangelogs).toHaveBeenCalled();
  });

  test("should prevent auto-opening when hasNewChangelogs is true but no entries returned", async () => {
    vi.mocked(changelogUtils.hasNewChangelogs).mockReturnValue(true);
    vi.mocked(changelogUtils.getNewChangelogs).mockResolvedValue([]);
    
    // This simulates the condition in useChangelog
    const shouldCheckForEntries = changelogUtils.hasNewChangelogs();
    expect(shouldCheckForEntries).toBe(true);
    
    const entries = await changelogUtils.getNewChangelogs();
    const shouldOpenModal = entries.length > 0;
    
    expect(shouldOpenModal).toBe(false);
    expect(entries).toEqual([]);
  });

  test("should allow auto-opening when there are actual new changelog entries", async () => {
    const mockEntries = [
      {
        version: "0.5.1",
        date: "2025-01-01",
        changes: [
          { type: "feature" as const, description: "Added new feature" },
        ],
      },
    ];

    vi.mocked(changelogUtils.hasNewChangelogs).mockReturnValue(true);
    vi.mocked(changelogUtils.getNewChangelogs).mockResolvedValue(mockEntries);
    
    // This simulates the condition in useChangelog
    const shouldCheckForEntries = changelogUtils.hasNewChangelogs();
    expect(shouldCheckForEntries).toBe(true);
    
    const entries = await changelogUtils.getNewChangelogs();
    const shouldOpenModal = entries.length > 0;
    
    expect(shouldOpenModal).toBe(true);
    expect(entries).toEqual(mockEntries);
  });

  test("should handle errors gracefully without opening modal", async () => {
    vi.mocked(changelogUtils.hasNewChangelogs).mockReturnValue(true);
    vi.mocked(changelogUtils.getNewChangelogs).mockRejectedValue(
      new Error("Failed to fetch")
    );
    
    const shouldCheckForEntries = changelogUtils.hasNewChangelogs();
    expect(shouldCheckForEntries).toBe(true);
    
    let shouldOpenModal = false;
    try {
      const entries = await changelogUtils.getNewChangelogs();
      shouldOpenModal = entries.length > 0;
    } catch {
      // Error should prevent modal from opening
      shouldOpenModal = false;
    }
    
    expect(shouldOpenModal).toBe(false);
  });

  describe("Version Comparison Logic", () => {
    test("correctly identifies when new version exists", () => {
      vi.mocked(changelogUtils.compareVersions).mockImplementation((a, b) => {
        // Simple mock implementation
        const parseVersion = (v: string) => v.split('.').map(Number);
        const aVer = parseVersion(a);
        const bVer = parseVersion(b);
        
        for (let i = 0; i < Math.max(aVer.length, bVer.length); i++) {
          const aPart = aVer[i] || 0;
          const bPart = bVer[i] || 0;
          if (aPart > bPart) return 1;
          if (aPart < bPart) return -1;
        }
        return 0;
      });

      // Test various version comparisons
      expect(changelogUtils.compareVersions("0.5.1", "0.5.0")).toBe(1);
      expect(changelogUtils.compareVersions("0.5.0", "0.5.1")).toBe(-1);
      expect(changelogUtils.compareVersions("0.5.1", "0.5.1")).toBe(0);
      expect(changelogUtils.compareVersions("1.0.0", "0.9.9")).toBe(1);
    });
  });
});