// Event tracking functions
import { trackEvent } from "./client";
import type {
  AppLoadedProperties,
  AccountFieldUpdatedProperties,
  ResourceUpdatedProperties,
  PrimogemSourceToggledProperties,
  WishAllocationChangedProperties,
  ConstellationTargetChangedProperties,
  WeaponRefinementChangedProperties,
  EpitomizedPathSelectedProperties,
  SimulationStartedProperties,
  SimulationFinishedProperties,
  ResultsTabViewedProperties,
  ChangelogOpenedProperties,
  ChangelogClosedProperties,
  ErrorOccurredProperties,
  SessionStartedProperties,
} from "./types";

export const telemetry = {
  // Application Lifecycle
  appLoaded: async (properties: AppLoadedProperties): Promise<void> => {
    await trackEvent("app_loaded", properties);
  },

  sessionStarted: async (properties: SessionStartedProperties): Promise<void> => {
    await trackEvent("session_started", properties);
  },

  // Account Configuration
  accountFieldUpdated: async (properties: AccountFieldUpdatedProperties): Promise<void> => {
    await trackEvent("account_field_updated", properties);
  },

  resourceUpdated: async (properties: ResourceUpdatedProperties): Promise<void> => {
    await trackEvent("resource_updated", properties);
  },

  primogemSourceToggled: async (properties: PrimogemSourceToggledProperties): Promise<void> => {
    await trackEvent("primogem_source_toggled", properties);
  },

  // Banner Configuration
  wishAllocationChanged: async (properties: WishAllocationChangedProperties): Promise<void> => {
    await trackEvent("wish_allocation_changed", properties);
  },

  constellationTargetChanged: async (properties: ConstellationTargetChangedProperties): Promise<void> => {
    await trackEvent("constellation_target_changed", properties);
  },

  weaponRefinementChanged: async (properties: WeaponRefinementChangedProperties): Promise<void> => {
    await trackEvent("weapon_refinement_changed", properties);
  },

  epitomizedPathSelected: async (properties: EpitomizedPathSelectedProperties): Promise<void> => {
    await trackEvent("epitomized_path_selected", properties);
  },

  // Simulation
  simulationStarted: async (properties: SimulationStartedProperties): Promise<void> => {
    await trackEvent("simulation_started", properties);
  },

  simulationFinished: async (properties: SimulationFinishedProperties): Promise<void> => {
    await trackEvent("simulation_finished", properties);
  },

  resultsTabViewed: async (properties: ResultsTabViewedProperties): Promise<void> => {
    await trackEvent("results_tab_viewed", properties);
  },

  // Changelog
  changelogOpened: async (properties: ChangelogOpenedProperties): Promise<void> => {
    await trackEvent("changelog_opened", properties);
  },

  changelogClosed: async (properties: ChangelogClosedProperties): Promise<void> => {
    await trackEvent("changelog_closed", properties);
  },

  // Error Tracking
  errorOccurred: async (properties: ErrorOccurredProperties): Promise<void> => {
    await trackEvent("error_occurred", properties);
  },
};