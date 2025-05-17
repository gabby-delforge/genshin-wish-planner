# Genshin Impact Wishing System Overview

## Banner Types

In Genshin Impact, there are several types of "wish banners" (gacha):

1. **Character Event Wish**: Limited-time banners featuring specific 5-star and 4-star characters
2. **Weapon Event Wish**: Limited-time banners featuring specific 5-star weapons
3. **Standard Wish**: Limited-time banners featuring specific 5-star characters and 4-star characters
4. **Chronicled Wish**: Limited-time banners featuring many 5-star characters, usually from the same region

This application focuses on the first type, Character Event Wish.

## Banner Structure

- Each version (e.g., 5.5) has two banner phases (v1, v2)
- Each banner phase features 2 limited 5-star characters ("banners") and 3 rate-up 4-star characters. The 4-star characters are the same for each banner.
- Banners are identified by their version number (e.g., "5.5v1" for version 5.5, first half)

## Key Mechanics

### Pity System

- **Standard Pity**:

  - 5-star drop rate is 0.6% by default
  - At 74+ pulls, "soft pity" begins, gradually increasing the 5-star rate
  - At 90 pulls, "hard pity" guarantees a 5-star character (rarely reached due to soft pity)

- **Guaranteed System**:
  - When pulling a 5-star character, there's a 50% chance to get the featured character ("winning the 50/50")
  - If you "lose the 50/50", you get a standard 5-star character
  - After losing a 50/50, your next 5-star is guaranteed to be the featured character
  - This guarantee carries over between banners of the same type

### Pity Counter

- Each banner type has its own pity counter
- Pity and guarantee status carry over when banners change (e.g., from 5.5v1 to 5.5v2)

## Planning Considerations

### Wish Resources

- **Primogems**: Primary currency (160 primogems = 1 wish)
- **Intertwined Fates**: Direct wish currency for character/weapon banners
- **Starglitter**: Obtained from duplicate characters, can be exchanged for wishes

### Resource Estimation

- **Welkin Moon**: Paid blessing that provides 90 primogems daily (~17 extra wishes per month)
- **Battle Pass**: Paid progression system providing ~8-10 wishes per version
- **Events & Updates**: Each version provides roughly 50-70 wishes from events, maintenance, etc.

## Simulation Approach - "Playground Mode"

1. **Allocation Phase**:

   - Players allocate wishes to specific characters they want
   - Wishes are "used" in banner order (chronologically)

2. **Simulation**:

   - Starting with current pity/guarantee status
   - For each banner:
     - For each character with wishes allocated on that banner:
       - Simulate pulls until either:
         - The character is obtained
         - Allocated wishes are exhausted
       - Record success/failure and update pity/guarantee status

3. **Results Analysis**:
   - Calculate success rates for each character
   - Identify common outcome scenarios
   - Visualize probability distributions

This simulation helps players simulate different scenarios to find the optimal allocation of wishes for their most desired characters, as well as visualize the accumulation of wishes over time.

## Simulation Approach - "Strategy Mode"

1. **Allocation Phase**:

   - Players indicate which characters they want to obtain, and their relative priorities / degree of desire
   - As an example, a player can mark a character as a "must have", in which case the simulation will only output allocations that guarantee the character.
   - As another example, a player can mark a character as a "want", in which case the simulation will prioritize "must have" characters over this character, try to target a high probability of obtaining this character, but the simulation will not guarantee the character.
   - The simulation runs "in reverse", testing many different allocation strategies
   - The simulation will output the optimal allocations for each banner
   - In the (likely) scenario that it is not possible to obtain all desired characters with the necessary probabilities, the simulation will:
     - Tell the player what the optimal allocation is for each banner
     - Tell the player how many wishes they would need to obtain to make up the difference
     - Tell the player what the optimal allocation is for their actual wishes, even if some characters won't be obtained / guaranteed

This simulation helps players strategically allocate their limited resources to maximize chances of obtaining their most desired characters.
