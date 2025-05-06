/**
 * Character names type definition for Genshin Impact characters
 * This allows any string as a character name
 */
export type CharacterName = string;

/**
 * Converts a character name to an icon filename using the standard naming convention
 * 
 * Note: Some character names may not match exactly with their icon filenames.
 * Common discrepancies include:
 * - "Hu Tao" → "UI_AvatarIcon_Hutao.png" (no space)
 * - "Yun Jin" → "UI_AvatarIcon_Yunjin.png" (no space)
 * - "Yae Miko" → "UI_AvatarIcon_Yae.png" (only first name used)
 * 
 * If you encounter such cases, you'll need to rename the image files to match
 * the standardized naming convention used by this function.
 * 
 * @param name Character name
 * @returns Standard filename pattern for the character icon
 */
export function getCharacterIconFilename(name: string): string {
  // Simply apply the standard naming convention
  return `UI_AvatarIcon_${name}.png`;
}