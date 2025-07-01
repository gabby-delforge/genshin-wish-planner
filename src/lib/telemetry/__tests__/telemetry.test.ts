import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as client from "../client";
import { generateSimulationId, getMixpanel } from "../client";
import { debouncedTelemetry } from "../debounced";
import { telemetry } from "../events";
import { telemetryUtils } from "../utils";

// Mock mixpanel
const mockTrack = vi.fn();
const mockGetDistinctId = vi.fn(() => "test-user-id");

vi.mock("mixpanel-browser", () => ({
  default: {
    init: vi.fn(),
    track: mockTrack,
    get_distinct_id: mockGetDistinctId,
  },
}));

// Mock client functions
vi.mock("../client", async () => {
  const actual = await vi.importActual("../client");
  return {
    ...actual,
    trackEvent: vi.fn(),
    getMixpanel: vi.fn(),
  };
});

describe("Telemetry Events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock behavior
    vi.mocked(getMixpanel).mockResolvedValue({
      track: mockTrack,
      get_distinct_id: mockGetDistinctId,
      init: vi.fn(),
      add_group: vi.fn(),
      alias: vi.fn(),
      clear_opt_in_out_tracking: vi.fn(),
      disable: vi.fn(),
      get_config: vi.fn(),
      get_group: vi.fn(),
      get_property: vi.fn(),
      has_opted_in_tracking: vi.fn(),
      has_opted_out_tracking: vi.fn(),
      identify: vi.fn(),
      opt_in_tracking: vi.fn(),
      opt_out_tracking: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
      remove_group: vi.fn(),
      reset: vi.fn(),
      set_config: vi.fn(),
      set_group: vi.fn(),
      time_event: vi.fn(),
      track_links: vi.fn(),
      track_forms: vi.fn(),
      track_pageview: vi.fn(),
      track_with_groups: vi.fn(),
      unregister: vi.fn(),
      people: {
        set: vi.fn(),
        set_once: vi.fn(),
        unset: vi.fn(),
        increment: vi.fn(),
        append: vi.fn(),
        union: vi.fn(),
        track_charge: vi.fn(),
        clear_charges: vi.fn(),
        delete_user: vi.fn(),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // Mock window for SSR tests
    Object.defineProperty(global, "window", {
      value: {
        innerWidth: 1024,
      },
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: {
        referrer: "https://example.com",
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Application Lifecycle Events", () => {
    test("app_loaded event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        load_time_ms: 1500,
        is_returning_user: true,
        state_version: 5,
        device_type: "desktop" as const,
      };

      await telemetry.appLoaded(properties);

      expect(trackEventSpy).toHaveBeenCalledWith("app_loaded", properties);
    });

    test("session_started event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        is_returning_user: false,
        device_type: "mobile" as const,
        referrer: "https://google.com",
      };

      await telemetry.sessionStarted(properties);

      expect(trackEventSpy).toHaveBeenCalledWith("session_started", properties);
    });
  });

  describe("Account Configuration Events", () => {
    test("account_field_updated event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        field_name: "character_pity" as const,
        old_value: 0,
        new_value: 50,
        is_first_setup: false,
      };

      await telemetry.accountFieldUpdated(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "account_field_updated",
        properties
      );
    });

    test("resource_updated event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        resource_type: "primogem" as const,
        old_value: 1000,
        new_value: 1600,
        change_delta: 600,
      };

      await telemetry.resourceUpdated(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "resource_updated",
        properties
      );
    });

    test("primogem_source_toggled event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        source_name: "dailyCommissions",
        enabled: true,
      };

      await telemetry.primogemSourceToggled(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "primogem_source_toggled",
        properties
      );
    });
  });

  describe("Banner Configuration Events", () => {
    test("wish_allocation_changed event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        banner_id: "5.3v1",
        target_type: "character" as const,
        target_id: "mavuika",
        target_name: "Mavuika",
        wishes_allocated: 180,
        previous_allocation: 0,
        action_type: "max_button" as const,
        is_current_banner: true,
      };

      await telemetry.wishAllocationChanged(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "wish_allocation_changed",
        properties
      );
    });

    test("constellation_target_changed event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        character_id: "mavuika",
        character_name: "Mavuika",
        banner_id: "5.3v1",
        old_constellation: 0,
        new_constellation: 1,
      };

      await telemetry.constellationTargetChanged(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "constellation_target_changed",
        properties
      );
    });

    test("weapon_refinement_changed event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        weapon_id: "surf_weapon",
        weapon_name: "Surf's Up",
        banner_id: "5.3v1",
        old_refinement: 1,
        new_refinement: 3,
      };

      await telemetry.weaponRefinementChanged(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "weapon_refinement_changed",
        properties
      );
    });

    test("epitomized_path_selected event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        banner_id: "5.3v1",
        weapon_id: "surf_weapon",
        weapon_name: "Surf's Up",
        previous_weapon_id: "other_weapon",
      };

      await telemetry.epitomizedPathSelected(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "epitomized_path_selected",
        properties
      );
    });
  });

  describe("Simulation Events", () => {
    test("simulation_started event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        simulation_id: "test_123_abc",
        simulation_count: 1000,
        total_characters_configured: 3,
        total_weapons_configured: 2,
        total_wishes_allocated: 500,
        banners_with_allocations: 2,
      };

      await telemetry.simulationStarted(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "simulation_started",
        properties
      );
    });

    test("simulation_finished event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        simulation_id: "test_123_abc",
        duration_ms: 2500,
        success: true,
        success_rates: { mavuika: 0.85 },
        scenarios: { best_case: 100 },
      };

      await telemetry.simulationFinished(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "simulation_finished",
        properties
      );
    });

    test("results_tab_viewed event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        tab: "scenarios" as const,
        simulation_count: 1000,
        time_since_simulation_ms: 5000,
      };

      await telemetry.resultsTabViewed(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "results_tab_viewed",
        properties
      );
    });
  });

  describe("Changelog Events", () => {
    test("changelog_opened event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        changelog_entries_count: 5,
        is_automatic_open: true,
      };

      await telemetry.changelogOpened(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "changelog_opened",
        properties
      );
    });

    test("changelog_closed event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        changelog_entries_count: 5,
        time_open_ms: 15000,
      };

      await telemetry.changelogClosed(properties);

      expect(trackEventSpy).toHaveBeenCalledWith(
        "changelog_closed",
        properties
      );
    });
  });

  describe("Error Tracking Events", () => {
    test("error_occurred event", async () => {
      const trackEventSpy = vi.spyOn(client, "trackEvent");

      const properties = {
        error_type: "TypeError",
        error_message: "Cannot read property 'name' of undefined",
        context: "simulation_execution",
        user_action: "run_simulation",
        stack_trace: "Error at line 123...",
      };

      await telemetry.errorOccurred(properties);

      expect(trackEventSpy).toHaveBeenCalledWith("error_occurred", properties);
    });
  });
});

describe("Debounced Telemetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("wish allocation changed debounced", async () => {
    const telemetrySpy = vi.spyOn(telemetry, "wishAllocationChanged");

    const properties = {
      banner_id: "5.3v1",
      target_type: "character" as const,
      target_id: "mavuika",
      target_name: "Mavuika",
      wishes_allocated: 50,
      previous_allocation: 0,
      action_type: "manual_input" as const,
      is_current_banner: true,
    };

    // Call multiple times rapidly
    debouncedTelemetry.wishAllocationChanged(properties);
    debouncedTelemetry.wishAllocationChanged({
      ...properties,
      wishes_allocated: 60,
    });
    debouncedTelemetry.wishAllocationChanged({
      ...properties,
      wishes_allocated: 70,
    });

    // Should not have been called yet
    expect(telemetrySpy).not.toHaveBeenCalled();

    // Fast forward time
    vi.advanceTimersByTime(500);

    // Should have been called once with the last value
    expect(telemetrySpy).toHaveBeenCalledOnce();
    expect(telemetrySpy).toHaveBeenCalledWith({
      ...properties,
      wishes_allocated: 70,
    });
  });

  test("resource updated debounced", async () => {
    const telemetrySpy = vi.spyOn(telemetry, "resourceUpdated");

    const properties = {
      resource_type: "primogem" as const,
      old_value: 1000,
      new_value: 1100,
      change_delta: 100,
    };

    // Call multiple times rapidly
    debouncedTelemetry.resourceUpdated(properties);
    debouncedTelemetry.resourceUpdated({
      ...properties,
      new_value: 1200,
      change_delta: 200,
    });

    // Should not have been called yet
    expect(telemetrySpy).not.toHaveBeenCalled();

    // Fast forward time
    vi.advanceTimersByTime(500);

    // Should have been called once with the last value
    expect(telemetrySpy).toHaveBeenCalledOnce();
    expect(telemetrySpy).toHaveBeenCalledWith({
      ...properties,
      new_value: 1200,
      change_delta: 200,
    });
  });

  test("debounced with custom key", async () => {
    const telemetrySpy = vi.spyOn(telemetry, "wishAllocationChanged");

    const properties1 = {
      banner_id: "5.3v1",
      target_type: "character" as const,
      target_id: "mavuika",
      target_name: "Mavuika",
      wishes_allocated: 50,
      previous_allocation: 0,
      action_type: "manual_input" as const,
      is_current_banner: true,
    };

    const properties2 = {
      ...properties1,
      target_id: "citlali",
      target_name: "Citlali",
    };

    // Call with different custom keys - should both fire
    debouncedTelemetry.wishAllocationChanged(properties1, "custom_key_1");
    debouncedTelemetry.wishAllocationChanged(properties2, "custom_key_2");

    vi.advanceTimersByTime(500);

    expect(telemetrySpy).toHaveBeenCalledTimes(2);
    expect(telemetrySpy).toHaveBeenCalledWith(properties1);
    expect(telemetrySpy).toHaveBeenCalledWith(properties2);
  });
});

describe("Telemetry Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getDeviceType - desktop", () => {
    Object.defineProperty(global, "window", {
      value: { innerWidth: 1200 },
      writable: true,
    });

    expect(telemetryUtils.getDeviceType()).toBe("desktop");
  });

  test("getDeviceType - tablet", () => {
    Object.defineProperty(global, "window", {
      value: { innerWidth: 800 },
      writable: true,
    });

    expect(telemetryUtils.getDeviceType()).toBe("tablet");
  });

  test("getDeviceType - mobile", () => {
    Object.defineProperty(global, "window", {
      value: { innerWidth: 500 },
      writable: true,
    });

    expect(telemetryUtils.getDeviceType()).toBe("mobile");
  });

  test("getDeviceType - SSR fallback", () => {
    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });

    expect(telemetryUtils.getDeviceType()).toBe("desktop");
  });

  test("getReferrer", () => {
    Object.defineProperty(global, "document", {
      value: { referrer: "https://example.com" },
      writable: true,
    });

    expect(telemetryUtils.getReferrer()).toBe("https://example.com");
  });

  test("getReferrer - SSR fallback", () => {
    Object.defineProperty(global, "document", {
      value: undefined,
      writable: true,
    });

    expect(telemetryUtils.getReferrer()).toBeUndefined();
  });

  test("truncateStackTrace - short string", () => {
    const shortTrace = "Error at line 123";
    expect(telemetryUtils.truncateStackTrace(shortTrace)).toBe(shortTrace);
  });

  test("truncateStackTrace - long string", () => {
    const longTrace = "a".repeat(1500);
    const truncated = telemetryUtils.truncateStackTrace(longTrace);
    expect(truncated).toBe("a".repeat(1000) + "...");
    expect(truncated.length).toBe(1003);
  });

  test("truncateStackTrace - custom max length", () => {
    const longTrace = "a".repeat(100);
    const truncated = telemetryUtils.truncateStackTrace(longTrace, 50);
    expect(truncated).toBe("a".repeat(50) + "...");
  });

  test("getTimeDifference", () => {
    const startTime = 1000;
    const mockNow = 2500;

    vi.spyOn(Date, "now").mockReturnValue(mockNow);

    expect(telemetryUtils.getTimeDifference(startTime)).toBe(1500);
  });
});

describe("Simulation ID Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Don't set up default mock behavior here, let each test set its own
  });

  test("generates ID with user ID when Mixpanel available", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });

    const id = await generateSimulationId();
    // Just check that it has the expected format: userid_timestamp_random
    expect(id).toMatch(/^.+_\d+_.+$/);
    expect(id).not.toMatch(/^ssr_/);
    expect(id).not.toMatch(/^client_/);
  });

  test("generates SSR fallback ID", async () => {
    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });

    vi.spyOn(Date, "now").mockReturnValue(1234567890);
    vi.spyOn(Math, "random").mockReturnValue(0.123456);

    const id = await generateSimulationId();
    expect(id).toMatch(/ssr_1234567890_/);
  });

  test("generates fallback ID when needed", async () => {
    // Just test that we can generate an ID without error
    const id = await generateSimulationId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(10);
    expect(id).toMatch(/_\d+_/); // Should contain timestamp
  });
});

describe("Type Safety", () => {
  test("all event property interfaces are properly typed", () => {
    // This test ensures TypeScript compilation passes with strict types
    // The actual type checking happens at compile time

    const appLoadedProps: Parameters<typeof telemetry.appLoaded>[0] = {
      load_time_ms: 1000,
      is_returning_user: true,
      state_version: 5,
      device_type: "desktop",
    };

    const wishAllocationProps: Parameters<
      typeof telemetry.wishAllocationChanged
    >[0] = {
      banner_id: "5.3v1",
      target_type: "character",
      target_id: "mavuika",
      target_name: "Mavuika",
      wishes_allocated: 180,
      previous_allocation: 0,
      action_type: "max_button",
      is_current_banner: true,
    };

    // These should compile without errors
    expect(appLoadedProps.device_type).toBe("desktop");
    expect(wishAllocationProps.target_type).toBe("character");
  });
});
