# Feature Spec: Overflow Priority System for Leftover Wishes

## Problem Statement

Currently, when players set a maximum constellation target (e.g., "Pull until C1") and allocate wishes to a banner, the simulator doesn't account for scenarios where they get the character early and have leftover wishes. These potential leftover wishes aren't included in future banner availability counts, forcing players to only plan with "guaranteed" wishes.

However, in practice, players often want to reallocate these leftover wishes to future banners if they get lucky. This creates a gap between the simulator and real player behavior.

## Solution: Overflow Priority System

Implement a system that allows players to specify where leftover wishes should be allocated when they achieve their constellation goal early.

## User Stories

P0:

- **As a player**, I want to know when I've specified more wishes for one character than would be needed to get my desired constellation (ie. >180 wishes, when I'm trying to get C0) and have a way of easily correcting this.

P1:

- **As a player**, I want to specify what happens to my leftover wishes when I get a character early, so I can plan more realistic wish allocation strategies.

P2:

- **As a player**, I want to see potential overflow amounts in future banner availability, so I can make informed decisions about stretch goals.
- **As a player**, I want the system to clearly distinguish between guaranteed and potential wishes, so I understand the uncertainty involved.

## Requirements

### Core Functionality

0. **Indicate when wishes are over-allocated**

   - Inform players in some way when they've allocated more wishes than are needed for 100% certainty of getting a certain character/constellation.
   - Even if these instances are not fixed by the player, the simulator should /automatically carry over/ the redundant wishes to future banners, and that redundant amount should be visible in the [X wishes available] text for future banners.

1. **Overflow Configuration per Banner**

   - Add an "overflow settings" section to each banner where the player has set a constellation limit
   - Provide a dropdown with options:
     - "Save for later" (default)
     - "Next priority banner"
     - "Continue current banner"
     - "Specific banner" (with banner selector)

2. **Overflow Amount Calculation**

   - Calculate potential overflow based on constellation target and allocated wishes
   - For "Pull until CX" targets, overflow = allocated_wishes - worst_case_wishes_needed
   - Display overflow as a range (e.g., "0-160 overflow") since it's RNG-dependent

3. **Future Banner Availability Updates**

   - Update future banner availability to show: "X guaranteed + Y-Z overflow"
   - Use different visual styling (colors/badges) to distinguish guaranteed vs overflow wishes
   - Only show overflow if a previous banner has overflow settings configured

4. **Simulation Integration**
   - Run multiple simulation scenarios accounting for different overflow amounts
   - Weight results based on probability of different overflow scenarios
   - Display results showing both guaranteed outcomes and probable outcomes with overflow

### UI/UX Requirements

1. **Visual Design**

   - Use distinct colors for guaranteed vs overflow wishes (e.g., blue for guaranteed, yellow for overflow)
   - Add help tooltips explaining the overflow concept
   - Keep overflow settings collapsed by default to avoid overwhelming new users

2. **Information Hierarchy**

   - Show overflow settings only when relevant (when constellation limits are set)
   - Display overflow amounts prominently in future banner headers
   - Clearly label uncertain nature of overflow wishes

3. **User Flow**
   - Overflow settings appear automatically when user sets a constellation limit
   - Default to "Save for later" to maintain current behavior
   - Allow easy switching between overflow destinations
