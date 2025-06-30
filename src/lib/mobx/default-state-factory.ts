/**
 * Default State Factory
 * 
 * Creates a complete default state object by leveraging the existing GenshinState constructor.
 * This ensures we don't duplicate the default state logic and stay in sync automatically.
 */

import { GenshinState } from "./genshin-state";

/**
 * Creates a complete default state object by manually defining the expected shape
 * This ensures we have complete control over what gets included in reconciliation
 */
export function createDefaultPersistedState(): Record<string, unknown> {
  const tempState = new GenshinState();
  
  // Manually extract the persistent properties to avoid readonly issues
  return {
    characterPity: tempState.characterPity,
    weaponPity: tempState.weaponPity,
    isNextCharacterFeaturedGuaranteed: tempState.isNextCharacterFeaturedGuaranteed,
    isCapturingRadianceActive: tempState.isCapturingRadianceActive,
    isNextWeaponFeaturedGuaranteed: tempState.isNextWeaponFeaturedGuaranteed,
    ownedWishResources: { ...tempState.ownedWishResources },
    primogemSources: { ...tempState.primogemSources },
    shouldExcludeCurrentBannerEarnedWishes: tempState.shouldExcludeCurrentBannerEarnedWishes,
    mode: tempState.mode,
    playgroundSimulationResults: tempState.playgroundSimulationResults,
    optimizerSimulationResults: tempState.optimizerSimulationResults,
    bannerConfiguration: JSON.parse(JSON.stringify(tempState.bannerConfiguration)), // Deep clone
    version: tempState.version,
  };
}

/**
 * Creates custom validators for specific GenshinState properties
 */
export function createGenshinStateValidators() {
  return {
    characterPity: (value: unknown) => {
      return typeof value === 'number' && value >= 0 && value <= 90 && Number.isInteger(value);
    },
    weaponPity: (value: unknown) => {
      return typeof value === 'number' && value >= 0 && value <= 80 && Number.isInteger(value);
    },
    simulationCount: (value: unknown) => {
      return typeof value === 'number' && value >= 1 && value <= 10000 && Number.isInteger(value);
    },
    mode: (value: unknown) => {
      return value === 'playground' || value === 'optimizer';
    },
    version: (value: unknown) => {
      return typeof value === 'number' && Number.isInteger(value) && value >= 1;
    },
    // Validate resource amounts are non-negative numbers
    'ownedWishResources.primogem': (value: unknown) => {
      return typeof value === 'number' && value >= 0 && Number.isInteger(value);
    },
    'ownedWishResources.starglitter': (value: unknown) => {
      return typeof value === 'number' && value >= 0 && Number.isInteger(value);
    },
    'ownedWishResources.limitedWishes': (value: unknown) => {
      return typeof value === 'number' && value >= 0 && Number.isInteger(value);
    },
    'ownedWishResources.stardust': (value: unknown) => {
      return typeof value === 'number' && value >= 0 && Number.isInteger(value);
    },
    'ownedWishResources.genesisCrystal': (value: unknown) => {
      return typeof value === 'number' && value >= 0 && Number.isInteger(value);
    },
    'ownedWishResources.standardWish': (value: unknown) => {
      return typeof value === 'number' && value >= 0 && Number.isInteger(value);
    },
  };
}

/**
 * Reconciliation options specifically configured for GenshinState
 */
export function getGenshinStateReconciliationOptions() {
  return {
    keepExtraProperties: false, // Clean up old properties
    validateTypes: true,
    customValidators: createGenshinStateValidators(),
    excludeProperties: [
      'banners', // Static data, don't reconcile
      'isClient', // Runtime property
      'isLoading', // Runtime property
      'isSimulating', // Runtime property
      'simulationProgress', // Runtime property
    ],
  };
}