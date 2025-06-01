#!/usr/bin/env node

/**
 * Setup Git Hooks
 *
 * Installs the pre-commit hook for state schema detection.
 */

const fs = require("fs");
const path = require("path");

const HOOKS_DIR = path.join(__dirname, "..", ".git", "hooks");
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, "pre-commit");
const PRE_COMMIT_SCRIPT = path.join(__dirname, "pre-commit-hook.sh");

function setupPreCommitHook() {
  try {
    if (!fs.existsSync(HOOKS_DIR)) {
      console.error(
        "❌ .git/hooks directory not found. Are you in a git repository?"
      );
      return false;
    }

    if (!fs.existsSync(PRE_COMMIT_SCRIPT)) {
      console.error(
        "❌ Pre-commit script not found at:", PRE_COMMIT_SCRIPT
      );
      return false;
    }

    // Check if pre-commit hook already exists
    if (fs.existsSync(PRE_COMMIT_HOOK)) {
      // Check if it's already our symlink
      try {
        const linkTarget = fs.readlinkSync(PRE_COMMIT_HOOK);
        if (linkTarget === PRE_COMMIT_SCRIPT || path.resolve(path.dirname(PRE_COMMIT_HOOK), linkTarget) === PRE_COMMIT_SCRIPT) {
          console.log("✅ Pre-commit hook symlink already exists");
          return true;
        }
      } catch (e) {
        // Not a symlink, it's a regular file
      }

      console.log("⚠️  Pre-commit hook already exists. Backing up...");
      fs.writeFileSync(PRE_COMMIT_HOOK + ".backup", fs.readFileSync(PRE_COMMIT_HOOK));
      fs.unlinkSync(PRE_COMMIT_HOOK);
    }

    // Create symlink to our hook script
    fs.symlinkSync(PRE_COMMIT_SCRIPT, PRE_COMMIT_HOOK);

    console.log("✅ Pre-commit hook symlink created successfully");
    console.log("   State schema changes will now be automatically detected on commit");
    console.log(`   Hook points to: ${PRE_COMMIT_SCRIPT}`);

    return true;
  } catch (error) {
    console.error("❌ Failed to setup pre-commit hook:", error.message);
    return false;
  }
}

function removePreCommitHook() {
  try {
    if (fs.existsSync(PRE_COMMIT_HOOK)) {
      // Check if it's our symlink
      try {
        const linkTarget = fs.readlinkSync(PRE_COMMIT_HOOK);
        if (linkTarget === PRE_COMMIT_SCRIPT || path.resolve(path.dirname(PRE_COMMIT_HOOK), linkTarget) === PRE_COMMIT_SCRIPT) {
          fs.unlinkSync(PRE_COMMIT_HOOK);
          console.log("✅ State schema pre-commit hook symlink removed");

          // Restore backup if it exists
          const backup = PRE_COMMIT_HOOK + ".backup";
          if (fs.existsSync(backup)) {
            fs.renameSync(backup, PRE_COMMIT_HOOK);
            console.log("✅ Original pre-commit hook restored from backup");
          }
        } else {
          console.log("ℹ️  Pre-commit hook exists but is not our symlink");
        }
      } catch (e) {
        // Not a symlink
        console.log("ℹ️  Pre-commit hook exists but is not our symlink");
      }
    } else {
      console.log("ℹ️  No pre-commit hook found to remove");
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to remove pre-commit hook:", error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "install") {
    setupPreCommitHook();
    return;
  }

  if (command === "remove") {
    removePreCommitHook();
    return;
  }

  console.log(`
Usage: node setup-git-hooks.js <command>

Commands:
  install    Install the state schema detection pre-commit hook
  remove     Remove the state schema detection pre-commit hook

Examples:
  node setup-git-hooks.js install
  node setup-git-hooks.js remove
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  setupPreCommitHook,
  removePreCommitHook,
};
