#!/usr/bin/env npx tsx

/**
 * Generate State Snapshot
 * 
 * Creates a snapshot of the actual initial state data for a given version.
 */

import { GenshinState } from '../src/lib/mobx/genshin-state';

function generateStateSnapshot(version: number) {
  // Create a temporary instance to get the actual initial state data
  const tempState = new GenshinState('temp-snapshot');
  const stateShape = tempState.getStateShape();
  
  // Set the version explicitly
  const snapshot = {
    ...stateShape,
    version,
  };
  
  console.log(JSON.stringify(snapshot, null, 2));
}

// Get version from command line args
const version = parseInt(process.argv[2]) || 1;
generateStateSnapshot(version);