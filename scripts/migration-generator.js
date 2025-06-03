#!/usr/bin/env node

/**
 * Migration Generator
 * 
 * Generates migration stubs when state version changes are detected.
 */

const fs = require('fs');
const path = require('path');

const SNAPSHOTS_DIR = path.join(__dirname, '..', 'src', 'lib', 'mobx', 'snapshots');
const MIGRATIONS_FILE = path.join(__dirname, '..', 'src', 'lib', 'mobx', 'migrations.ts');

function ensureSnapshotsDir() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

function generateVersionSnapshot(version, snapshot) {
  const fileName = `v${version}.json`;
  const filePath = path.join(SNAPSHOTS_DIR, fileName);
  
  try {
    // Ensure snapshots directory exists
    if (!fs.existsSync(SNAPSHOTS_DIR)) {
      fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
    console.log(`✅ Generated snapshot: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate snapshot ${fileName}:`, error.message);
    return false;
  }
}

function generateMigrationStub(fromVersion, toVersion, changes) {
  const migrationTemplate = `
  // Migration from v${fromVersion} to v${toVersion}
  // Generated on: ${new Date().toISOString()}
  ${fromVersion}: (state) => {
    const typedState = state as StateTypes.V${fromVersion}.GenshinStateV${fromVersion};
    // TODO: Implement migration from v${fromVersion} to v${toVersion}
    // Changes detected:
${changes.added.map(key => `    // + ${key}: (new field)`).join('\n')}
${changes.removed.map(key => `    // - ${key}: (removed field)`).join('\n')}
${changes.typeChanged.map(({key, oldType, newType}) => `    // ~ ${key}: ${oldType} → ${newType}`).join('\n')}
${changes.possibleRenames.map(({from, to, type}) => `    // ↻ ${from} → ${to}: (possible rename)`).join('\n')}
    
    return {
      ...typedState,
      version: ${toVersion},
      // Add your migration logic here
    } as StateTypes.V${toVersion}.GenshinStateV${toVersion};
  },`;

  return migrationTemplate;
}

function updateMigrationsFile(migrationStub) {
  try {
    let migrationsContent;
    
    if (!fs.existsSync(MIGRATIONS_FILE)) {
      // Create new migrations file
      migrationsContent = `/**
 * State Migrations
 * 
 * Handles migration between different state schema versions.
 */

import * as StateTypes from "./snapshots";

export const migrations: Record<number, (state: any) => any> = {${migrationStub}
};

export function migrateState(state: any, targetVersion: number): any {
  let currentState = state;
  let currentVersion = state.version || 1;
  
  while (currentVersion < targetVersion) {
    const migration = migrations[currentVersion];
    if (!migration) {
      throw new Error(\`No migration found for version \${currentVersion}\`);
    }
    currentState = migration(currentState);
    currentVersion++;
  }
  
  return currentState;
}
`;
    } else {
      // Update existing migrations file
      migrationsContent = fs.readFileSync(MIGRATIONS_FILE, 'utf8');
      
      // Ensure import statement exists
      if (!migrationsContent.includes('import * as StateTypes from "./snapshots";')) {
        // Add import after the comment header
        const importStatement = 'import * as StateTypes from "./snapshots";\n';
        const commentEndIndex = migrationsContent.indexOf('*/');
        if (commentEndIndex !== -1) {
          const insertIndex = commentEndIndex + 2;
          migrationsContent = migrationsContent.slice(0, insertIndex) + '\n\n' + importStatement + migrationsContent.slice(insertIndex);
        } else {
          // Fallback: add at the top
          migrationsContent = importStatement + '\n' + migrationsContent;
        }
      }
      
      // Find the migrations object and add the new migration
      // Updated regex to handle multiline type definitions with more flexible matching
      const migrationsMatch = migrationsContent.match(/export const migrations:\s*Record<[\s\S]*?>\s*=\s*{([\s\S]*?)^};/m);
      if (migrationsMatch) {
        const existingMigrations = migrationsMatch[1];
        // Clean up any existing malformed migrations
        const cleanMigrations = existingMigrations.replace(/,\s*}\),?$/, '');
        const newMigrations = cleanMigrations.trim() ? cleanMigrations + migrationStub : migrationStub;
        migrationsContent = migrationsContent.replace(
          /export const migrations:\s*Record<[\s\S]*?>\s*=\s*{[\s\S]*?^};/m,
          `export const migrations: Record<
  number,
  (state: Record<string, unknown>) => Record<string, unknown>
> = {${newMigrations}
};`
        );
      } else {
        console.error('❌ Could not find migrations object in existing file');
        console.error('Looking for pattern: export const migrations: Record<...> = { ... };');
        // Debug: show what the file actually contains around the migrations
        const lines = migrationsContent.split('\n');
        const migrationsLineIndex = lines.findIndex(line => line.includes('export const migrations'));
        if (migrationsLineIndex >= 0) {
          console.error('Found migration line at:', migrationsLineIndex + 1);
          console.error('Context:', lines.slice(Math.max(0, migrationsLineIndex - 2), migrationsLineIndex + 8).join('\n'));
        }
        return false;
      }
    }
    
    fs.writeFileSync(MIGRATIONS_FILE, migrationsContent);
    console.log('✅ Updated migrations.ts');
    return true;
  } catch (error) {
    console.error('❌ Failed to update migrations file:', error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'generate') {
    const fromVersion = parseInt(args[1]);
    const toVersion = parseInt(args[2]);
    const changesJson = args[3];
    
    if (!fromVersion || !toVersion || !changesJson) {
      console.error('Usage: node migration-generator.js generate <fromVersion> <toVersion> <changesJson>');
      process.exit(1);
    }
    
    try {
      const changes = JSON.parse(changesJson);
      
      ensureSnapshotsDir();
      
      // Generate migration stub
      const migrationStub = generateMigrationStub(fromVersion, toVersion, changes);
      
      if (updateMigrationsFile(migrationStub)) {
        console.log(`✅ Generated migration stub from v${fromVersion} to v${toVersion}`);
        console.log('⚠️  Don\'t forget to implement the actual migration logic!');
      }
      
    } catch (error) {
      console.error('❌ Failed to generate migration:', error.message);
      process.exit(1);
    }
    
    return;
  }
  
  console.log(`
Usage: node migration-generator.js <command> [options]

Commands:
  generate <fromVersion> <toVersion> <changesJson>  Generate migration stub

Examples:
  node migration-generator.js generate 1 2 '{"added":["newField"],"removed":[],"typeChanged":[]}'
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateVersionSnapshot,
  generateMigrationStub,
  updateMigrationsFile
};