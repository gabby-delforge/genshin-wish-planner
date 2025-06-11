/**
 * @vitest-environment jsdom
 */

import { GenshinContext } from "@/lib/mobx/genshin-context";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { observer } from "mobx-react-lite";
import React from "react";
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
}));

describe("BannerCard", () => {
  let state: GenshinState;

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
    // Reset to desktop for each test
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
    // Manually set isLoading to false since we're not using useClientState hook in tests
    state.isLoading = false;
  });

  describe("Starglitter", () => {
    it("should render BannerCard with initial wishes display", () => {
      const firstBannerId = state.banners[0].id;
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

      // Initial wishes should be 100 from primogems
      expect(screen.getByText("100")).toBeInTheDocument();

      // Check that the banner renders with "available" text
      expect(screen.getByText("available")).toBeInTheDocument();
    });

    it("should update wish display when starglitter is generated from allocations", () => {
      const firstBannerId = state.banners[0].id;
      const firstCharacter = state.banners[0].characters[0];
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
      expect(availableWishes.endingWishes).toBeLessThan(100);
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
      const expectedEndingWishes = Math.floor(availableWishes.endingWishes);
      expect(
        screen.getByText(expectedEndingWishes.toString())
      ).toBeInTheDocument();
    });

    it("should display starglitter breakdown correctly", () => {
      const firstBannerId = state.banners[0].id;
      const firstCharacter = state.banners[0].characters[0];
      const bannerData = API_BANNERS[firstBannerId];
      const bannerConfiguration = state.bannerConfiguration[firstBannerId];

      // Allocate wishes to generate starglitter
      state.allocateWishesToCharacter(firstBannerId, firstCharacter, 30);

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

      // Verify starglitter wishes are calculated correctly
      expect(availableWishes.starglitterWishes).toBeGreaterThan(0);
      expect(availableWishes.wishesSpentOnCharacters).toBe(30);

      // Check the wish breakdown calculation integrity
      expect(availableWishes.endingWishes).toBe(
        availableWishes.startingWishes +
          availableWishes.earnedWishes +
          availableWishes.starglitterWishes -
          availableWishes.wishesSpentOnCharacters -
          availableWishes.wishesSpentOnWeapons
      );

      // The UI should show the correct ending wishes
      const expectedDisplay = Math.floor(availableWishes.endingWishes);
      expect(screen.getByText(expectedDisplay.toString())).toBeInTheDocument();
    });

    it("should handle negative wishes with proper display", () => {
      const firstBannerId = state.banners[0].id;
      const firstCharacter = state.banners[0].characters[0];
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
      const expectedDisplay = Math.floor(availableWishes.endingWishes);
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
        expectedChange?: (wishes: any) => boolean
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

      it("should debug UI elements", async () => {
        const firstBannerId = state.banners[0].id;
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

        // Debug what elements are available
        const buttons = screen.getAllByRole("button");
        console.log(
          "Available buttons:",
          buttons.map((b) => b.textContent)
        );

        const inputs = screen.getAllByRole("spinbutton");
        console.log("Available inputs:", inputs.length);

        // Check if character rows are rendered
        expect(buttons.length).toBeGreaterThan(0);
        expect(inputs.length).toBeGreaterThan(0);
      });

      it("should handle typing in wishes input and verify starglitter calculations", async () => {
        const firstBannerId = state.banners[0].id;
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
        expect(initialWishes.starglitterWishes).toBe(0);
        expect(screen.getByText("100")).toBeInTheDocument();

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
        const expectedRemaining = Math.floor(afterTyping.endingWishes);
        expect(
          screen.getByText(expectedRemaining.toString())
        ).toBeInTheDocument();
      });

      it("should handle Max button click and subsequent manual changes", async () => {
        const firstBannerId = state.banners[0].id;
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
        expect(Math.floor(afterMax.endingWishes)).toBe(0);

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
        expect(Math.floor(afterSecondMax.endingWishes)).toBe(0);
        expect(afterSecondMax.wishesSpentOnCharacters).toBeGreaterThan(50);
      });

      it("should handle multiple Max button clicks in succession", async () => {
        const firstBannerId = state.banners[0].id;
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
        expect(Math.floor(afterThird.endingWishes)).toBe(0);
      });

      it("should handle edge case of typing invalid values", async () => {
        const firstBannerId = state.banners[0].id;
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
        const expectedDisplay = Math.floor(afterLarge.endingWishes);
        expect(
          screen.getByText(expectedDisplay.toString())
        ).toBeInTheDocument();
      });

      it("should handle sequence of complex user interactions", async () => {
        const firstBannerId = state.banners[0].id;
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
            afterReduction.earnedWishes +
            afterReduction.starglitterWishes -
            afterReduction.wishesSpentOnCharacters -
            afterReduction.wishesSpentOnWeapons
        );
      });
    });
  });
});
