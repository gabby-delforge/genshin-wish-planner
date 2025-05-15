import {
  Allocations,
  DEFAULT_PRIORITY,
  Priority,
  SimulationResult,
  VersionId,
} from "./types";

import {
  ApiCharacter,
  Banner,
  BannerSimulationResult,
  CharacterId,
  CharacterSimulationResult,
  WishForCharacterResult,
} from "./types";

/**
 * WishSimulator simulates the gacha mechanics of Genshin Impact
 * It tracks pity and guaranteed status and provides probability calculations
 */
export class WishSimulator {
  pity: number;
  guaranteed: boolean;
  banners: Banner[];
  allocations: Allocations;
  simulationResults: SimulationResult;

  constructor(
    startingPity = 0,
    guaranteed = false,
    banners: Banner[],
    allocations: Allocations
  ) {
    this.pity = startingPity;
    this.guaranteed = guaranteed;
    this.banners = banners;
    this.allocations = allocations;
    this.simulationResults = {} as SimulationResult;
  }

  /**
   * Calculate the probability of getting a 5-star based on current pity
   * Implements Genshin Impact's soft and hard pity system
   */
  get5StarProbability(): number {
    if (this.pity < 73) {
      return 0.006; // Base rate
    } else if (this.pity < 89) {
      // Soft pity - increases with each pull
      return 0.006 + (this.pity - 72) * 0.06;
    } else {
      return 1.0; // Hard pity (90th pull)
    }
  }

  wishForBanner(
    banner: Banner,
    allocations: Allocations,
    currentPity: number,
    isGuaranteed: boolean
  ) {
    const bannerVersion = banner.version;
    const versionAllocation = allocations[bannerVersion as VersionId] || {};

    // Get characters with allocated wishes
    const charactersWithWishes: ApiCharacter[] = banner.characters.filter(
      (char: ApiCharacter) =>
        versionAllocation[char.id] &&
        versionAllocation[char.id]!.wishesAllocated > 0
    );

    // Skip banner if no wishes allocated
    if (charactersWithWishes.length === 0) {
      return;
    }

    // Create a separate result for each character in the banner
    const characterResults: Partial<
      Record<CharacterId, CharacterSimulationResult>
    > = {};

    // For each character that has wishes allocated, simulate separately
    for (const targetChar of charactersWithWishes) {
      const wishesToSpend =
        versionAllocation[targetChar.id]!.wishesAllocated || 0;
      const maxConst = versionAllocation[targetChar.id]!.maxConstellation || 0;
      // Use a new simulator instance with the current pity/guaranteed state
      const charResult = this.wishForCharacter(
        targetChar.id,
        wishesToSpend,
        maxConst
      );

      // Record the results for this character
      characterResults[targetChar.id] = {
        character: targetChar.id,
        obtained: charResult.obtained,
        hasWishesAllocated: true,
        lostFiftyFifty: charResult.lostFiftyFifty,
        wishesUsed: charResult.wishesUsed,
        constellation: charResult.constellation,
      };

      // Update the pity/guaranteed state for the next character or banner
      currentPity = charResult.pity;
      isGuaranteed = charResult.guaranteed;
    }

    // For characters without wishes allocated, add them to results with obtained=false
    for (const char of banner.characters) {
      if (!charactersWithWishes.some((c) => c.id === char.id)) {
        characterResults[char.id] = {
          character: char.id,
          obtained: false,
          hasWishesAllocated: false,
          lostFiftyFifty: false,
          wishesUsed: 0,
          constellation: 0,
        };
      }
    }

    // Calculate total wishes used across all characters
    const totalWishesUsed = Object.values(characterResults).reduce(
      (sum, r) => sum + r.wishesUsed,
      0
    );

    // Create banner simulation result
    const bannerResult: BannerSimulationResult = {
      bannerId: bannerVersion,
      characterResults,
      wishesUsed: totalWishesUsed,
      endPity: currentPity,
      endGuaranteed: isGuaranteed,
    };

    this.simulationResults[bannerVersion] = bannerResult;
  }

  wishForCharacter(
    character: CharacterId,
    maxWishes: number,
    maxConst: number
  ): WishForCharacterResult {
    let charPulls = 0;
    let obtained = false;
    let lostFiftyFifty = false;
    let constellationCount = 0;
    let gotStandard5Star = false;
    let gotFeatured5Star = false;

    // Simulate pulls for this specific character
    while (charPulls < maxWishes && constellationCount <= maxConst) {
      charPulls++;
      const result = this.wish();

      if (result === "featured") {
        // Successfully got the featured character
        obtained = true;
        gotFeatured5Star = true;
        constellationCount++;

        // If we've reached the desired constellation, break
        if (constellationCount > maxConst) {
          break;
        }
      } else if (result === "standard") {
        // Got a standard 5-star
        gotStandard5Star = true;
      }
    }

    // We only consider the 50/50 as "lost" if the player got a standard 5* character
    // but didn't get any copies of the featured character. If they got at least one
    // copy of the featured character, we don't consider it a lost 50/50 for display purposes.
    lostFiftyFifty = gotStandard5Star && !gotFeatured5Star;

    return {
      character,
      obtained,
      lostFiftyFifty,
      wishesUsed: charPulls,
      pity: this.pity,
      guaranteed: this.guaranteed,
      constellation: constellationCount > 0 ? constellationCount - 1 : 0,
    };
  }

  // Runs an entire simulation across all banners, keeping track of the pity and guaranteed status as
  // they change across banners.
  runSimulation() {
    for (const banner of this.banners) {
      this.wishForBanner(banner, this.allocations, this.pity, this.guaranteed);
    }
  }

  /**
   * Simulate a single wish
   * @returns "featured" if the featured 5-star was pulled, "standard" if a standard 5-star, or "non-5-star" otherwise
   */
  wish(): "featured" | "standard" | "non-5-star" {
    this.pity++;
    const prob = this.get5StarProbability();

    if (Math.random() < prob) {
      // Reset pity after getting a 5-star
      this.pity = 0;

      // Check if guaranteed
      if (this.guaranteed) {
        this.guaranteed = false;
        return "featured";
      } else {
        // 50/50 chance
        if (Math.random() < 0.5) {
          return "featured";
        } else {
          this.guaranteed = true;
          return "standard";
        }
      }
    }

    return "non-5-star";
  }

  // In optimization mode, we want to run a simulation for each possible allocation of wishes
  // and return the results.
  // Since an allocation that meets the player's goal might not be possible, we prioritize the
  // characters that the player wants most:
  // 1. "Must have" -> Target 99% probability
  // 2. "Want" -> Target 90% probability
  // 3. "Would be nice" -> Target 70% probability
  // 4. "Not interested" -> Target 0% probability
  // We run a randomized algorithm that tries various allocations (within reasonable limits)
  // and returns the best result.
  runOptimization() {
    const defaultAllocations = {
      [0 as Priority]: 80,
      [1 as Priority]: 50,
      [2 as Priority]: 20,
      [3 as Priority]: 0,
    };

    const startingAllocation: Allocations = {};
    // Look at `allocations` and convert it to the starting allocation format
    for (const banner of this.banners) {
      startingAllocation[banner.version as VersionId] = {};
      for (const character of banner.characters) {
        const startingAllocationForCharacter =
          defaultAllocations[
            this.allocations[banner.version as VersionId][
              character.id as CharacterId
            ]?.pullPriority || DEFAULT_PRIORITY
          ];
        const characterAllocation =
          this.allocations[banner.version as VersionId][
            character.id as CharacterId
          ];
        startingAllocation[banner.version as VersionId][
          character.id as CharacterId
        ] = {
          wishesAllocated: startingAllocationForCharacter,
          pullPriority: characterAllocation?.pullPriority || DEFAULT_PRIORITY,
          maxConstellation: characterAllocation?.maxConstellation || 0,
        };
      }
    }

    // Run the simulation for the starting allocation
    for (const banner of this.banners) {
      this.wishForBanner(
        banner,
        startingAllocation,
        this.pity,
        this.guaranteed
      );
    }
  }
}
