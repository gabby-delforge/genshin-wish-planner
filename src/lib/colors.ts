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
  pyro: "bg-red-500/80", // Red
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
