import {
  ResultType,
  createGradientBackground,
  getGradientBorderColor,
  getResultColors,
  getStrongerResultType,
} from "@/lib/colors";
import {
  BannerOutcome,
  CharacterOutcome,
  WeaponOutcome,
} from "@/lib/types";

export type ProcessedScenario = {
  characterResults: CharacterOutcome[];
  weaponResults: WeaponOutcome[];
  hasAnySuccess: boolean;
  resultType: ResultType;
  charResultType: ResultType;
  weaponResultType: ResultType;
  showCharacterSection: boolean;
  showWeaponSection: boolean;
};

export type ScenarioStyling = {
  containerClass: string;
  textClass: string;
  background: string;
  border: string;
  glowClass: string;
};

// Helper function to determine result type for a section
const getResultType = (
  hasSuccess: boolean,
  hasWishesAllocated: boolean
): ResultType => {
  if (hasSuccess) {
    return "success";
  } else if (hasWishesAllocated) {
    return "missed";
  } else {
    return "skipped";
  }
};

export const processScenario = (bannerOutcome?: BannerOutcome): ProcessedScenario => {
  if (!bannerOutcome) {
    return {
      characterResults: [],
      weaponResults: [],
      hasAnySuccess: false,
      resultType: "skipped",
      charResultType: "skipped",
      weaponResultType: "skipped",
      showCharacterSection: false,
      showWeaponSection: false,
    };
  }

  const characterResults = bannerOutcome.characterOutcomes;
  const weaponResults = bannerOutcome.weaponOutcomes;

  // Determine which sections to show based on wishes allocated
  const showCharacterSection = characterResults.some(
    (char) => char.wishesUsed > 0
  );
  const showWeaponSection = weaponResults.some(
    (weapon) => weapon.wishesUsed > 0
  );

  // Determine individual result types
  const hasCharacterSuccess = characterResults.some((char) => char.obtained);
  const hasWeaponSuccess = weaponResults.some((weapon) => weapon.obtained);
  const hasAnySuccess = hasCharacterSuccess || hasWeaponSuccess;

  const charResultType = getResultType(
    hasCharacterSuccess,
    showCharacterSection
  );
  const weaponResultType = getResultType(hasWeaponSuccess, showWeaponSection);

  // Overall result type based on combined results
  let resultType: ResultType;
  if (hasAnySuccess) {
    resultType = "success";
  } else {
    const hasWishesAllocated = showCharacterSection || showWeaponSection;
    resultType = hasWishesAllocated ? "missed" : "skipped";
  }

  return {
    characterResults,
    weaponResults,
    hasAnySuccess,
    resultType,
    charResultType,
    weaponResultType,
    showCharacterSection,
    showWeaponSection,
  };
};

export const getScenarioStyling = (
  processedScenario: ProcessedScenario,
  includeGlow: boolean = true
): ScenarioStyling => {
  const {
    resultType,
    charResultType,
    weaponResultType,
    showCharacterSection,
    showWeaponSection,
  } = processedScenario;

  // Check if we need gradient styling for different character/weapon results
  const useGradient =
    showCharacterSection &&
    showWeaponSection &&
    weaponResultType !== charResultType;

  let background: string;
  let border: string;
  let text: string;
  let glowClass = "";

  if (useGradient) {
    // Use gradient when character and weapon results differ
    background = createGradientBackground(charResultType, weaponResultType);
    border = getGradientBorderColor(charResultType, weaponResultType);
    // For text, use the "stronger" result's text color
    const strongerResult = getStrongerResultType(
      charResultType,
      weaponResultType
    );
    text = getResultColors(strongerResult).text;
    
    // Add glow effect if there's any success
    if (includeGlow && (charResultType === "success" || weaponResultType === "success")) {
      glowClass = "magical-glow";
    }
  } else {
    // Use single result type styling
    const colors = getResultColors(resultType);
    background = colors.background;
    border = colors.border;
    text = colors.text;
    
    // Add magical glow effect for successful results
    if (includeGlow && resultType === "success") {
      glowClass = "magical-glow";
    }
  }

  return {
    containerClass: `p-2 rounded-md text-center h-full flex flex-col items-center justify-center gap-2 ${background} border ${border} ${glowClass}`,
    textClass: text,
    background,
    border,
    glowClass,
  };
};

export const getSectionStyling = (
  resultType: ResultType,
  includeGlow: boolean = true
): ScenarioStyling => {
  const colors = getResultColors(resultType);
  let glowClass = "";
  
  if (includeGlow && resultType === "success") {
    glowClass = "magical-glow";
  }

  return {
    containerClass: `p-2 rounded-md text-center h-full flex flex-col items-center justify-center gap-2 ${colors.background} border ${colors.border} ${glowClass}`,
    textClass: colors.text,
    background: colors.background,
    border: colors.border,
    glowClass,
  };
};