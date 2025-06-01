import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import colors from "tailwindcss/colors";
import { ELEMENT_COLORS, RARITY_COLORS } from "./colors";
import { ApiBanner, BannerId } from "./types";

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
  return (
    RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.default
  );
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
  const elementKey = element.toLowerCase() as keyof typeof ELEMENT_COLORS;
  return ELEMENT_COLORS[elementKey] || ELEMENT_COLORS.default;
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

export function getBannerColor(versionId: BannerId): string {
  const h = hash(versionId);
  //return BANNER_COLORS[h % BANNER_COLORS.length];
  return colors.pink[700];
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

export const isCurrentBanner = (banner: ApiBanner): boolean => {
  const startDate = new Date(banner.startDate).getTime();
  const endDate = new Date(banner.endDate).getTime();
  const now = new Date().getTime();
  return startDate < now && endDate > now;
};

export const isOldBanner = (banner: ApiBanner): boolean => {
  const endDate = new Date(banner.endDate).getTime();
  const now = new Date().getTime();
  return endDate < now;
};

export function assertExhaustive(value: never): never {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const toFriendlyDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
