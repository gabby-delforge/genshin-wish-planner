#!/usr/bin/env node

/**
 * Setup Git Hooks
 * 
 * Installs the pre-commit hook for state schema detection.
 */

const fs = require('fs');
const path = require('path');

const HOOKS_DIR = path.join(__dirname, '..', '.git', 'hooks');
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, 'pre-commit');

const preCommitScript = `#!/bin/sh

# State schema detection pre-commit hook
echo "🔍 Checking for state schema changes..."

# Run the state schema detector
node scripts/state-schema-detector.js check

# If the script exits with non-zero code, block the commit
if [ $? -ne 0 ]; then
  echo "❌ Commit blocked due to state schema issues"
  echo "   Please review the changes and increment STATE_VERSION if needed"
  echo "   Run: node scripts/increment-state-version.js increment"
  echo "   Then: node scripts/migration-generator.js generate <oldVersion> <newVersion> '<changesJson>'"
  exit 1
fi

echo "✅ State schema check passed"
`;

function setupPreCommitHook() {
  try {
    if (!fs.existsSync(HOOKS_DIR)) {
      console.error('❌ .git/hooks directory not found. Are you in a git repository?');
      return false;
    }

    // Check if pre-commit hook already exists
    if (fs.existsSync(PRE_COMMIT_HOOK)) {
      const existing = fs.readFileSync(PRE_COMMIT_HOOK, 'utf8');
      if (existing.includes('state-schema-detector.js')) {
        console.log('✅ Pre-commit hook already contains state schema detection');
        return true;
      }
      
      console.log('⚠️  Pre-commit hook already exists. Backing up...');
      fs.writeFileSync(PRE_COMMIT_HOOK + '.backup', existing);
    }

    // Write the new pre-commit hook
    fs.writeFileSync(PRE_COMMIT_HOOK, preCommitScript);
    
    // Make it executable
    fs.chmodSync(PRE_COMMIT_HOOK, '755');
    
    console.log('✅ Pre-commit hook installed successfully');
    console.log('   State schema changes will now be automatically detected on commit');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to setup pre-commit hook:', error.message);
    return false;
  }
}

function removePreCommitHook() {
  try {
    if (fs.existsSync(PRE_COMMIT_HOOK)) {
      const existing = fs.readFileSync(PRE_COMMIT_HOOK, 'utf8');
      if (existing.includes('state-schema-detector.js')) {
        fs.unlinkSync(PRE_COMMIT_HOOK);
        console.log('✅ State schema pre-commit hook removed');
        
        // Restore backup if it exists
        const backup = PRE_COMMIT_HOOK + '.backup';
        if (fs.existsSync(backup)) {
          fs.renameSync(backup, PRE_COMMIT_HOOK);
          console.log('✅ Original pre-commit hook restored from backup');
        }
      } else {
        console.log('ℹ️  Pre-commit hook exists but doesn\'t contain state schema detection');
      }
    } else {
      console.log('ℹ️  No pre-commit hook found to remove');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to remove pre-commit hook:', error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'install') {
    setupPreCommitHook();
    return;
  }
  
  if (command === 'remove') {
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
  removePreCommitHook
};