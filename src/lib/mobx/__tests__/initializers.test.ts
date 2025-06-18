import { describe, expect, it } from "vitest";
import {
  ApiBanner,
  BannerConfiguration,
  BannerId,
  DEFAULT_PRIORITY,
} from "../../types";
import {
  initializeBannerConfigurations,
  mergeBannerConfigurations,
} from "../initializers";

describe("mergeBannerConfigurations", () => {
  const mockBanners: ApiBanner[] = [
    {
      id: "5.7v1" as BannerId,
      version: "5.7v1",
      name: "5.7 Phase 1",
      startDate: "2025-06-17T00:00:00-05:00",
      endDate: "2025-07-08T00:00:00-05:00",
      characters: ["skirk", "shenhe"],
      weapons: ["azurelight", "calamity-queller"],
    },
    {
      id: "5.7v2" as BannerId,
      version: "5.7v2",
      name: "5.7 Phase 2",
      startDate: "2025-07-08T00:00:00-05:00",
      endDate: "2025-07-29T00:00:00-05:00",
      characters: ["mavuika", "emilie"],
      weapons: ["a-thousand-blazing-suns", "lumidouce-elegy"],
    },
    {
      id: "5.8v1" as BannerId,
      version: "5.8v1",
      name: "5.8 Phase 1",
      startDate: "2025-07-29T00:00:00-05:00",
      endDate: "2025-08-19T00:00:00-05:00",
      characters: ["ineffa", "mualani"],
      weapons: ["fractured-halo", "surfs-up"],
    },
  ];

  it("should preserve existing stored configurations", () => {
    const storedConfigurations: Record<BannerId, BannerConfiguration> = {
      "5.7v1": {
        bannerId: "5.7v1",
        isCurrentBanner: false,
        isOldBanner: false,
        characters: {
          skirk: {
            wishesAllocated: 50,
            maxConstellation: 3,
            priority: DEFAULT_PRIORITY,
          },
          shenhe: {
            wishesAllocated: 30,
            maxConstellation: 6,
            priority: DEFAULT_PRIORITY,
          },
        },
        weaponBanner: {
          wishesAllocated: 20,
          epitomizedPath: "azurelight",
          strategy: "continue",
          maxRefinement: 2,
        },
      },
    };

    const result = mergeBannerConfigurations(mockBanners, storedConfigurations);

    // Should preserve existing configuration
    expect(result["5.7v1"]).toEqual(storedConfigurations["5.7v1"]);
    expect(result["5.7v1"].characters["skirk"].wishesAllocated).toBe(50);
    expect(result["5.7v1"].characters["skirk"].maxConstellation).toBe(3);
    expect(result["5.7v1"].weaponBanner.strategy).toBe("continue");
  });

  it("should add fresh configurations for new banners", () => {
    const storedConfigurations: Record<BannerId, BannerConfiguration> = {
      "5.7v1": {
        bannerId: "5.7v1",
        isCurrentBanner: false,
        isOldBanner: false,
        characters: {
          skirk: {
            wishesAllocated: 50,
            maxConstellation: 3,
            priority: DEFAULT_PRIORITY,
          },
          shenhe: {
            wishesAllocated: 30,
            maxConstellation: 6,
            priority: DEFAULT_PRIORITY,
          },
        },
        weaponBanner: {
          wishesAllocated: 20,
          epitomizedPath: "azurelight",
          strategy: "continue",
          maxRefinement: 2,
        },
      },
    };

    const result = mergeBannerConfigurations(mockBanners, storedConfigurations);

    // Should have all banners from current data
    expect(result).toHaveProperty("5.7v1");
    expect(result).toHaveProperty("5.7v2");
    expect(result).toHaveProperty("5.8v1");

    // New banners should have fresh default configurations
    expect(result["5.7v2"].characters["mavuika"].wishesAllocated).toBe(0);
    expect(result["5.7v2"].characters["mavuika"].maxConstellation).toBe(6);
    expect(result["5.7v2"].weaponBanner.strategy).toBe("stop");
    expect(result["5.7v2"].weaponBanner.maxRefinement).toBe(0);

    expect(result["5.8v1"].characters["ineffa"].wishesAllocated).toBe(0);
    expect(result["5.8v1"].weaponBanner.epitomizedPath).toBe("fractured-halo");
  });

  it("should handle empty stored configurations", () => {
    const storedConfigurations: Record<BannerId, BannerConfiguration> = {};

    const result = mergeBannerConfigurations(mockBanners, storedConfigurations);

    // Should initialize all banners with defaults
    expect(result).toHaveProperty("5.7v1");
    expect(result).toHaveProperty("5.7v2");
    expect(result).toHaveProperty("5.8v1");

    // All should have default values
    expect(result["5.7v1"].characters["skirk"].wishesAllocated).toBe(0);
    expect(result["5.7v1"].weaponBanner.strategy).toBe("stop");
    expect(result["5.7v2"].characters["mavuika"].maxConstellation).toBe(6);
  });

  it("should handle the case where banners.json is updated with completely new banners", () => {
    // Simulate old stored config with banners that no longer exist
    const storedConfigurations: Record<BannerId, BannerConfiguration> = {
      "5.6v1": {
        bannerId: "5.6v1",
        isCurrentBanner: false,
        isOldBanner: true,
        characters: {
          "old-character": {
            wishesAllocated: 100,
            maxConstellation: 6,
            priority: DEFAULT_PRIORITY,
          },
        },
        weaponBanner: {
          wishesAllocated: 50,
          epitomizedPath: "old-weapon",
          strategy: "continue",
          maxRefinement: 4,
        },
      },
    };

    const result = mergeBannerConfigurations(mockBanners, storedConfigurations);

    // Should have all new banners
    expect(result).toHaveProperty("5.7v1");
    expect(result).toHaveProperty("5.7v2");
    expect(result).toHaveProperty("5.8v1");

    // Old banner should still be preserved (though not in current banners)
    expect(result).toHaveProperty("5.6v1");
    expect(result["5.6v1"].characters["old-character"].wishesAllocated).toBe(
      100
    );

    // New banners should have fresh configs
    expect(result["5.7v1"].characters["skirk"].wishesAllocated).toBe(0);
  });

  it("should match the behavior of initializeBannerConfigurations for new banners", () => {
    const storedConfigurations: Record<BannerId, BannerConfiguration> = {};

    const mergedResult = mergeBannerConfigurations(
      mockBanners,
      storedConfigurations
    );
    const freshResult = initializeBannerConfigurations(mockBanners);

    // Results should be identical when no stored configs exist
    expect(mergedResult).toEqual(freshResult);
  });
});
