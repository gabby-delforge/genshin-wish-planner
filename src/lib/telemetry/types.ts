// TypeScript interfaces for telemetry events

export interface AppLoadedProperties {
  load_time_ms: number;
  is_returning_user: boolean;
  state_version: number;
  device_type: "mobile" | "tablet" | "desktop";
}

export interface AccountFieldUpdatedProperties {
  field_name:
    | "character_pity"
    | "weapon_pity"
    | "character_guaranteed"
    | "weapon_guaranteed"
    | "capturing_radiance";
  old_value: number | boolean;
  new_value: number | boolean;
  is_first_setup: boolean;
}

export interface ResourceUpdatedProperties {
  resource_type:
    | "primogem"
    | "starglitter"
    | "limited_wishes"
    | "stardust"
    | "genesis_crystal"
    | "standard_wish";
  old_value: number;
  new_value: number;
  change_delta: number;
}

export interface PrimogemSourceToggledProperties {
  source_name: string;
  enabled: boolean;
}

export interface WishAllocationChangedProperties {
  banner_id: string;
  target_type: "character" | "weapon";
  target_id: string;
  target_name: string;
  wishes_allocated: number;
  previous_allocation: number;
  action_type: "manual_input" | "max_button" | "reset_button";
  is_current_banner: boolean;
}

export interface ConstellationTargetChangedProperties {
  character_id: string;
  character_name: string;
  banner_id: string;
  old_constellation: number;
  new_constellation: number;
}

export interface WeaponRefinementChangedProperties {
  weapon_id: string;
  weapon_name: string;
  banner_id: string;
  old_refinement: number;
  new_refinement: number;
}

export interface EpitomizedPathSelectedProperties {
  banner_id: string;
  weapon_id: string;
  weapon_name: string;
  previous_weapon_id: string | null;
}

export interface SimulationStartedProperties {
  simulation_id: string;
  simulation_count: number;
  total_characters_configured: number;
  total_weapons_configured: number;
  total_wishes_allocated: number;
  banners_with_allocations: number;
}

export interface SimulationFinishedProperties {
  simulation_id: string;
  duration_ms: number;
  success: boolean;
  success_rates?: object; // Character success rates data
  scenarios?: object; // Scenario results data
}

export interface ResultsTabViewedProperties {
  tab: "success_rates" | "scenarios";
  simulation_count: number;
  time_since_simulation_ms: number;
}

export interface ChangelogOpenedProperties {
  changelog_entries_count: number;
  is_automatic_open?: boolean;
}

export interface ChangelogClosedProperties {
  changelog_entries_count: number;
  time_open_ms: number;
}

export interface ErrorOccurredProperties {
  error_type: string;
  error_message: string;
  context: string;
  user_action: string;
  stack_trace?: string;
}

export interface SessionStartedProperties {
  is_returning_user: boolean;
  device_type: "mobile" | "tablet" | "desktop";
  referrer?: string;
}

// Export Mixpanel type for external use
export type { Mixpanel } from "mixpanel-browser";
