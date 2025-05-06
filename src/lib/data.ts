import type { ApiBanner, ApiCharacter, Banner, Character } from "./types";

// API Data (simulating data that would come from an external API)
// --------------------------------------------------------------

// API Character data
export const API_CHARACTERS: Record<string, ApiCharacter> = {
  Escoffier: {
    id: "escoffier",
    name: "Escoffier",
    rarity: 5,
    element: "Cryo",
    weaponType: "Sword",
  },
  Navia: {
    id: "navia",
    name: "Navia",
    rarity: 5,
    element: "Geo",
    weaponType: "Claymore",
  },
  Kinich: {
    id: "kinich",
    name: "Kinich",
    rarity: 5,
    element: "Dendro",
    weaponType: "Claymore",
  },
  Raiden: {
    id: "raiden",
    name: "Raiden",
    rarity: 5,
    element: "Electro",
    weaponType: "Polearm",
  },
  Skirk: {
    id: "skirk",
    name: "Skirk",
    rarity: 5,
    element: "Cryo",
    weaponType: "Sword",
  },
  Mavuika: {
    id: "mavuika",
    name: "Mavuika",
    rarity: 5,
    element: "Pyro",
    weaponType: "Claymore",
  },
};

// API Banner data
export const API_BANNERS: ApiBanner[] = [
  {
    id: "5.6v1",
    version: "5.6v1",
    name: "5.6v1",
    startDate: "2024-05-01",
    endDate: "2024-05-15",
    characters: [API_CHARACTERS.Escoffier, API_CHARACTERS.Navia],
  },
  {
    id: "5.6v2",
    version: "5.6v2",
    name: "5.6v2",
    startDate: "2024-05-16",
    endDate: "2024-05-30",
    characters: [API_CHARACTERS.Kinich, API_CHARACTERS.Raiden],
  },
  {
    id: "5.7v1",
    version: "5.7v1",
    name: "5.7v1",
    startDate: "2024-06-01",
    endDate: "2024-06-15",
    characters: [API_CHARACTERS.Skirk, API_CHARACTERS.Mavuika],
  },
  {
    id: "5.7v2",
    version: "5.7v2",
    name: "5.7v2",
    startDate: "2024-06-16",
    endDate: "2024-06-30",
    characters: [API_CHARACTERS.Mavuika, API_CHARACTERS.Raiden],
  },
];

// Helper function to convert API data to application state
// -------------------------------------------------------

// Convert API character to application Character with state
export const apiCharacterToCharacter = (apiChar: ApiCharacter): Character => ({
  ...apiChar,
  wishesToSpend: 0,
  priority: "skip",
});

// Convert API banner to application Banner with state
export const apiBannerToBanner = (apiBanner: ApiBanner): Banner => ({
  ...apiBanner,
  characters: apiBanner.characters.map(apiCharacterToCharacter),
});

// Initial banners with application state for new users
export const initialBanners: Banner[] = API_BANNERS.map(apiBannerToBanner);
