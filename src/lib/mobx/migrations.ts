/**
 * State Migrations
 *
 * Handles migration between different state schema versions.
 */

import bannersData from "../../../public/metadata/banners.json";
import { BannerId } from "../types";
import * as StateTypes from "./snapshots";
import { VersionedState } from "./snapshots";

export const migrations: Record<
  number,
  (state: VersionedState) => VersionedState
> = {
  // Migration from v1 to v2: Split accountStatusCurrentPity into characterPity and weaponPity
  1: (_state) => {
    const state = _state as StateTypes.V1.GenshinStateV1;

    const oldPity = (state.accountStatusCurrentPity as number) || 0;

    // Create new state object, explicitly excluding the old field
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { accountStatusCurrentPity, ...restState } = state;

    return {
      ...restState,
      version: 2,
      characterPity: oldPity, // Migrate old pity to character pity
      weaponPity: 0, // New field starts at 0
    } as StateTypes.V2.GenshinStateV2;
  },

  // Migration from v2 to v3: Update banner data and migrate character wish allocations
  2: (_state) => {
    const state = _state as StateTypes.V2.GenshinStateV2;
    const oldBannerConfiguration =
      (state.bannerConfiguration as Record<
        StateTypes.V2.BannerId,
        StateTypes.V2.BannerConfiguration
      >) || {};
    const newBannerConfiguration = {} as Record<
      StateTypes.V3.BannerId,
      StateTypes.V3.BannerConfiguration
    >;

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
          newBannerConfiguration[to]?.characters?.[
            characterId as StateTypes.V3.CharacterId
          ]
        ) {
          newBannerConfiguration[to].characters[
            characterId as StateTypes.V3.CharacterId
          ] = {
            wishesAllocated: oldCharacterConfig.wishesAllocated,
            maxConstellation: oldCharacterConfig.maxConstellation,
            priority: oldCharacterConfig.priority as StateTypes.V3.Priority,
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
          epitomizedPath: weaponId as StateTypes.V3.WeaponId, // TypeScript will ensure this is a valid WeaponId
          strategy:
            oldWeaponConfig.strategy as StateTypes.V3.WeaponBannerConfig["strategy"],
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
              newBannerConfiguration[bannerId].characters[
                characterId as StateTypes.V3.CharacterId
              ]
            ) {
              newBannerConfiguration[bannerId].characters[
                characterId as StateTypes.V3.CharacterId
              ] = {
                wishesAllocated: charConfig.wishesAllocated,
                maxConstellation: charConfig.maxConstellation,
                priority: charConfig.priority as StateTypes.V3.Priority,
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
            epitomizedPath: (oldConfig.weaponBanner.epitomizedPath ||
              newBannerConfiguration[bannerId].weaponBanner
                .epitomizedPath) as StateTypes.V3.WeaponId,
            strategy: (oldConfig.weaponBanner.strategy ||
              newBannerConfiguration[bannerId].weaponBanner
                .strategy) as StateTypes.V3.WeaponBannerConfig["strategy"],
          };
        }
      }
    });

    return {
      ...state,
      version: 3,
      banners: bannersData,
      bannerConfiguration: newBannerConfiguration,
    } as StateTypes.V3.GenshinStateV3;
  },

  // Migration from v3 to v4
  // Generated on: 2025-06-06T15:40:09.154Z
  3: (state) => {
    const typedState = state as StateTypes.V3.GenshinStateV3;
    // TODO: Implement migration from v3 to v4
    // Changes detected:
    // + isNextCharacterFeaturedGuaranteed: (new field)
    // + isNextWeaponFeaturedGuaranteed: (new field)
    // + ownedWishResources: (new field)
    // + primogemSources: (new field)
    // + shouldExcludeCurrentBannerEarnedWishes: (new field)
    // - accountStatusIsNextFiftyFiftyGuaranteed: (removed field)
    // - accountStatusOwnedWishResources: (removed field)
    // - accountStatusPrimogemSources: (removed field)
    // - accountStatusExcludeCurrentBannerPrimogemSources: (removed field)
    // - banners: (removed field)

    const mappedBannerConfig: Record<
      string,
      StateTypes.V4.BannerConfiguration
    > = {};
    Object.entries(typedState.bannerConfiguration).forEach(([v, bc]) => {
      mappedBannerConfig[v] = {
        ...bc,
        bannerId: bc.banner.id as StateTypes.V4.BannerId,
      };
    });

    return {
      ...typedState,
      version: 4,
      isNextCharacterFeaturedGuaranteed:
        typedState.accountStatusIsNextFiftyFiftyGuaranteed,
      isNextWeaponFeaturedGuaranteed: false,
      ownedWishResources: typedState.accountStatusOwnedWishResources,
      primogemSources: typedState.accountStatusPrimogemSources,
      shouldExcludeCurrentBannerEarnedWishes:
        typedState.accountStatusExcludeCurrentBannerPrimogemSources,
      bannerConfiguration: mappedBannerConfig,
    } as StateTypes.V4.GenshinStateV4;
  },
};

export function migrateState(
  state: Record<string, unknown>,
  targetVersion: number
): VersionedState {
  let currentState = state as unknown as VersionedState;
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
