import colors from "tailwindcss/colors";

/**
 * Application color palette using Tailwind CSS colors
 */
export const BANNER_COLORS = [
  colors.amber[800],
  colors.sky[950],
  colors.purple[950],
  colors.cyan[950],
  colors.red[950],
];

/**
 * Element color mappings using Tailwind CSS classes
 */
export const ELEMENT_COLORS = {
  pyro: "bg-red-400/80", // Red
  hydro: "bg-blue-400/80", // Blue
  anemo: "bg-teal-500/80", // Teal
  electro: "bg-purple-500/80", // Purple
  dendro: "bg-green-400/80", // Green
  cryo: "bg-sky-400/80", // Light Blue
  geo: "bg-amber-400/80", // Yellow
  default: "bg-gray-500/80", // Default gray
};

/**
 * Rarity color mappings using Tailwind CSS classes
 */
export const RARITY_COLORS = {
  5: "text-amber-400", // Gold for 5-star
  4: "text-purple-500", // Purple for 4-star
  3: "text-blue-400", // Blue for 3-star
  default: "text-gray-500", // Default
};

/**
 * Scenario cell result types and styling
 */
export type ResultType =
  | "success"
  | "missed"
  | "standard5star"
  | "skipped"
  | "other";

export interface ResultColors {
  background: string;
  border: string;
  text: string;
}

/**
 * Get the color scheme for a result type
 */
export function getResultColors(resultType: ResultType): ResultColors {
  switch (resultType) {
    case "success":
      return {
        background: "bg-yellow-1/30",
        border: "border-gold-1",
        text: "text-yellow-1",
      };
    case "missed":
      return {
        background: "bg-red-500/20",
        border: "border-red-500/40",
        text: "text-white",
      };
    case "standard5star":
      return {
        background: "bg-gold-1/20",
        border: "border-gold-1/40",
        text: "text-gold-1",
      };
    case "skipped":
      return {
        background: "bg-bg-dark-2/20",
        border: "border-void-2",
        text: "text-white/30",
      };
    default:
      return {
        background: "bg-bg-dark-2/20",
        border: "border-void-2",
        text: "text-green-500",
      };
  }
}

/**
 * Pre-defined gradient combinations for Tailwind compilation
 * These classes will be detected by Tailwind and included in the build
 */
const GRADIENT_COMBINATIONS: Record<string, string> = {
  // Success combinations
  "success-missed": "bg-gradient-to-b from-yellow-1/30 to-red-500/20",
  "success-standard5star": "bg-gradient-to-b from-yellow-1/30 to-amber-600/20",
  "success-skipped": "bg-gradient-to-b from-yellow-1/30 to-gray-600/20",
  "success-other": "bg-gradient-to-b from-yellow-1/30 to-green-500/20",

  // Missed combinations
  "missed-success": "bg-gradient-to-b from-red-500/20 to-yellow-1/30",
  "missed-standard5star": "bg-gradient-to-b from-red-500/20 to-amber-600/20",
  "missed-skipped": "bg-gradient-to-b from-red-500/20 to-gray-600/20",
  "missed-other": "bg-gradient-to-b from-red-500/20 to-green-500/20",

  // Standard5star combinations
  "standard5star-success": "bg-gradient-to-b from-amber-600/20 to-yellow-1/30",
  "standard5star-missed": "bg-gradient-to-b from-amber-600/20 to-red-500/20",
  "standard5star-skipped": "bg-gradient-to-b from-amber-600/20 to-gray-600/20",
  "standard5star-other": "bg-gradient-to-b from-amber-600/20 to-green-500/20",

  // Skipped combinations
  "skipped-success": "bg-gradient-to-b from-gray-600/20 to-yellow-1/30",
  "skipped-missed": "bg-gradient-to-b from-gray-600/20 to-red-500/20",
  "skipped-standard5star": "bg-gradient-to-b from-gray-600/20 to-amber-600/20",
  "skipped-other": "bg-gradient-to-b from-gray-600/20 to-green-500/20",

  // Other combinations
  "other-success": "bg-gradient-to-b from-green-500/20 to-yellow-1/30",
  "other-missed": "bg-gradient-to-b from-green-500/20 to-red-500/20",
  "other-standard5star": "bg-gradient-to-b from-green-500/20 to-amber-600/20",
  "other-skipped": "bg-gradient-to-b from-green-500/20 to-gray-600/20",
};

/**
 * Create a gradient background when character and weapon results differ
 * Uses pre-defined Tailwind classes for proper compilation
 */
export function createGradientBackground(
  charResultType: ResultType,
  weaponResultType: ResultType
): string {
  if (charResultType === weaponResultType) {
    return getResultColors(charResultType).background;
  }

  const gradientKey = `${charResultType}-${weaponResultType}`;
  return (
    GRADIENT_COMBINATIONS[gradientKey] ||
    getResultColors(charResultType).background
  );
}

/**
 * Get the priority of a result type for determining which is "stronger"
 * Higher numbers = stronger results
 */
export function getResultTypePriority(type: ResultType): number {
  switch (type) {
    case "success":
      return 5;
    case "standard5star":
      return 4;
    case "missed":
      return 3;
    case "other":
      return 2;
    case "skipped":
      return 1;
    default:
      return 0;
  }
}

/**
 * Get the "stronger" of two result types based on priority
 */
export function getStrongerResultType(
  type1: ResultType,
  type2: ResultType
): ResultType {
  return getResultTypePriority(type1) >= getResultTypePriority(type2)
    ? type1
    : type2;
}

/**
 * Get border color when results differ - use the "stronger" result
 */
export function getGradientBorderColor(
  charResultType: ResultType,
  weaponResultType: ResultType
): string {
  if (charResultType === weaponResultType) {
    return getResultColors(charResultType).border;
  }

  const strongerResult = getStrongerResultType(
    charResultType,
    weaponResultType
  );
  return getResultColors(strongerResult).border;
}
