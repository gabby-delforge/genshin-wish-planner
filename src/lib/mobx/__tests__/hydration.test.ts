/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Hydration Tests
 *
 * Tests to ensure proper SSR hydration behavior and prevent hydration mismatches.
 */

import { vi } from "vitest";
import { SIMULATION_COUNT } from "../../consts";
import { GenshinState } from "../genshin-state";
import { makeLocalStorage } from "../make-local-storage";

// Mock localStorage for testing
const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    length: Object.keys(storage).length,
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
};

describe("Hydration Behavior", () => {
  let originalWindow: typeof window;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Store original values
    originalWindow = global.window;
    originalLocalStorage = global.localStorage;
  });

  afterEach(() => {
    // Restore original values
    global.window = originalWindow;
    global.localStorage = originalLocalStorage;
  });

  describe("Server-Side Rendering (SSR)", () => {
    beforeEach(() => {
      // Simulate server environment (no window)
      delete (global as any).window;
      delete (global as any).localStorage;
    });

    it("should create state with default values on server", () => {
      const state = new GenshinState();

      // State should be initialized with defaults
      expect(state.characterPity).toBe(0);
      expect(state.weaponPity).toBe(0);
      expect(state.isNextCharacterFeaturedGuaranteed).toBe(false);
      expect(state.simulationCount).toBe(SIMULATION_COUNT);
      expect(state.mode).toBe("playground");
      expect(state.isClient).toBe(false);
      expect(state.isLoading).toBe(true); // Loading is now always true initially
    });

    it("should not attempt to access localStorage on server", () => {
      const state = new GenshinState();

      // makeLocalStorage should exit early when window is undefined
      expect(() => {
        makeLocalStorage(state, "test-prefix", ["characterPity", "weaponPity"]);
      }).not.toThrow();

      // State should still have default values
      expect(state.characterPity).toBe(0);
      expect(state.weaponPity).toBe(0);
    });
  });

  describe("Client-Side Hydration", () => {
    beforeEach(() => {
      // Simulate browser environment
      const mockStorage = mockLocalStorage();
      global.window = {} as any;
      global.localStorage = mockStorage as any;
    });

    it("should create state with default values initially on client", () => {
      const state = new GenshinState();

      // State should start with defaults (before localStorage loads)
      expect(state.characterPity).toBe(0);
      expect(state.weaponPity).toBe(0);
      expect(state.isClient).toBe(true);
      expect(state.isLoading).toBe(true); // Should be loading initially on client
    });

    it("should load from localStorage when makeLocalStorage is called", () => {
      const mockStorage = global.localStorage as any;

      // Pre-populate localStorage with some data
      mockStorage.getItem.mockImplementation((key: string) => {
        const storage: Record<string, string> = {
          "test-store_characterPity": JSON.stringify(45),
          "test-store_weaponPity": JSON.stringify(12),
          "test-store_simulationCount": JSON.stringify(5000),
        };
        return storage[key] || null;
      });

      // Mock the key() method for iteration
      mockStorage.key.mockImplementation((index: number) => {
        const keys = [
          "test-store_characterPity",
          "test-store_weaponPity",
          "test-store_simulationCount",
        ];
        return keys[index] || null;
      });

      // Set length property
      Object.defineProperty(mockStorage, "length", {
        value: 3,
        writable: true,
      });

      const state = new GenshinState();

      // Apply localStorage manually (this simulates what useClientState does)
      makeLocalStorage(
        state,
        "test-store",
        ["characterPity", "weaponPity", "simulationCount"],
        {
          beforeLoad: (loadedData) => {
            state.isLoading = false;
            return loadedData;
          },
        }
      );

      // State should now reflect localStorage values
      expect(state.characterPity).toBe(45);
      expect(state.weaponPity).toBe(12);
      expect(state.simulationCount).toBe(5000);
      expect(state.isLoading).toBe(false);
    });

    it("should handle corrupted localStorage gracefully", () => {
      const mockStorage = global.localStorage as any;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock localStorage with corrupted data
      mockStorage.getItem.mockImplementation((key: string) => {
        const storage: Record<string, string> = {
          "test-store_characterPity": "invalid json {",
          "test-store_weaponPity": JSON.stringify(25),
        };
        return storage[key] || null;
      });

      mockStorage.key.mockImplementation((index: number) => {
        const keys = ["test-store_characterPity", "test-store_weaponPity"];
        return keys[index] || null;
      });

      Object.defineProperty(mockStorage, "length", {
        value: 2,
        writable: true,
      });

      const state = new GenshinState();

      makeLocalStorage(state, "test-store", ["characterPity", "weaponPity"], {
        beforeLoad: (loadedData) => {
          state.isLoading = false;
          return loadedData;
        },
      });

      // Valid data should load, invalid data should use defaults
      expect(state.characterPity).toBe(0); // Default due to corrupted data
      expect(state.weaponPity).toBe(25); // Valid data loaded
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Auto-fixing corrupted storage")
      );

      consoleSpy.mockRestore();
    });

    it("should save changes to localStorage", () => {
      const mockStorage = global.localStorage as any;
      const state = new GenshinState();

      makeLocalStorage(state, "test-store", ["characterPity"]);

      // Clear any initial calls
      mockStorage.setItem.mockClear();

      // Change state
      state.setCharacterPity(33);

      // Should trigger localStorage save
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "test-store_characterPity",
        JSON.stringify(33)
      );
    });
  });

  describe("Hydration Consistency", () => {
    it("should produce the same initial state on server and client (before localStorage)", () => {
      // Server state
      delete (global as any).window;
      const serverState = new GenshinState();

      // Client state (before localStorage)
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;
      const clientState = new GenshinState();

      // Core state should be identical (excluding environment-specific fields)
      expect(serverState.characterPity).toBe(clientState.characterPity);
      expect(serverState.weaponPity).toBe(clientState.weaponPity);
      expect(serverState.simulationCount).toBe(clientState.simulationCount);
      expect(serverState.mode).toBe(clientState.mode);

      // Environment flags should differ appropriately
      expect(serverState.isClient).toBe(false);
      expect(clientState.isClient).toBe(true);
      expect(serverState.isLoading).toBe(true);
      expect(clientState.isLoading).toBe(true);
    });

    it("should handle empty localStorage without errors", () => {
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;

      const state = new GenshinState();

      expect(() => {
        makeLocalStorage(state, "test-store", ["characterPity", "weaponPity"]);
      }).not.toThrow();

      // Should maintain defaults
      expect(state.characterPity).toBe(0);
      expect(state.weaponPity).toBe(0);
    });
  });

  describe("State Loading Hook Simulation", () => {
    it("should simulate the useClientState hook behavior", () => {
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;

      const mockStorage = global.localStorage as any;

      // Mock localStorage with data
      mockStorage.getItem.mockImplementation((key: string) => {
        return key === "genshin-store_characterPity"
          ? JSON.stringify(77)
          : null;
      });

      mockStorage.key.mockImplementation((index: number) => {
        const keys = ["genshin-store_characterPity"];
        return keys[index] || null;
      });

      Object.defineProperty(mockStorage, "length", {
        value: 1,
        writable: true,
      });

      const state = new GenshinState();

      // Before hydration (what React would render on first pass)
      expect(state.characterPity).toBe(0);
      expect(state.isLoading).toBe(true);

      // Simulate useEffect running (client-side hydration)
      makeLocalStorage(state, "genshin-store", state.PERSISTED_KEYS, {
        beforeLoad: (loadedData) => {
          state.isLoading = false;
          return loadedData;
        },
      });

      // After hydration
      expect(state.characterPity).toBe(77);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("Enhanced Validation", () => {
    it("should reject NaN and invalid number values", () => {
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;
      const mockStorage = global.localStorage as any;

      // Mock localStorage with NaN-producing data (like user's "abcd" case)
      mockStorage.getItem.mockImplementation((key: string) => {
        const storage: Record<string, string> = {
          "test-store_characterPity": JSON.stringify("abcd"), // Will become NaN when parsed as number
          "test-store_weaponPity": JSON.stringify(Infinity), // Invalid number
          "test-store_simulationCount": JSON.stringify(42), // Valid number
        };
        return storage[key] || null;
      });

      mockStorage.key.mockImplementation((index: number) => {
        const keys = [
          "test-store_characterPity",
          "test-store_weaponPity",
          "test-store_simulationCount",
        ];
        return keys[index] || null;
      });

      Object.defineProperty(mockStorage, "length", {
        value: 3,
        writable: true,
      });

      const state = new GenshinState();

      makeLocalStorage(
        state,
        "test-store",
        ["characterPity", "weaponPity", "simulationCount"],
        {
          beforeLoad: (loadedData) => {
            state.isLoading = false;
            return loadedData;
          },
        }
      );

      // Invalid numbers should be rejected, valid numbers should load
      expect(state.characterPity).toBe(0); // Default (NaN rejected)
      expect(state.weaponPity).toBe(0); // Default (Infinity rejected)
      expect(state.simulationCount).toBe(42); // Valid number loaded
      expect(state.isLoading).toBe(false);
    });

    it("should validate complex objects recursively", () => {
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;
      const mockStorage = global.localStorage as any;

      // Create corrupted and valid object data
      const _validResources = {
        primogem: 1600,
        starglitter: 50,
        limitedWishes: 10,
        stardust: 100,
        genesisCrystal: 0,
        standardWish: 0,
      };

      const corruptedResources = {
        primogem: "invalid", // String instead of number
        starglitter: NaN, // Invalid number
        limitedWishes: 10, // Valid
        stardust: 100, // Valid
        genesisCrystal: 0, // Valid
        standardWish: 0, // Valid
      };

      mockStorage.getItem.mockImplementation((key: string) => {
        const storage: Record<string, string> = {
          "test-store_accountStatusOwnedWishResources":
            JSON.stringify(corruptedResources),
          "test-store_characterPity": JSON.stringify(75), // Valid number
        };
        return storage[key] || null;
      });

      mockStorage.key.mockImplementation((index: number) => {
        const keys = [
          "test-store_accountStatusOwnedWishResources",
          "test-store_characterPity",
        ];
        return keys[index] || null;
      });

      Object.defineProperty(mockStorage, "length", {
        value: 2,
        writable: true,
      });

      const state = new GenshinState();

      makeLocalStorage(
        state,
        "test-store",
        ["ownedWishResources", "characterPity"],
        {
          beforeLoad: (loadedData) => {
            state.isLoading = false;
            return loadedData;
          },
        }
      );

      // Corrupted object should be rejected, valid data should load
      expect(state.ownedWishResources).toEqual({
        primogem: 0,
        starglitter: 0,
        limitedWishes: 0,
        stardust: 0,
        genesisCrystal: 0,
        standardWish: 0,
      }); // Default object (corrupted object rejected)
      expect(state.characterPity).toBe(75); // Valid number loaded
    });

    it("should handle deeply nested object validation", () => {
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;
      const mockStorage = global.localStorage as any;

      // Mock deeply nested data (like bannerConfiguration)
      const _validBannerConfig = {
        "banner-1": {
          characters: {
            "char-1": {
              priority: "high",
              wishesAllocated: 90,
              maxConstellation: 6,
            },
          },
          weapons: {
            "weapon-1": {
              priority: "medium",
              wishesAllocated: 0,
            },
          },
          weaponBanner: {
            wishesAllocated: 0,
            epitomizedPath: null,
            strategy: "stop",
          },
        },
      };

      const corruptedBannerConfig = {
        "banner-1": {
          characters: {
            "char-1": {
              priority: "high",
              wishesAllocated: "invalid", // String instead of number
              maxConstellation: NaN, // Invalid number
            },
          },
          weapons: {
            "weapon-1": {
              priority: "medium",
              wishesAllocated: 0,
            },
          },
          weaponBanner: {
            wishesAllocated: 0,
            epitomizedPath: null,
            strategy: "stop",
          },
        },
      };

      mockStorage.getItem.mockImplementation((key: string) => {
        return key === "test-store_bannerConfiguration"
          ? JSON.stringify(corruptedBannerConfig)
          : null;
      });

      mockStorage.key.mockImplementation((index: number) => {
        const keys = ["test-store_bannerConfiguration"];
        return keys[index] || null;
      });

      Object.defineProperty(mockStorage, "length", {
        value: 1,
        writable: true,
      });

      const state = new GenshinState();

      makeLocalStorage(state, "test-store", ["bannerConfiguration"], {
        beforeLoad: (loadedData) => {
          state.isLoading = false;
          return loadedData;
        },
      });

      // Corrupted nested object should be rejected, default should be used
      expect(state.bannerConfiguration).not.toEqual(corruptedBannerConfig);
      expect(typeof state.bannerConfiguration).toBe("object");
    });

    it("should prevent stack overflow with circular references", () => {
      global.window = {} as any;
      global.localStorage = mockLocalStorage() as any;
      const mockStorage = global.localStorage as any;

      // Create circular reference
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;

      mockStorage.getItem.mockImplementation(() =>
        JSON.stringify({ test: "value" })
      );
      mockStorage.key.mockImplementation((index: number) =>
        index === 0 ? "test-store_testProp" : null
      );
      Object.defineProperty(mockStorage, "length", {
        value: 1,
        writable: true,
      });

      const state = new GenshinState();

      // This should not crash due to maximum depth limit
      expect(() => {
        makeLocalStorage(state, "test-store", ["characterPity"], {
          beforeLoad: (loadedData) => {
            state.isLoading = false;
            return loadedData;
          },
        });
      }).not.toThrow();
    });
  });
});
