import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VersionId } from "./types";

const COLORS = {
  gold: "#feca57",
  purple: "#9c88ff",
  blue: "#70a1ff",
  red: "#ff6b6b",
  teal: "#1dd1a1",
};

/**
 * Utility function for conditional class names with Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get color class for character rarity
 * @param rarity Character rarity (5-star, 4-star, etc.)
 */
export function getCharacterRarityColor(rarity: number): string {
  switch (rarity) {
    case 5:
      return "text-[#feca57]"; // Gold for 5-star
    case 4:
      return "text-[#9c88ff]"; // Purple for 4-star
    default:
      return "text-[#70a1ff]"; // Blue for 3-star
  }
}

export function hash(s: string): number {
  let hash = 0,
    i,
    chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Get background color class for character element
 * @param element Character element (Pyro, Hydro, etc.)
 */
export function getCharacterElementColor(element: string): string {
  switch (element.toLowerCase()) {
    case "pyro":
      return "bg-[#ff6b6b]/80"; // Red
    case "hydro":
      return "bg-[#70a1ff]/80"; // Blue
    case "anemo":
      return "bg-[#1dd1a1]/80"; // Teal
    case "electro":
      return "bg-[#9c88ff]/80"; // Purple
    case "dendro":
      return "bg-[#7bed9f]/80"; // Green
    case "cryo":
      return "bg-[#70a1ff]/80"; // Light Blue
    case "geo":
      return "bg-[#feca57]/80"; // Yellow
    default:
      return "bg-gray-500/80"; // Default gray
  }
}

/**
 * Format a date string to a readable format
 * @param dateString Date string in ISO format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getBannerColor(versionId: VersionId): string {
  const h = hash(versionId);
  const colorsArr = Object.values(COLORS);
  return colorsArr[h % colorsArr.length];
}

/**
 * Calculate number of days between two dates
 * @param startDate Start date string
 * @param endDate End date string
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the future
 * @param dateString Date string to check
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date > today;
}

/**
 * Check if a date is in the past
 * @param dateString Date string to check
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date < today;
}

/**
 * Get the current banner based on the date
 * @param banners Array of banners
 */
export function getCurrentBanner(
  banners: { startDate: string; endDate: string }[]
): number {
  const today = new Date();

  for (let i = 0; i < banners.length; i++) {
    const startDate = new Date(banners[i].startDate);
    const endDate = new Date(banners[i].endDate);

    if (today >= startDate && today <= endDate) {
      return i;
    }
  }

  // If no current banner, return the next upcoming one
  for (let i = 0; i < banners.length; i++) {
    const startDate = new Date(banners[i].startDate);

    if (today < startDate) {
      return i;
    }
  }

  // Default to the first banner if none are current or upcoming
  return 0;
}
