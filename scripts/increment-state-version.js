#!/usr/bin/env node

/**
 * Increment State Version
 * 
 * Automatically increments the STATE_VERSION in state-version.ts
 */

const fs = require('fs');
const path = require('path');

const STATE_VERSION_FILE = path.join(__dirname, '..', 'src', 'lib', 'mobx', 'state-version.ts');

function getCurrentVersion() {
  try {
    const content = fs.readFileSync(STATE_VERSION_FILE, 'utf8');
    const match = content.match(/export const STATE_VERSION = (\d+);/);
    if (match) {
      return parseInt(match[1], 10);
    }
    throw new Error('Could not parse current version');
  } catch (error) {
    console.error('Error reading current version:', error.message);
    return null;
  }
}

function setVersion(targetVersion) {
  const currentVersion = getCurrentVersion();
  if (currentVersion === null) {
    return false;
  }
  
  const newContent = `/**
 * State Schema Version
 * 
 * This file is automatically updated by the migration system.
 * Do not edit manually - use the git hooks or migration scripts.
 */

export const STATE_VERSION = ${targetVersion};`;

  try {
    fs.writeFileSync(STATE_VERSION_FILE, newContent);
    console.log(`✅ State version set: ${currentVersion} → ${targetVersion}`);
    return { oldVersion: currentVersion, newVersion: targetVersion };
  } catch (error) {
    console.error('❌ Failed to set version:', error.message);
    return false;
  }
}

function incrementVersion() {
  const currentVersion = getCurrentVersion();
  if (currentVersion === null) {
    return false;
  }
  
  const newVersion = currentVersion + 1;
  return setVersion(newVersion);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'get') {
    const version = getCurrentVersion();
    if (version !== null) {
      console.log(version);
    } else {
      process.exit(1);
    }
    return;
  }
  
  if (command === 'increment') {
    const result = incrementVersion();
    if (!result) {
      process.exit(1);
    }
    return;
  }
  
  console.log(`
Usage: node increment-state-version.js <command>

Commands:
  get        Get the current state version
  increment  Increment the state version by 1

Examples:
  node increment-state-version.js get
  node increment-state-version.js increment
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  getVersion: getCurrentVersion, // Alias for compatibility
  incrementVersion,
  setVersion
};