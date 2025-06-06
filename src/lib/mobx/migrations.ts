/**
 * State Migrations
 *
 * Handles migration between different state schema versions.
 */

import bannersData from "../../../public/metadata/banners.json";
import { BannerConfiguration, BannerId } from "../types";
import { initializeBannerConfigurations } from "./initializers";

export const migrations: Record<
  number,
  (state: Record<string, unknown>) => Record<string, unknown>
> = {
  // Migration from v1 to v2: Split accountStatusCurrentPity into characterPity and weaponPity
  1: (state) => {
    const oldPity = (state.accountStatusCurrentPity as number) || 0;

    // Create new state object, explicitly excluding the old field
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { accountStatusCurrentPity, ...restState } = state;

    return {
      ...restState,
      version: 2,
      characterPity: oldPity, // Migrate old pity to character pity
      weaponPity: 0, // New field starts at 0
    };
  },

  // Migration from v2 to v3: Update banner data and migrate character wish allocations
  2: (state) => {
    const oldBannerConfiguration = state.bannerConfiguration as Record<
      BannerId,
      BannerConfiguration
    >;
    const newBannerConfiguration = initializeBannerConfigurations(bannersData);

    // Create character mapping for characters that moved between banners
    const characterMigrationMap: Record<
      string,
      { from: BannerId; to: BannerId }
    > = {
      emilie: { from: "5.7v1", to: "5.7v2" },
      shenhe: { from: "5.7v2", to: "5.7v1" },
    };

    // Create weapon mapping for weapons that moved between banners
    const weaponMigrationMap: Record<string, { from: BannerId; to: BannerId }> =
      {
        "lumidouce-elegy": { from: "5.7v1", to: "5.7v2" },
        "calamity-queller": { from: "5.7v2", to: "5.7v1" },
      };

    // Transfer wish allocations for characters that moved
    Object.entries(characterMigrationMap).forEach(
      ([characterId, { from, to }]) => {
        const oldCharacterConfig =
          oldBannerConfiguration[from]?.characters?.[characterId];
        if (
          oldCharacterConfig &&
          newBannerConfiguration[to]?.characters?.[characterId]
        ) {
          newBannerConfiguration[to].characters[characterId] = {
            wishesAllocated: oldCharacterConfig.wishesAllocated,
            maxConstellation: oldCharacterConfig.maxConstellation,
            priority: oldCharacterConfig.priority,
          };
        }
      }
    );

    // Transfer weapon banner settings for weapons that moved (if epitomized path was set to moved weapon)
    Object.entries(weaponMigrationMap).forEach(([weaponId, { from, to }]) => {
      const oldWeaponConfig = oldBannerConfiguration[from]?.weaponBanner;
      if (
        oldWeaponConfig?.epitomizedPath === weaponId &&
        newBannerConfiguration[to]
      ) {
        newBannerConfiguration[to].weaponBanner = {
          ...newBannerConfiguration[to].weaponBanner,
          wishesAllocated: oldWeaponConfig.wishesAllocated,
          epitomizedPath: weaponId, // TypeScript will ensure this is a valid WeaponId
          strategy: oldWeaponConfig.strategy,
        };
      }
    });

    // Preserve settings for characters that didn't move
    Object.entries(oldBannerConfiguration).forEach(([bannerId, oldConfig]) => {
      if (newBannerConfiguration[bannerId]) {
        Object.entries(oldConfig.characters).forEach(
          ([characterId, charConfig]) => {
            // Only preserve if character didn't move (not in migration map)
            if (
              !characterMigrationMap[characterId] &&
              newBannerConfiguration[bannerId].characters[characterId]
            ) {
              newBannerConfiguration[bannerId].characters[characterId] = {
                wishesAllocated: charConfig.wishesAllocated,
                maxConstellation: charConfig.maxConstellation,
                priority: charConfig.priority,
              };
            }
          }
        );

        // Preserve weapon banner settings (only if not already migrated from another banner)
        const weaponAlreadyMigrated = Object.values(weaponMigrationMap).some(
          ({ to }) => to === bannerId
        );
        if (!weaponAlreadyMigrated && oldConfig.weaponBanner) {
          newBannerConfiguration[bannerId].weaponBanner = {
            ...newBannerConfiguration[bannerId].weaponBanner,
            wishesAllocated: oldConfig.weaponBanner.wishesAllocated || 0,
            epitomizedPath:
              oldConfig.weaponBanner.epitomizedPath ||
              newBannerConfiguration[bannerId].weaponBanner.epitomizedPath,
            strategy:
              oldConfig.weaponBanner.strategy ||
              newBannerConfiguration[bannerId].weaponBanner.strategy,
          };
        }
      }
    });

    return {
      ...state,
      version: 3,
      banners: bannersData,
      bannerConfiguration: newBannerConfiguration,
    };
  },
};

export function migrateState(
  state: Record<string, unknown>,
  targetVersion: number
): Record<string, unknown> {
  let currentState = state;
  let currentVersion = (state.version as number) || 1;

  while (currentVersion < targetVersion) {
    const migration = migrations[currentVersion];
    if (!migration) {
      throw new Error(`No migration found for version ${currentVersion}`);
    }
    currentState = migration(currentState);
    currentVersion++;
  }

  return currentState;
}

export function validateStateVersion(
  state: Record<string, unknown>,
  expectedVersion: number
): boolean {
  const stateVersion = (state.version as number) || 1;
  return stateVersion <= expectedVersion;
}
