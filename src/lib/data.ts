import Banners from "../../public/metadata/banners.json";
import Characters from "../../public/metadata/characters.json";
import Weapons from "../../public/metadata/weapons.json";

import {
  ApiWeapon,
  CharacterId,
  PrimogemSourceValues,
  type ApiBanner,
  type ApiCharacter,
} from "./types";

export const GENSHIN_CHARACTERS = Characters.map((c) => c.Id);
export const GENSHIN_WEAPONS = Weapons.map((c) => c.Id);
// API Data (simulating data that would come from an external API)
// --------------------------------------------------------------

// API Character data
export const API_CHARACTERS: Partial<Record<CharacterId, ApiCharacter>> =
  Characters.reduce((prev, curr) => {
    prev[curr.Id] = curr;
    return prev; //
  }, {} as Partial<Record<CharacterId, ApiCharacter>>);

export const API_WEAPONS: Partial<Record<string, ApiWeapon>> = Weapons.reduce(
  (prev, curr) => {
    prev[curr.Id] = curr;
    return prev;
  },
  {} as Partial<Record<string, ApiWeapon>>
);

// API Banner data
export const API_BANNERS: ApiBanner[] = Banners;

// Helper function to convert API data to application state
// -------------------------------------------------------

// Initial banners with application state for new users
export const initialBanners: ApiBanner[] = API_BANNERS;

export const PRIMOGEM_SOURCE_VALUES: PrimogemSourceValues = {
  gameUpdateCompensation: { value: 600, type: "primogem" },
  dailyCommissions: { value: 2520, type: "primogem" },
  paimonBargain: [
    { value: 5, type: "limitedWishes" },
    { value: 5, type: "standardWish" },
  ],
  abyss: { value: 800, type: "primogem" },
  imaginarium: { value: 800, type: "primogem" },
  battlePass: { value: 5, type: "standardWish" },
  battlePassGnostic: [
    { value: 4, type: "limitedWishes" },
    { value: 680, type: "primogem" },
  ],
  welkinMoon: { value: 3780, type: "primogem" },
  archonQuest: [
    { value: 2, type: "limitedWishes" },
    { value: 620, type: "primogem" },
  ],
  storyQuests: { value: 120, type: "primogem" },
  newAchievements: { value: 200, type: "primogem" },

  // Time-Limited Contents
  characterTestRuns: { value: 80, type: "primogem" },
  eventActivities: { value: 1000, type: "primogem" },
  hoyolabDailyCheckIn: { value: 100, type: "primogem" },
  hoyolabWebEvents: { value: 100, type: "primogem" },
  livestreamCodes: { value: 300, type: "primogem" },
  newVersionCode: { value: 60, type: "primogem" },
  limitedExplorationRewards: { value: 400, type: "primogem" },
  thankYouGift: [
    { value: 10, type: "limitedWishes" },
    { value: 1600, type: "primogem" },
  ],
};
