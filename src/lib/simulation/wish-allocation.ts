import {
  ApiBanner,
  BannerConfiguration,
  BannerId,
  CharacterId,
  DEFAULT_PRIORITY,
  Priority,
  WeaponId,
} from "../types";

export class WishAllocation {
  startingWishes: number;
  wishesGainedPerBanner: number;
  banners: ApiBanner[];
  _allocation: Record<
    BannerId,
    {
      wishesAvailable: number;
      wishesSpent: number;
      wishesLeft: number;
      charAllocations: Partial<Record<CharacterId, number>>;
      weapAllocations: Partial<Record<WeaponId, number>>;
    }
  >;

  constructor(
    startingWishes: number,
    wishesGainedPerBanner: number,
    banners: ApiBanner[]
  ) {
    this.startingWishes = startingWishes;
    this.wishesGainedPerBanner = wishesGainedPerBanner;
    this.banners = banners;
    this._allocation = {};

    let carryOverWishes = this.startingWishes;
    for (const b of this.banners) {
      const charAlloc: Partial<Record<CharacterId, number>> = {};
      for (const charId of b.characters) {
        charAlloc[charId] = 0;
      }
      const weapAlloc: Partial<Record<WeaponId, number>> = {};
      for (const weapId of b.weapons) {
        weapAlloc[weapId] = 0;
      }
      this._allocation[b.id] = {
        wishesAvailable: carryOverWishes,
        wishesSpent: 0,
        wishesLeft: carryOverWishes,
        charAllocations: charAlloc,
        weapAllocations: weapAlloc,
      };
      carryOverWishes += wishesGainedPerBanner;
    }
  }

  get allocation(): Record<string, BannerConfiguration> {
    const alloc: Record<string, BannerConfiguration> = {};
    for (const k of Object.keys(this._allocation)) {
      const bannerId = k;
      const allocation = this._allocation[bannerId];

      const charConfig: Record<
        CharacterId,
        {
          wishesAllocated: number;
          maxConstellation: number;
          priority: Priority;
        }
      > = {};
      for (const charId of Object.keys(allocation.charAllocations)) {
        charConfig[charId] = {
          wishesAllocated: allocation.charAllocations[charId]!,
          maxConstellation: 0, // TODO: ?
          priority: DEFAULT_PRIORITY,
        };
      }
      const weapConfig: Record<
        WeaponId,
        {
          wishesAllocated: number;
          priority: Priority;
        }
      > = {};
      for (const weaponId of Object.keys(allocation.weapAllocations)) {
        weapConfig[weaponId] = {
          wishesAllocated: allocation.weapAllocations[weaponId]!,
          priority: DEFAULT_PRIORITY,
        };
      }
      const currBanner = this.banners.find((b) => b.id === bannerId)!;
      alloc[bannerId] = {
        banner: currBanner,
        isCurrentBanner: false, // TODO: These properties shouldn't be passed around everywhere
        isOldBanner: false, // TODO: " "
        characters: charConfig,
        weapons: weapConfig,
        weaponBanner: {
          wishesAllocated: 0,
          epitomizedPath: currBanner.weapons[0],
          maxRefinement: 0,
          strategy: "stop",
        },
      };
    }
    return alloc;
  }

  // Tries to allocate `amount` of wishes to the specified banner & character.
  // Returns that actual amount of wishes that were allocated, based on how many were available
  // for that banner.
  allocate(
    bannerId: BannerId,
    characterId: CharacterId,
    amount: number
  ): number {
    const banner = this._allocation[bannerId];

    const maxAmountToSpend = Math.min(amount, banner.wishesAvailable);

    let amountToSpend = maxAmountToSpend;
    // We need to determine how many wishes we can ACTUALLY spend, because
    // some wishes might be needed for future allocations that have already
    // been set.
    let amountEarned = 0;
    for (const b of this.banners) {
      if (b.id.localeCompare(bannerId) > 0) {
        // This is a future banner
        amountEarned += this.wishesGainedPerBanner;

        // Skip if we don't have any allocations
        const alloc = this._allocation[b.id].wishesSpent;
        if (alloc === 0) continue;

        if (alloc > amountEarned) {
          // We need some amount of wishes from the current banner
          amountToSpend = Math.min(
            amountToSpend,
            maxAmountToSpend - (alloc - amountEarned)
          );
        }
      }
    }

    if (amountToSpend === 0) {
      return 0;
    }

    banner.wishesLeft -= amountToSpend;
    banner.wishesSpent += amountToSpend;

    // Adjust all future banners, since they'll now have less wishes available
    for (const b of this.banners) {
      if (b.id.localeCompare(bannerId) > 0) {
        // This is a future banner
        this._allocation[b.id].wishesAvailable -= amountToSpend;
        this._allocation[b.id].wishesLeft -= amountToSpend;
      }
    }

    return amountToSpend;
  }
}
