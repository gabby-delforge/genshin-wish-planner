#!/usr/bin/env node

/**
 * Changelog validation script
 * 
 * This script checks if developers have added changelog entries
 * before allowing commits that would trigger a release.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}


function hasReleaseCommits() {
  try {
    // Check if there are any commits since last tag that would trigger a release
    const commits = execSync('git log --oneline --grep="^feat" --grep="^fix" --grep="^perf" --grep="BREAKING CHANGE" --since="1 week ago"', { encoding: 'utf8' });
    return commits.trim().length > 0;
  } catch (error) {
    // If no previous tags or other issues, assume we might need changelog
    return true;
  }
}

function validateChangelogFile() {
  const changelogPath = path.join(__dirname, '../public/CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    return {
      valid: false,
      errors: ['CHANGELOG.md file not found']
    };
  }

  const content = fs.readFileSync(changelogPath, 'utf8');
  
  // Check if [Unreleased] section has actual entries
  const unreleasedSection = content.match(/## \[Unreleased\]([\s\S]*?)(?=## \[|$)/);
  
  if (!unreleasedSection) {
    return {
      valid: false,
      errors: ['No [Unreleased] section found in CHANGELOG.md']
    };
  }

  const sectionContent = unreleasedSection[1];
  
  // Check if there are actual entries (look for bullet points)
  const hasEntries = /^- .+/m.test(sectionContent);
  
  // Check if it only has placeholder text
  const hasPlaceholders = sectionContent.includes('Add your') || 
                         sectionContent.includes('here');
  
  if (!hasEntries || hasPlaceholders) {
    return {
      valid: false,
      errors: ['No changelog entries found in [Unreleased] section']
    };
  }

  return { valid: true, errors: [] };
}

function main() {
  const command = process.argv[2];
  
  if (command === '--help' || command === '-h') {
    console.log(`
Changelog Validation Script

Usage:
  node scripts/check-changelog.js [command]

Commands:
  check     Check if changelog entries are ready for release
  remind    Show reminder message for developers
  --help    Show this help message

This script ensures developers add user-friendly changelog entries
before commits that would trigger a semantic release.
    `);
    return;
  }

  if (command === 'remind') {
    log('blue', '\n📝 Changelog Reminder:');
    log('yellow', 'If your changes will be user-facing, please add entries to:');
    log('reset', '  public/CHANGELOG.md under [Unreleased] section\n');
    log('yellow', 'Write user-friendly descriptions, not technical commit messages!');
    console.log('\nExamples:');
    console.log('  ✅ "- Faster wish calculations - simulations now run 40% faster"');
    console.log('  ❌ "- optimize starglitter computation algorithm"\n');
    return;
  }

  // Default: validation check
  log('blue', '📋 Checking changelog entries...');

  const validation = validateChangelogFile();
  
  if (validation.valid) {
    log('green', '✅ Changelog entries found and look good!');
    process.exit(0);
  } else {
    log('red', '❌ Changelog validation failed:');
    validation.errors.forEach(error => {
      log('red', `   ${error}`);
    });
    
    log('yellow', '\n💡 To fix this:');
    log('reset', '   1. Open public/CHANGELOG.md');
    log('reset', '   2. Add entries under [Unreleased] section');
    log('reset', '   3. Use ### Added, ### Changed, ### Fixed sections');
    log('reset', '   4. Write user-friendly descriptions, not technical details\n');
    
    if (hasReleaseCommits()) {
      log('yellow', '⚠️  You have commits that will trigger a release.');
      log('yellow', '   Please add changelog entries before pushing to main.\n');
    }

    process.exit(1);
  }
}

main();