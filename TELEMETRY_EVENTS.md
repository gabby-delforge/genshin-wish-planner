# Telemetry Events for Genshin Wish Planner - Phase 1

This document outlines the fundamental telemetry events for the first implementation phase using Mixpanel. These events focus on core user interactions and are designed to be scalable and future-proof.

## Core Events

### 1. Application Lifecycle

#### `app_loaded`

**Description**: Application finishes loading
**Properties**:

- `load_time_ms` (number): Time taken to load
- `is_returning_user` (boolean): Whether user has existing saved state
- `state_version` (number): Current state version
- `device_type` (string): "mobile" | "tablet" | "desktop"

### 2. Account Configuration

#### `account_field_updated`

**Description**: User modifies a single account configuration field
**Properties**:

- `field_name` (string): "character_pity" | "weapon_pity" | "character_guaranteed" | "weapon_guaranteed" | "capturing_radiance"
- `old_value` (number|boolean): Previous value
- `new_value` (number|boolean): New value
- `is_first_setup` (boolean): Whether this is part of initial setup

#### `resource_updated`

**Description**: User updates their current resources
**Properties**:

- `resource_type` (string): "primogem" | "starglitter" | "limited_wish" | "stardust" | "genesis_crystal" | "standard_wish"
- `old_value` (number): Previous value
- `new_value` (number): New value
- `change_delta` (number): Difference between new and old value

#### `primogem_source_toggled`

**Description**: User enables/disables a primogem source
**Properties**:

- `source_name` (string): Name of the primogem source
- `enabled` (boolean): Whether source was enabled or disabled

### 3. Banner Configuration

#### `wish_allocation_changed`

**Description**: User allocates wishes to a character or weapon
**Properties**:

- `banner_id` (string): Banner identifier (e.g., "5.3v1")
- `target_type` (string): "character" | "weapon"
- `target_id` (string): Character or weapon identifier
- `target_name` (string): Character or weapon display name
- `wishes_allocated` (number): Number of wishes allocated
- `previous_allocation` (number): Previous allocation amount
- `action_type` (string): "manual_input" | "max_button" | "reset_button"
- `is_current_banner` (boolean): Whether this is the current active banner

#### `constellation_target_changed`

**Description**: User changes target constellation for a character
**Properties**:

- `character_id` (string): Character identifier
- `character_name` (string): Character display name
- `banner_id` (string): Banner identifier
- `old_constellation` (number): Previous target (0-6)
- `new_constellation` (number): New target (0-6)

#### `weapon_refinement_changed`

**Description**: User changes target refinement for a weapon
**Properties**:

- `weapon_id` (string): Weapon identifier
- `weapon_name` (string): Weapon display name
- `banner_id` (string): Banner identifier
- `old_refinement` (number): Previous target (1-5)
- `new_refinement` (number): New target (1-5)

#### `epitomized_path_selected`

**Description**: User selects epitomized path for weapon banner
**Properties**:

- `banner_id` (string): Banner identifier
- `weapon_id` (string): Selected weapon identifier
- `weapon_name` (string): Selected weapon display name
- `previous_weapon_id` (string|null): Previously selected weapon (if any)

### 4. Simulation

#### `simulation_started`

**Description**: User starts a simulation run
**Properties**:

- `simulation_id` (string): Unique identifier for this simulation
- `simulation_count` (number): Number of simulations run
- `total_characters_configured` (number): Number of characters with wishes allocated
- `total_weapons_configured` (number): Number of weapons with wishes allocated
- `total_wishes_allocated` (number): Total wishes allocated across all banners
- `banners_with_allocations` (number): Number of banners with any allocations

#### `simulation_finished`

**Description**: User completes a simulation run
**Properties**:

- `simulation_id` (string): Unique identifier for this simulation
- `duration_ms` (number): Time taken to complete
- `success` (boolean): Whether simulation completed successfully
- `success_rates` (object): Success rates for configured targets
- `scenarios` (object): Scenario data (best case, worst case, etc.)

#### `results_tab_viewed`

**Description**: User switches between result tabs
**Properties**:

- `tab` (string): "success_rates" | "scenarios"
- `simulation_count` (number): Number of simulations in current results
- `time_since_simulation_ms` (number): Time elapsed since simulation completed

### 5. Changelog

#### `changelog_opened`

**Description**: User opens the changelog modal
**Properties**:

- `changelog_entries_count` (number): Number of changelog entries shown
- `is_automatic_open` (boolean): Whether changelog opened automatically or manually

#### `changelog_closed`

**Description**: User closes the changelog modal
**Properties**:

- `changelog_entries_count` (number): Number of changelog entries that were shown
- `time_open_ms` (number): How long the changelog was open

### 6. Error Tracking

#### `error_occurred`

**Description**: An error occurs in the application
**Properties**:

- `error_type` (string): Category of error
- `error_message` (string): Error message
- `context` (string): Where the error occurred
- `user_action` (string): What the user was trying to do
- `stack_trace` (string): Stack trace (truncated if too long)

### 6. Session Tracking

#### `session_started`

**Description**: User starts a new session
**Properties**:

- `is_returning_user` (boolean): Whether user has existing state
- `device_type` (string): "mobile" | "tablet" | "desktop"
- `referrer` (string): How user arrived (if available)

## Event Implementation Guidelines

### Debouncing Strategy

- **Input Fields**: Debounce rapid changes (500ms) for wish allocations and resource inputs
- **Toggles**: Fire immediately for boolean toggles (primogem sources, guarantees)
- **Buttons**: Fire immediately for button clicks (Max, Reset, Simulate)

### Property Naming

- Use snake_case for consistency with common analytics conventions
- Include both old and new values for state changes to track user behavior patterns
- Always include contextual identifiers (banner_id, character_name) for filtering

### Scalability Considerations

- Event names are generic enough to handle future features (e.g., `wish_allocation_changed` works for any target type)
- Properties use enums/controlled vocabularies where possible for consistent filtering
- Include version/state information for handling schema evolution

### Privacy & Performance

- No PII is tracked (all data is about game state, not users)
- Events fire asynchronously to avoid blocking UI
- Large properties (like stack traces) are truncated if needed

## Initial Implementation Priority

These events provide the essential data needed to understand:

1. **User onboarding flow** - How users set up their accounts
2. **Feature adoption** - Which parts of the app users engage with
3. **Planning behavior** - How users allocate wishes and set targets
4. **Simulation usage** - Frequency and patterns of simulation use
5. **Technical health** - Load times, errors, and performance issues

This foundation can be extended with additional events as the product evolves, while maintaining consistency in the data model.
