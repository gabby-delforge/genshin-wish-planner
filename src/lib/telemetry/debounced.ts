// Debounced telemetry for input fields
import { telemetry } from "./events";
import type {
  WishAllocationChangedProperties,
  ResourceUpdatedProperties,
} from "./types";

// Debounced telemetry for input fields (500ms delay)
const debouncedTrackers = new Map<string, NodeJS.Timeout>();

export const debouncedTelemetry = {
  // Debounced wish allocation tracking
  wishAllocationChanged: (properties: WishAllocationChangedProperties, debounceKey?: string): void => {
    const key = debounceKey || `wish_${properties.banner_id}_${properties.target_id}`;
    
    // Clear existing timeout
    const existingTimeout = debouncedTrackers.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      telemetry.wishAllocationChanged(properties);
      debouncedTrackers.delete(key);
    }, 500);

    debouncedTrackers.set(key, timeout);
  },

  // Debounced resource tracking
  resourceUpdated: (properties: ResourceUpdatedProperties, debounceKey?: string): void => {
    const key = debounceKey || `resource_${properties.resource_type}`;
    
    const existingTimeout = debouncedTrackers.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      telemetry.resourceUpdated(properties);
      debouncedTrackers.delete(key);
    }, 500);

    debouncedTrackers.set(key, timeout);
  },
};