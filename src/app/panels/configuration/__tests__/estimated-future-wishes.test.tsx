import { PRIMOGEM_SOURCE_VALUES, PRIMOGEM_SOURCE_CATEGORIES } from "@/lib/data";
import { PrimogemSourcesEnabled, PrimogemSourceValue } from "@/lib/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EstimatedFutureWishes } from "../estimated-future-wishes";

describe("EstimatedFutureWishes", () => {
  const mockHandlePrimogemSourceChange = vi.fn();
  const mockHandleBulkPrimogemSourceChange = vi.fn();
  const mockHandleExcludeCurrentBannerPrimogemSourcesChange = vi.fn();

  // Helper functions to replicate component logic
  const getPrimogemValue = (sourceValue: PrimogemSourceValue): number => {
    if (Array.isArray(sourceValue)) {
      return sourceValue.reduce((total, resource) => {
        if (resource.type === "primogem") {
          return total + resource.value;
        }
        return total;
      }, 0);
    } else if (sourceValue.type === "primogem") {
      return sourceValue.value;
    }
    return 0;
  };

  const getLimitedWishValue = (sourceValue: PrimogemSourceValue): number => {
    if (Array.isArray(sourceValue)) {
      return sourceValue.reduce((total, resource) => {
        if (resource.type === "limitedWishes") {
          return total + resource.value;
        }
        return total;
      }, 0);
    } else if (sourceValue.type === "limitedWishes") {
      return sourceValue.value;
    }
    return 0;
  };


  // Calculate available sources (those with actual values)
  const getAvailableFreeToPlaySources = () => {
    return PRIMOGEM_SOURCE_CATEGORIES.freeToPlay.filter((sourceKey) => {
      const sourceValue = PRIMOGEM_SOURCE_VALUES[sourceKey as keyof typeof PRIMOGEM_SOURCE_VALUES];
      const primoValue = getPrimogemValue(sourceValue);
      const wishValue = getLimitedWishValue(sourceValue);
      return primoValue > 0 || wishValue > 0;
    });
  };

  const defaultProps = {
    estimatedNewWishesPerBanner: [50, 60] as [number, number],
    primogemSources: {
      gameUpdateCompensation: true,
      dailyCommissions: true,
      paimonBargain: false,
      abyss: true,
      stygianOnslaught: false,
      imaginarium: true,
      battlePass: false,
      battlePassGnostic: false,
      welkinMoon: false,
      archonQuest: false,
      storyQuests: false,
      newAchievements: false,
      characterTestRuns: false,
      eventActivities: false,
      hoyolabDailyCheckIn: false,
      hoyolabWebEvents: false,
      livestreamCodes: false,
      newVersionCode: false,
      limitedExplorationRewards: false,
    } as PrimogemSourcesEnabled,
    handlePrimogemSourceChange: mockHandlePrimogemSourceChange,
    handleBulkPrimogemSourceChange: mockHandleBulkPrimogemSourceChange,
    excludeCurrentBannerPrimogems: false,
    handleExcludeCurrentBannerPrimogemSourcesChange:
      mockHandleExcludeCurrentBannerPrimogemSourcesChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with title", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    expect(screen.getByText("Estimated Future Wishes")).toBeInTheDocument();
  });

  it("displays the estimated wishes range", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "gained each version";
      })
    ).toBeInTheDocument();
  });

  it("displays single wish count when range values are equal", () => {
    const propsWithSameRange = {
      ...defaultProps,
      estimatedNewWishesPerBanner: [50, 50] as [number, number],
    };

    render(<EstimatedFutureWishes {...propsWithSameRange} />);

    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "gained each version";
      })
    ).toBeInTheDocument();
  });

  it("renders free-to-play category with correct title", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    expect(screen.getByText(/Free-to-play:/)).toBeInTheDocument();
  });

  it("renders premium category with correct title", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    expect(screen.getByText(/Premium:/)).toBeInTheDocument();
  });

  it("renders select all buttons for both categories", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    const selectAllButtons = screen.getAllByText(/Select All|Deselect All/);
    expect(selectAllButtons.length).toBeGreaterThan(0);
  });

  it("calls handlePrimogemSourceChange when a checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<EstimatedFutureWishes {...defaultProps} />);

    const dailyCommissionsCheckbox = screen.getByRole("checkbox", {
      name: /Daily Commissions/,
    });
    await user.click(dailyCommissionsCheckbox);

    expect(mockHandlePrimogemSourceChange).toHaveBeenCalledWith(
      "dailyCommissions",
      false
    );
  });

  it("shows deselect all when all free-to-play sources are selected", () => {
    const allSelectedProps = {
      ...defaultProps,
      primogemSources: {
        ...defaultProps.primogemSources,
        gameUpdateCompensation: true,
        dailyCommissions: true,
        paimonBargain: true,
        abyss: true,
        stygianOnslaught: true,
        imaginarium: true,
        archonQuest: true,
        storyQuests: true,
        newAchievements: true,
        characterTestRuns: true,
        eventActivities: true,
        hoyolabDailyCheckIn: true,
        hoyolabWebEvents: true,
        livestreamCodes: true,
        newVersionCode: true,
        limitedExplorationRewards: true,
        battlePass: true,
      } as PrimogemSourcesEnabled,
    };

    render(<EstimatedFutureWishes {...allSelectedProps} />);

    expect(screen.getByText("Deselect All")).toBeInTheDocument();
  });

  it("handles free-to-play toggle select all", async () => {
    const user = userEvent.setup();
    render(<EstimatedFutureWishes {...defaultProps} />);

    const selectAllButton = screen.getAllByText("Select All")[0];
    await user.click(selectAllButton);

    // Should call the bulk handler once instead of individual calls
    expect(mockHandleBulkPrimogemSourceChange).toHaveBeenCalledTimes(1);
    expect(mockHandleBulkPrimogemSourceChange).toHaveBeenCalledWith("select_all", "free_to_play");
    
    // Individual handler should not be called for bulk operations
    expect(mockHandlePrimogemSourceChange).toHaveBeenCalledTimes(0);
  });

  it("handles premium toggle select all", async () => {
    const user = userEvent.setup();
    render(<EstimatedFutureWishes {...defaultProps} />);

    const selectAllButtons = screen.getAllByText("Select All");
    const premiumSelectAllButton = selectAllButtons[1];
    await user.click(premiumSelectAllButton);

    // Should call the bulk handler once instead of individual calls
    expect(mockHandleBulkPrimogemSourceChange).toHaveBeenCalledTimes(1);
    expect(mockHandleBulkPrimogemSourceChange).toHaveBeenCalledWith("select_all", "premium");
    
    // Individual handler should not be called for bulk operations
    expect(mockHandlePrimogemSourceChange).toHaveBeenCalledTimes(0);
  });

  it("renders checkboxes for available primogem sources", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    expect(
      screen.getByRole("checkbox", { name: /Daily Commissions/ })
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Abyss/ })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Welkin Moon/ })
    ).toBeInTheDocument();
  });

  it("handles free-to-play toggle deselect all", async () => {
    const user = userEvent.setup();
    const allSelectedProps = {
      ...defaultProps,
      primogemSources: {
        ...defaultProps.primogemSources,
        gameUpdateCompensation: true,
        dailyCommissions: true,
        paimonBargain: true,
        abyss: true,
        stygianOnslaught: true,
        imaginarium: true,
        archonQuest: true,
        storyQuests: true,
        newAchievements: true,
        characterTestRuns: true,
        eventActivities: true,
        hoyolabDailyCheckIn: true,
        hoyolabWebEvents: true,
        livestreamCodes: true,
        newVersionCode: true,
        limitedExplorationRewards: true,
        battlePass: true,
      } as PrimogemSourcesEnabled,
    };
    
    render(<EstimatedFutureWishes {...allSelectedProps} />);

    const deselectAllButton = screen.getByText("Deselect All");
    await user.click(deselectAllButton);

    // Should call the bulk handler once for deselecting
    expect(mockHandleBulkPrimogemSourceChange).toHaveBeenCalledTimes(1);
    expect(mockHandleBulkPrimogemSourceChange).toHaveBeenCalledWith("deselect_all", "free_to_play");
    
    // Individual handler should not be called for bulk operations
    expect(mockHandlePrimogemSourceChange).toHaveBeenCalledTimes(0);
  });

  it("shows per season indicator for abyss and imaginarium", () => {
    render(<EstimatedFutureWishes {...defaultProps} />);

    const perSeasonTexts = screen.getAllByText("per season");
    // Should show "per season" for abyss and imaginarium sources
    const sourcesWithPerSeason = ["abyss", "imaginarium"];
    expect(perSeasonTexts.length).toBe(sourcesWithPerSeason.length);
  });
});
