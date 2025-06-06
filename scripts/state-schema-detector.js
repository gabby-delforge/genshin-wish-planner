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
    // Use tsx to run TypeScript directly without building
    console.log("Extracting current state shape...");
    const result = execSync("npx tsx scripts/extract-state-shape.ts", {
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
    possibleRenames: [],
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
  const addedKeys = [];
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      addedKeys.push(key);
    }
  }

  // Find removed keys
  const removedKeys = [];
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      removedKeys.push(key);
    }
  }

  // Detect possible renames (removed + added with same type)
  const possibleRenames = [];
  for (const removedKey of removedKeys) {
    const removedType = oldSnapshot.schema[removedKey];
    for (const addedKey of addedKeys) {
      const addedType = newSnapshot.schema[addedKey];
      if (removedType === addedType) {
        possibleRenames.push({
          from: removedKey,
          to: addedKey,
          type: removedType,
        });
      }
    }
  }

  // Remove possible renames from added/removed lists
  const confirmedRenames = possibleRenames.filter((rename) => {
    // Simple heuristic: if names are similar, it's likely a rename
    const similarity = calculateSimilarity(rename.from, rename.to);
    return similarity > 0.6; // 60% similarity threshold
  });

  changes.possibleRenames = confirmedRenames;

  // Remove confirmed renames from added/removed
  const renamedFromKeys = new Set(confirmedRenames.map((r) => r.from));
  const renamedToKeys = new Set(confirmedRenames.map((r) => r.to));

  changes.added = addedKeys.filter((key) => !renamedToKeys.has(key));
  changes.removed = removedKeys.filter((key) => !renamedFromKeys.has(key));

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

// Simple string similarity calculation (Levenshtein-based)
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function formatChanges(changes) {
  const lines = [];

  if (changes.versionChanged) {
    lines.push("📋 State version changed");
  }

  if (changes.possibleRenames.length > 0) {
    lines.push("🔄 Possible renames detected:");
    changes.possibleRenames.forEach(({ from, to, type }) =>
      lines.push(`  ↻ ${from} → ${to} (${type})`)
    );
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
    lines.push("🔧 Type changes:");
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
  const forceSnapshot = args.includes('--force-snapshot');

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
      changes.typeChanged.length > 0 ||
      changes.possibleRenames.length > 0;

    if (!hasChanges && !forceSnapshot) {
      console.log("✅ No state schema changes detected");
      // Update the snapshot
      saveSnapshot(newSnapshot, CURRENT_SNAPSHOT_PATH);
      process.exit(0);
    }

    if (!hasChanges && forceSnapshot) {
      console.log("🔧 Force snapshot mode: generating snapshot without schema changes");
      
      // Check if we're running in an interactive terminal
      const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

      if (!isInteractive) {
        console.log("⚠️  Use --force-snapshot in interactive mode to create snapshot without schema changes");
        process.exit(1);
      }

      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Generate new version snapshot for data changes (banner updates, etc.)? (Y/n): ", (answer) => {
        const shouldGenerate = answer.toLowerCase() === "y" || answer.toLowerCase() === "yes" || answer.trim() === "";

        if (shouldGenerate) {
          // Get current version to suggest next version
          const { getVersion } = require("./increment-state-version.js");
          const currentVersion = getVersion();
          const suggestedVersion = currentVersion + 1;

          rl.question(`Enter version number (default: ${suggestedVersion}): `, (versionAnswer) => {
            rl.close();

            const targetVersion = versionAnswer.trim() === "" ? suggestedVersion : parseInt(versionAnswer);

            if (isNaN(targetVersion) || targetVersion <= 0) {
              console.error("❌ Invalid version number");
              return;
            }

            // Check if snapshot already exists for this version
            const snapshotPath = path.join(SNAPSHOTS_DIR, `v${targetVersion}.json`);
            if (fs.existsSync(snapshotPath)) {
              console.error(`❌ Snapshot v${targetVersion}.json already exists`);
              return;
            }

            // Allow creating snapshot for current version if it doesn't exist, otherwise must be greater
            if (targetVersion < currentVersion) {
              console.error(`❌ Version ${targetVersion} is less than current version ${currentVersion}`);
              return;
            }

            // Update version file if target version is different from current
            let result = { oldVersion: currentVersion, newVersion: targetVersion };
            if (targetVersion !== currentVersion) {
              const { setVersion } = require("./increment-state-version.js");
              result = setVersion(targetVersion);
              if (!result) return;
              console.log(`✅ Version set to ${targetVersion} for data changes`);
            } else {
              console.log(`✅ Creating snapshot for current version ${targetVersion}`);
            }

            if (result) {

              // Generate a data snapshot for the new version
              const { generateVersionSnapshot } = require("./migration-generator.js");
              const { execSync } = require("child_process");
              
              try {
                // Generate actual state data snapshot for the new version
                const snapshotData = execSync(`npx tsx scripts/generate-state-snapshot.ts ${targetVersion}`, {
                  encoding: "utf8",
                });
                const parsedSnapshot = JSON.parse(snapshotData);
                
                if (generateVersionSnapshot(targetVersion, parsedSnapshot)) {
                  console.log(`📸 Generated v${targetVersion}.json snapshot`);
                }

                // Update current state shape
                if (saveSnapshot(newSnapshot, CURRENT_SNAPSHOT_PATH)) {
                  console.log("📸 Updated current state shape");
                }
              } catch (error) {
                console.error("❌ Failed to generate state snapshot:", error.message);
              }
            }
          });
        } else {
          rl.close();
          console.log("📸 Skipping snapshot generation");
        }
      });
      return;
    }

    console.log("🔍 State schema changes detected:");
    console.log(formatChanges(changes));

    // Always ask the programmer if they need a migration (unless version already changed)
    if (!changes.versionChanged) {
      // Check if we're running in an interactive terminal
      const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

      if (!isInteractive) {
        // Non-interactive environment (like git hooks)
        console.log(
          "\n⚠️  State schema changed; please review these changes and decide if migration is needed:"
        );
        console.log("   npm run state:check");
        process.exit(1);
      }

      console.log("\n🤔 Do you need a state migration for these changes?");
      console.log(
        "   (Consider: Do new fields need data from existing fields?"
      );
      console.log("              Will removed fields cause data loss?)");

      // Prompt for migration decision
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("Create migration? (y/N): ", (answer) => {
        rl.close();

        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          const { incrementVersion } = require("./increment-state-version.js");
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
          console.log("📸 Updating snapshot without migration...");
          // Just update the snapshot since no migration is needed
          if (saveSnapshot(newSnapshot, CURRENT_SNAPSHOT_PATH)) {
            console.log("✅ State snapshot updated");
          }
        }
      });
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
Usage: node state-schema-detector.js <command> [options]

Commands:
  check    Check for state schema changes and update snapshot
  update   Force update the current state snapshot

Options:
  --force-snapshot   Generate new version snapshot even without schema changes
                     (useful for banner data updates, etc.)

Examples:
  node state-schema-detector.js check
  node state-schema-detector.js check --force-snapshot
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
