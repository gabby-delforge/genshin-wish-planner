#!/usr/bin/env node

/**
 * State Schema Detector
 *
 * Compares state schema snapshots to detect changes.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SNAPSHOTS_DIR = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "mobx",
  "snapshots"
);
const CURRENT_SNAPSHOT_PATH = path.join(
  SNAPSHOTS_DIR,
  "current-state-shape.json"
);

function ensureSnapshotsDir() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

function getCurrentStateShape() {
  try {
    // Build the project to ensure TypeScript is compiled
    console.log("Building project to extract current state shape...");
    execSync("npm run build", { stdio: "pipe" });

    // Use the separate extractor script
    const result = execSync("node scripts/extract-state-shape.js", {
      encoding: "utf8",
    });
    return JSON.parse(result);
  } catch (error) {
    console.error("Error extracting current state shape:", error.message);
    return null;
  }
}

function loadSnapshot(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Error loading snapshot from ${filePath}:`, error.message);
    return null;
  }
}

function saveSnapshot(snapshot, filePath) {
  try {
    ensureSnapshotsDir();
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving snapshot to ${filePath}:`, error.message);
    return false;
  }
}

function compareSnapshots(oldSnapshot, newSnapshot) {
  const changes = {
    added: [],
    removed: [],
    typeChanged: [],
    versionChanged: false,
  };

  if (!oldSnapshot) {
    // First time running, everything is "new"
    changes.added = newSnapshot.keys;
    return changes;
  }

  if (oldSnapshot.version !== newSnapshot.version) {
    changes.versionChanged = true;
  }

  const oldKeys = new Set(oldSnapshot.keys);
  const newKeys = new Set(newSnapshot.keys);

  // Find added keys
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      changes.added.push(key);
    }
  }

  // Find removed keys
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      changes.removed.push(key);
    }
  }

  // Find type changes
  for (const key of oldKeys) {
    if (newKeys.has(key)) {
      const oldType = oldSnapshot.schema[key];
      const newType = newSnapshot.schema[key];
      if (oldType !== newType) {
        changes.typeChanged.push({ key, oldType, newType });
      }
    }
  }

  return changes;
}

function formatChanges(changes) {
  const lines = [];

  if (changes.versionChanged) {
    lines.push("📋 State version changed");
  }

  if (changes.added.length > 0) {
    lines.push("✅ Added keys:");
    changes.added.forEach((key) => lines.push(`  + ${key}`));
  }

  if (changes.removed.length > 0) {
    lines.push("❌ Removed keys:");
    changes.removed.forEach((key) => lines.push(`  - ${key}`));
  }

  if (changes.typeChanged.length > 0) {
    lines.push("🔄 Type changes:");
    changes.typeChanged.forEach(({ key, oldType, newType }) =>
      lines.push(`  ~ ${key}: ${oldType} → ${newType}`)
    );
  }

  return lines.join("\n");
}

function hasBreakingChanges(changes) {
  return changes.removed.length > 0 || changes.typeChanged.length > 0;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "check") {
    console.log("🔍 Checking for state schema changes...");

    const oldSnapshot = loadSnapshot(CURRENT_SNAPSHOT_PATH);
    const newSnapshot = getCurrentStateShape();

    if (!newSnapshot) {
      console.error("❌ Failed to extract current state shape");
      process.exit(1);
    }

    const changes = compareSnapshots(oldSnapshot, newSnapshot);
    const hasChanges =
      changes.added.length > 0 ||
      changes.removed.length > 0 ||
      changes.typeChanged.length > 0;

    if (!hasChanges) {
      console.log("✅ No state schema changes detected");
      // Update the snapshot with current timestamp
      saveSnapshot(newSnapshot, CURRENT_SNAPSHOT_PATH);
      process.exit(0);
    }

    console.log("🔍 State schema changes detected:");
    console.log(formatChanges(changes));

    if (hasBreakingChanges(changes) && !changes.versionChanged) {
      console.log(
        "\n⚠️  Breaking changes detected but version not incremented!"
      );

      // Prompt for automatic version increment
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "Automatically increment state version? (y/n): ",
        (answer) => {
          rl.close();

          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            const {
              incrementVersion,
            } = require("./increment-state-version.js");
            const result = incrementVersion();

            if (result) {
              // Generate migration stub
              const {
                generateMigrationStub,
                updateMigrationsFile,
              } = require("./migration-generator.js");
              const migrationStub = generateMigrationStub(
                result.oldVersion,
                result.newVersion,
                changes
              );

              if (updateMigrationsFile(migrationStub)) {
                console.log(
                  "✅ Version incremented and migration stub generated"
                );
                console.log(
                  "⚠️  Don't forget to implement the actual migration logic!"
                );

                // Re-run the check to update snapshot
                const newSnapshot = getCurrentStateShape();
                if (
                  newSnapshot &&
                  saveSnapshot(newSnapshot, CURRENT_SNAPSHOT_PATH)
                ) {
                  console.log("📸 State snapshot updated");
                }
              }
            }
          } else {
            console.log(
              "Please increment STATE_VERSION manually and run again"
            );
            process.exit(1);
          }
        }
      );
      return;
    }

    // Save the new snapshot
    if (saveSnapshot(newSnapshot, CURRENT_SNAPSHOT_PATH)) {
      console.log("\n📸 State snapshot updated");
    }

    process.exit(0);
  }

  if (command === "update") {
    console.log("📸 Updating state schema snapshot...");
    const snapshot = getCurrentStateShape();
    if (snapshot && saveSnapshot(snapshot, CURRENT_SNAPSHOT_PATH)) {
      console.log("✅ Snapshot updated successfully");
    } else {
      console.error("❌ Failed to update snapshot");
      process.exit(1);
    }
    return;
  }

  console.log(`
Usage: node state-schema-detector.js <command>

Commands:
  check    Check for state schema changes and update snapshot
  update   Force update the current state snapshot

Examples:
  node state-schema-detector.js check
  node state-schema-detector.js update
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  getCurrentStateShape,
  compareSnapshots,
  formatChanges,
  hasBreakingChanges,
};
