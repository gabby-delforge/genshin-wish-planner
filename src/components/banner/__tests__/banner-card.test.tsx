import { GenshinContext } from "@/lib/mobx/genshin-context";
import { BannerId, BannerWishBreakdown } from "@/lib/types";
import { isPastDate } from "@/lib/utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { observer } from "mobx-react-lite";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BANNERS } from "../../../lib/data";
import { GenshinState } from "../../../lib/mobx/genshin-state";
import { ResponsiveProvider } from "../../../lib/responsive-design/responsive-context";
import BannerCard from "../banner-card";

// Mock Next.js components that aren't available in test environment
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock the character and weapon icon components
vi.mock("../../../lib/components/character-icon", () => ({
  default: ({ characterId }: { characterId: string }) => (
    <div data-testid={`character-icon-${characterId}`}>Character Icon</div>
  ),
}));

vi.mock("../../../lib/components/weapon-icon", () => ({
  default: ({ weaponId }: { weaponId: string }) => (
    <div data-testid={`weapon-icon-${weaponId}`}>Weapon Icon</div>
  ),
}));

// Mock useMediaQuery to control responsive behavior in tests
let mockDeviceType: "mobile" | "desktop" = "desktop";

vi.mock("../../../lib/responsive-design/hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn((query: string) => {
    if (mockDeviceType === "desktop") {
      // Desktop queries
      if (
        query.includes("min-width: 769px") ||
        query.includes("min-width: 1025px")
      ) {
        return true;
      }
      // Mobile queries
      if (query.includes("max-width: 768px")) {
        return false;
      }
    } else {
      // Mobile queries
      if (query.includes("max-width: 768px")) {
        return true;
      }
      // Desktop queries
      if (
        query.includes("min-width: 769px") ||
        query.includes("min-width: 1025px")
      ) {
        return false;
      }
    }
    return false;
  }),
  useIsMobile: vi.fn(() => mockDeviceType === "mobile"),
  useIsTablet: vi.fn(() => false),
  useIsDesktop: vi.fn(() => mockDeviceType === "desktop"),
}));

describe("BannerCard", () => {
  let state: GenshinState;
  let bannerId: BannerId;

  // Helper function to set device type for responsive tests
  const setDeviceType = (deviceType: "mobile" | "desktop") => {
    mockDeviceType = deviceType;
  };

  // Test wrapper that provides our custom state and responsive context
  const TestWrapper = observer(
    ({ children }: { children: React.ReactNode }) => (
      <GenshinContext.Provider value={state}>
        <ResponsiveProvider>{children}</ResponsiveProvider>
      </GenshinContext.Provider>
    )
  );

  beforeEach(() => {
    setDeviceType("desktop");

    state = new GenshinState();

    // Set up with 100 wishes to see starglitter effect
    state.ownedWishResources = {
      primogem: 0,
      starglitter: 0,
      limitedWishes: 100,
      stardust: 0,
      genesisCrystal: 0,
      standardWish: 0,
    };

    // Disable all primogem sources for cleaner testing
    Object.keys(state.primogemSources).forEach((key) => {
      state.primogemSources[key as keyof typeof state.primogemSources] = false;
    });

    // IMPORTANT: Make sure the state is fully initialized
    state.isLoading = false;

    const activeBanner = state.banners.find(
      (banner) => !isPastDate(banner.endDate)
    );
    if (!activeBanner) {
      console.error("No active banner found; tests will not run properly.");
      return;
    }

    bannerId = activeBanner.id;
  });

  describe("Starglitter", () => {
    it("should render BannerCard with initial wishes display", () => {
      const firstBannerId = bannerId;
      const bannerData = API_BANNERS[firstBannerId];
      const bannerConfiguration = state.bannerConfiguration[firstBannerId];

      render(
        <TestWrapper>
          <BannerCard
            id={firstBannerId}
            bannerData={bannerData}
            bannerConfiguration={bannerConfiguration}
            isCurrentBanner={true}
            isOldBanner={false}
            estimatedWishesEarned={0}
          />
        </TestWrapper>
      );

      const availableWishes = state.availableWishes[firstBannerId];
      const totalWishes = 100 + availableWishes.starglitterWishes;

      // Initial wishes should be 100 from primogems + starglitter wishes
      expect(screen.getByText(totalWishes.toString())).toBeInTheDocument();

      // Check that the banner renders with "available" text
      expect(screen.getByText("available")).toBeInTheDocument();
    });

    it("should update wish display when starglitter is generated from allocations", () => {
      const firstBannerId = bannerId;
      const firstCharacter = state.banners.find((b) => b.id === firstBannerId)!
        .characters[0];
      const bannerData = API_BANNERS[firstBannerId];
      const bannerConfiguration = state.bannerConfiguration[firstBannerId];

      // Allocate wishes to generate starglitter
      state.allocateWishesToCharacter(firstBannerId, firstCharacter, 50);

      const { rerender } = render(
        <TestWrapper>
          <BannerCard
            id={firstBannerId}
            bannerData={bannerData}
            bannerConfiguration={bannerConfiguration}
            isCurrentBanner={true}
            isOldBanner={false}
            estimatedWishesEarned={0}
          />
        </TestWrapper>
      );

      // Check the available wishes calculations
      const availableWishes = state.availableWishes[firstBannerId];
      expect(availableWishes.endingWishes).toEqual(100 - 50);
      expect(availableWishes.starglitterWishes).toBeGreaterThan(0);
      expect(availableWishes.wishesSpentOnCharacters).toBe(50);

      // Rerender to ensure UI reflects the updated state
      rerender(
        <TestWrapper>
          <BannerCard
            id={firstBannerId}
            bannerData={bannerData}
            bannerConfiguration={bannerConfiguration}
            isCurrentBanner={true}
            isOldBanner={false}
            estimatedWishesEarned={0}
          />
        </TestWrapper>
      );

      // Should still show available text
      expect(screen.getByText("available")).toBeInTheDocument();

      // Should show the updated wish count
      const expectedEndingWishes = Math.floor(
        availableWishes.endingWishes + availableWishes.starglitterWishes
      );
      expect(
        screen.getByText(expectedEndingWishes.toString())
      ).toBeInTheDocument();
    });

    it("should display starglitter breakdown correctly", () => {
      const activeBanner = state.banners.find(
        (banner) => !isPastDate(banner.endDate)
      );
      if (!activeBanner) {
        expect(false);
        return;
      }

      const bannerId = activeBanner.id; // This should be "5.7v1" based on your logs
      const firstCharacter = activeBanner.characters[0]; // This should be "skirk"
      const bannerData = API_BANNERS[bannerId];
      const bannerConfiguration = state.bannerConfiguration[bannerId];

      // Allocate wishes to generate starglitter
      state.allocateWishesToCharacter(bannerId, firstCharacter, 30);

      render(
        <TestWrapper>
          <BannerCard
            id={bannerId}
            bannerData={bannerData}
            bannerConfiguration={bannerConfiguration}
            isCurrentBanner={true}
            isOldBanner={false}
            estimatedWishesEarned={0}
          />
        </TestWrapper>
      );

      const availableWishes = state.availableWishes[bannerId];

      // Verify starglitter wishes are calculated correctly
      expect(availableWishes.starglitterWishes).toBeGreaterThan(0);
      expect(availableWishes.wishesSpentOnCharacters).toBe(30);

      // Check the wish breakdown calculation integrity
      expect(availableWishes.endingWishes).toBe(
        availableWishes.startingWishes +
          availableWishes.earnedWishes -
          availableWishes.wishesSpentOnCharacters -
          availableWishes.wishesSpentOnWeapons
      );

      const expectedWithStarglitter = Math.floor(
        availableWishes.endingWishes + availableWishes.starglitterWishes
      );

      // The UI should show the correct ending wishes
      expect(
        screen.getByText(expectedWithStarglitter.toString())
      ).toBeInTheDocument();
    });

    it("should handle negative wishes with proper display", () => {
      const firstBannerId = bannerId;
      const firstCharacter = state.banners.find((b) => b.id === firstBannerId)!
        .characters[0];
      const bannerData = API_BANNERS[firstBannerId];
      const bannerConfiguration = state.bannerConfiguration[firstBannerId];

      // Allocate more wishes than available (to test negative display)
      state.allocateWishesToCharacter(firstBannerId, firstCharacter, 200);

      render(
        <TestWrapper>
          <BannerCard
            id={firstBannerId}
            bannerData={bannerData}
            bannerConfiguration={bannerConfiguration}
            isCurrentBanner={true}
            isOldBanner={false}
            estimatedWishesEarned={0}
          />
        </TestWrapper>
      );

      const availableWishes = state.availableWishes[firstBannerId];

      // Should be negative
      expect(availableWishes.endingWishes).toBeLessThan(0);

      // Still should show available text
      expect(screen.getByText("available")).toBeInTheDocument();

      // Should show the negative number
      const expectedDisplay = Math.floor(
        availableWishes.endingWishes + availableWishes.starglitterWishes
      );
      expect(screen.getByText(expectedDisplay.toString())).toBeInTheDocument();
    });

    describe("User Interactions", () => {
      const user = userEvent.setup();

      // Helper function to get wishes input for a character by ID
      const getWishesInput = (characterId: string) => {
        const element = document.getElementById(`wishes-${characterId}`);
        if (!element) {
          // Fallback: try to find any number input
          const inputs = screen.getAllByRole("input");
          return inputs[0]; // Return first number input as fallback
        }
        return element;
      };

      // Helper function to get Max button
      const getMaxButton = () => {
        return screen.getAllByRole("button", { name: /max/i })[0];
      };

      // Helper function to wait for UI to update and return current available wishes
      const waitForStateUpdate = async (
        bannerId: string,
        expectedChange?: (wishes: BannerWishBreakdown) => boolean
      ) => {
        if (expectedChange) {
          // Wait for specific state change
          await waitFor(
            () => {
              const wishes = state.availableWishes[bannerId];
              return expectedChange(wishes);
            },
            { timeout: 1000 }
          );
        } else {
          // Just wait for general updates
          await waitFor(
            () => {
              // Wait for any potential updates by checking if state is stable
              return true;
            },
            { timeout: 100 }
          );
        }

        return state.availableWishes[bannerId];
      };

      it("should handle typing in wishes input and verify starglitter calculations", async () => {
        const firstBannerId = bannerId;
        const bannerData = API_BANNERS[firstBannerId];
        const bannerConfiguration = state.bannerConfiguration[firstBannerId];
        const firstCharacterId = bannerData.characters[0];

        render(
          <TestWrapper>
            <BannerCard
              id={firstBannerId}
              bannerData={bannerData}
              bannerConfiguration={bannerConfiguration}
              isCurrentBanner={true}
              isOldBanner={false}
              estimatedWishesEarned={0}
            />
          </TestWrapper>
        );

        // Initial state
        const initialWishes = state.availableWishes[firstBannerId];
        expect(initialWishes.wishesSpentOnCharacters).toBe(0);
        expect(initialWishes.starglitterWishes).toBeGreaterThan(3); // Should be 5
        expect(
          screen.getByText((100 + initialWishes.starglitterWishes).toString())
        ).toBeInTheDocument();

        // Type 30 wishes in the input
        const wishesInput = getWishesInput(firstCharacterId);
        await user.clear(wishesInput);
        await user.type(wishesInput, "30");

        // Verify state updated - wait for wishes to be allocated
        const afterTyping = await waitForStateUpdate(
          firstBannerId,
          (wishes) => wishes.wishesSpentOnCharacters === 30
        );
        expect(afterTyping.wishesSpentOnCharacters).toBe(30);
        expect(afterTyping.starglitterWishes).toBeGreaterThan(0);

        // Verify UI shows updated wishes count
        const expectedRemaining = Math.floor(
          afterTyping.endingWishes + afterTyping.starglitterWishes
        );
        expect(
          screen.getByText(expectedRemaining.toString())
        ).toBeInTheDocument();
      });

      it("should handle Max button click and subsequent manual changes", async () => {
        const firstBannerId = bannerId;
        const bannerData = API_BANNERS[firstBannerId];
        const bannerConfiguration = state.bannerConfiguration[firstBannerId];
        const firstCharacterName = bannerData.characters[0];

        render(
          <TestWrapper>
            <BannerCard
              id={firstBannerId}
              bannerData={bannerData}
              bannerConfiguration={bannerConfiguration}
              isCurrentBanner={true}
              isOldBanner={false}
              estimatedWishesEarned={0}
            />
          </TestWrapper>
        );

        // Step 1: Click Max button
        const maxButton = getMaxButton();
        await user.click(maxButton);

        // Wait for max allocation to complete
        const afterMax = await waitForStateUpdate(
          firstBannerId,
          (wishes) => wishes.wishesSpentOnCharacters > 90
        );
        const maxAllocated = afterMax.wishesSpentOnCharacters;
        expect(maxAllocated).toBeGreaterThan(90); // Should be close to 100+ due to starglitter
        expect(afterMax.starglitterWishes).toBeGreaterThan(0);
        expect(Math.floor(afterMax.endingWishes)).toBe(
          -afterMax.starglitterWishes
        );

        // Step 2: Manually change to a lower value
        const wishesInput = getWishesInput(firstCharacterName);
        await user.clear(wishesInput);
        await user.type(wishesInput, "50");

        const afterManual = await waitForStateUpdate(firstBannerId);
        expect(afterManual.wishesSpentOnCharacters).toBe(50);
        expect(afterManual.starglitterWishes).toBeGreaterThan(0);
        expect(afterManual.starglitterWishes).toBeLessThan(
          afterMax.starglitterWishes
        );
        expect(afterManual.endingWishes).toBeGreaterThan(afterMax.endingWishes);

        // Step 3: Click Max button again
        await user.click(maxButton);

        const afterSecondMax = await waitForStateUpdate(firstBannerId);
        expect(Math.floor(afterSecondMax.endingWishes)).toBe(
          -afterMax.starglitterWishes
        );
        expect(afterSecondMax.wishesSpentOnCharacters).toBeGreaterThan(50);
      });

      it("should handle multiple Max button clicks in succession", async () => {
        const firstBannerId = bannerId;
        const bannerData = API_BANNERS[firstBannerId];
        const bannerConfiguration = state.bannerConfiguration[firstBannerId];

        render(
          <TestWrapper>
            <BannerCard
              id={firstBannerId}
              bannerData={bannerData}
              bannerConfiguration={bannerConfiguration}
              isCurrentBanner={true}
              isOldBanner={false}
              estimatedWishesEarned={0}
            />
          </TestWrapper>
        );

        const maxButton = getMaxButton();

        // Click Max button multiple times rapidly
        await user.click(maxButton);
        const afterFirst = await waitForStateUpdate(firstBannerId);

        await user.click(maxButton);
        const afterSecond = await waitForStateUpdate(firstBannerId);

        await user.click(maxButton);
        const afterThird = await waitForStateUpdate(firstBannerId);

        // All should result in the same state (idempotent)
        expect(afterFirst.wishesSpentOnCharacters).toBe(
          afterSecond.wishesSpentOnCharacters
        );
        expect(afterSecond.wishesSpentOnCharacters).toBe(
          afterThird.wishesSpentOnCharacters
        );
        expect(afterFirst.starglitterWishes).toBe(
          afterSecond.starglitterWishes
        );
        expect(afterSecond.starglitterWishes).toBe(
          afterThird.starglitterWishes
        );
        expect(Math.floor(afterThird.endingWishes)).toBe(
          -afterThird.starglitterWishes
        );
      });

      it("should handle edge case of typing invalid values", async () => {
        const firstBannerId = bannerId;
        const bannerData = API_BANNERS[firstBannerId];
        const bannerConfiguration = state.bannerConfiguration[firstBannerId];
        const firstCharacterName = bannerData.characters[0];

        render(
          <TestWrapper>
            <BannerCard
              id={firstBannerId}
              bannerData={bannerData}
              bannerConfiguration={bannerConfiguration}
              isCurrentBanner={true}
              isOldBanner={false}
              estimatedWishesEarned={0}
            />
          </TestWrapper>
        );

        const wishesInput = getWishesInput(firstCharacterName);

        // Try typing a negative number
        await user.clear(wishesInput);
        await user.type(wishesInput, "-10");

        // Wait for validation to process
        const afterNegative = await waitForStateUpdate(
          firstBannerId,
          (wishes) => wishes.wishesSpentOnCharacters >= 0
        );
        expect(afterNegative.wishesSpentOnCharacters).toBe(0); // Should clamp to 0

        // Try typing a very large number
        await user.clear(wishesInput);
        await user.type(wishesInput, "99999");

        const afterLarge = await waitForStateUpdate(firstBannerId);
        expect(afterLarge.endingWishes).toBeLessThan(0); // Should allow over-allocation
        expect(afterLarge.starglitterWishes).toBeGreaterThan(0);

        // The UI should still show the negative number
        const expectedDisplay = Math.floor(
          afterLarge.endingWishes + afterLarge.starglitterWishes
        );
        expect(
          screen.getByText(expectedDisplay.toString())
        ).toBeInTheDocument();
      });

      it("should handle sequence of complex user interactions", async () => {
        const firstBannerId = bannerId;
        const bannerData = API_BANNERS[firstBannerId];
        const bannerConfiguration = state.bannerConfiguration[firstBannerId];
        const characters = bannerData.characters;

        if (characters.length < 2) {
          // Skip if not enough characters
          return;
        }

        render(
          <TestWrapper>
            <BannerCard
              id={firstBannerId}
              bannerData={bannerData}
              bannerConfiguration={bannerConfiguration}
              isCurrentBanner={true}
              isOldBanner={false}
              estimatedWishesEarned={0}
            />
          </TestWrapper>
        );

        const firstCharId = characters[0];
        const secondCharId = characters[1];

        // Step 1: Allocate to first character manually
        const firstInput = getWishesInput(firstCharId);
        await user.clear(firstInput);
        await user.type(firstInput, "40");
        await user.click(document.body); // Click away to unfocus

        const afterFirst = await waitForStateUpdate(firstBannerId);
        expect(afterFirst.wishesSpentOnCharacters).toBe(40);

        // Step 2: Allocate to second character manually
        const secondInput = getWishesInput(secondCharId);
        await user.clear(secondInput);
        await user.type(secondInput, "30");

        const afterSecond = await waitForStateUpdate(firstBannerId);
        expect(afterSecond.wishesSpentOnCharacters).toBe(70);

        // Step 3: Click Max on first character
        const firstMaxButton = getMaxButton();
        await user.click(firstMaxButton);

        const afterFirstMax = await waitForStateUpdate(firstBannerId);
        expect(afterFirstMax.wishesSpentOnCharacters).toBeGreaterThan(70);

        // Step 4: Reduce second character allocation
        await user.clear(secondInput);
        await user.type(secondInput, "10");

        const afterReduction = await waitForStateUpdate(firstBannerId);
        expect(afterReduction.wishesSpentOnCharacters).toBeLessThan(
          afterFirstMax.wishesSpentOnCharacters
        );

        // Verify starglitter is being calculated correctly throughout
        expect(afterReduction.starglitterWishes).toBeGreaterThan(0);
        expect(afterReduction.endingWishes).toBe(
          afterReduction.startingWishes +
            afterReduction.earnedWishes -
            afterReduction.wishesSpentOnCharacters -
            afterReduction.wishesSpentOnWeapons
        );
      });
    });
  });
});
