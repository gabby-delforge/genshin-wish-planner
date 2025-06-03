#!/usr/bin/env node

/**
 * Versioned Types Generator
 * 
 * Generates self-contained TypeScript type definitions for state versions.
 * Simply copies types.ts and creates a versioned snapshot.
 */

const fs = require('fs');
const path = require('path');

const TYPES_FILE = path.join(__dirname, '..', 'src', 'lib', 'types.ts');
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'src', 'lib', 'mobx', 'snapshots');
const BANNERS_JSON = path.join(__dirname, '..', 'public', 'metadata', 'banners.json');
const CHARACTERS_JSON = path.join(__dirname, '..', 'public', 'metadata', 'characters.json');
const WEAPONS_JSON = path.join(__dirname, '..', 'public', 'metadata', 'weapons.json');

function ensureSnapshotsDir() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

function resolveJsonDependencies() {
  // Read and parse JSON files
  const banners = JSON.parse(fs.readFileSync(BANNERS_JSON, 'utf8'));
  const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON, 'utf8'));
  const weapons = JSON.parse(fs.readFileSync(WEAPONS_JSON, 'utf8'));
  
  // Generate concrete types based on the JSON data
  const bannerType = generateTypeFromArray(banners, 'ApiBanner');
  const characterType = generateTypeFromArray(characters, 'ApiCharacter');
  const weaponType = generateTypeFromArray(weapons, 'ApiWeapon');
  
  // Generate union types for IDs
  const bannerIds = banners.map(b => `"${b.id}"`).join(' | ');
  const characterIds = characters.map(c => `"${c.Id}"`).join(' | ');
  const weaponIds = weapons.map(w => `"${w.Id}"`).join(' | ');
  
  return {
    types: `// API Data Types (resolved from JSON at generation time)
// ------------------------------------------------

${bannerType}

${characterType}

${weaponType}

export type BannerId = ${bannerIds};
export type CharacterId = ${characterIds};
export type WeaponId = ${weaponIds};
`,
    replacements: {
      // Remove the import statements
      'import Banners from "../../public/metadata/banners.json";\nimport Characters from "../../public/metadata/characters.json";\nimport Weapons from "../../public/metadata/weapons.json";\n': '',
      'import Banners from "../../public/metadata/banners.json";': '',
      'import Characters from "../../public/metadata/characters.json";': '',
      'import Weapons from "../../public/metadata/weapons.json";': '',
      
      // Replace the type definitions
      'export type ApiCharacter = (typeof Characters)[number];': '',
      'export type ApiWeapon = (typeof Weapons)[number];': '',
      'export type ApiBanner = (typeof Banners)[number];': '',
      'export type BannerId = string;': '',
      'export type CharacterId = (typeof Characters)[number]["Id"];': '',
      'export type WeaponId = (typeof Weapons)[number]["Id"];': '',
    }
  };
}

function generateTypeFromArray(jsonArray, typeName) {
  if (jsonArray.length === 0) {
    return `export type ${typeName} = Record<string, unknown>;`;
  }
  
  // Take the first item as representative of the structure
  const sample = jsonArray[0];
  const properties = Object.entries(sample).map(([key, value]) => {
    const type = inferTypeFromValue(value);
    return `  ${key}: ${type};`;
  }).join('\n');
  
  return `export type ${typeName} = {
${properties}
};`;
}

function inferTypeFromValue(value) {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const elementType = inferTypeFromValue(value[0]);
    return `${elementType}[]`;  // Removed the extra semicolon
  }
  if (typeof value === 'object') {
    const properties = Object.entries(value).map(([key, val]) => {
      const type = inferTypeFromValue(val);
      return `    ${key}: ${type}`;  // Removed semicolon here since it's added in generateTypeFromArray
    }).join(';\n');
    return `{\n${properties};\n  }`;
  }
  return 'unknown';
}

function generateStateInterface(version) {
  // Get the persisted keys from the current GenshinState class
  const stateFileContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'mobx', 'genshin-state.ts'), 'utf8');
  
  // Extract PERSISTED_KEYS array from the file
  const persistedKeysMatch = stateFileContent.match(/PERSISTED_KEYS:\s*\(keyof GenshinState\)\[\]\s*=\s*\[([\s\S]*?)\]/);
  
  let persistedKeys = [];
  if (persistedKeysMatch) {
    // Parse the array content
    const arrayContent = persistedKeysMatch[1];
    persistedKeys = arrayContent
      .split(',')
      .map(item => item.trim().replace(/['"]/g, ''))
      .filter(item => item && !item.startsWith('//'));
  }
  
  // Generate the state interface
  const properties = persistedKeys.map(key => {
    // Map known keys to their types
    const typeMap = {
      'characterPity': 'number',
      'weaponPity': 'number',
      'isNextCharacterFeaturedGuaranteed': 'boolean',
      'isNextWeaponFeaturedGuaranteed': 'boolean',
      'ownedWishResources': 'WishResources',
      'primogemSources': 'PrimogemSourcesEnabled',
      'shouldExcludeCurrentBannerEarnedWishes': 'boolean',
      'simulationCount': 'number',
      'isSimulating': 'boolean',
      'simulationProgress': 'number',
      'mode': 'AppMode',
      'optimizerSimulationResults': 'Record<string, BannerConfiguration>[] | null',
      'playgroundSimulationResults': 'SimulationResults | null',
      'bannerConfiguration': 'Record<BannerId, BannerConfiguration>',
      'isLoading': 'boolean',
      'isClient': 'boolean',
      'version': 'number'
    };
    
    const type = typeMap[key] || 'unknown';
    return `  ${key}: ${type};`;
  }).join('\n');
  
  return `
// Generated state interface for version ${version}
// Based on PERSISTED_KEYS from GenshinState class
export interface GenshinStateV${version} {
${properties.replace(/  version: number;/g, '')}
  version: ${version};
}
`;
}

function generateVersionSnapshot(version) {
  try {
    console.log(`📝 Generating versioned types for v${version}...`);
    
    // Read the types file
    let typesContent = fs.readFileSync(TYPES_FILE, 'utf8');
    
    // Resolve JSON dependencies
    const { types: resolvedTypes, replacements } = resolveJsonDependencies();
    
    // Apply replacements to remove JSON dependencies
    Object.entries(replacements).forEach(([search, replace]) => {
      typesContent = typesContent.replace(search, replace);
    });
    
    // Generate the state interface
    const stateInterface = generateStateInterface(version);
    
    // Create the versioned type file content
    const header = `/**
 * State shape for version ${version}
 * 
 * This represents all types at version ${version}.
 * Used for type-safe migrations.
 * 
 * This is a snapshot of types.ts at the time version ${version} was created.
 * All JSON dependencies have been resolved to concrete types.
 * Generated on: ${new Date().toISOString()}
 */

`;

    // Combine header, resolved types, modified content, and state interface
    const versionedContent = header + resolvedTypes + '\n' + typesContent + '\n' + stateInterface;
    
    // Write to versioned file
    const fileName = `v${version}-types.ts`;
    const filePath = path.join(SNAPSHOTS_DIR, fileName);
    
    ensureSnapshotsDir();
    fs.writeFileSync(filePath, versionedContent);
    
    console.log(`✅ Generated versioned types: ${fileName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to generate versioned types for v${version}:`, error.message);
    return false;
  }
}

function updateBarrelExport() {
  try {
    // Read existing snapshots to determine which versions exist
    const snapshotFiles = fs.readdirSync(SNAPSHOTS_DIR)
      .filter(file => file.match(/^v\d+-types\.ts$/))
      .sort();
    
    const versions = snapshotFiles.map(file => {
      const match = file.match(/^v(\d+)-types\.ts$/);
      return match ? parseInt(match[1]) : null;
    }).filter(v => v !== null);
    
    if (versions.length === 0) {
      console.warn('⚠️ No versioned types found to export');
      return false;
    }
    
    const imports = versions.map(v => `export * as V${v} from "./v${v}-types";`).join('\n');
    
    const barrelContent = `/**
 * Versioned State Types
 *
 * Barrel export for all versioned types.
 * Used for type-safe migrations.
 */

${imports}

// Re-export specific GenshinState types if they exist
${versions.map(v => `// export type GenshinStateV${v} = V${v}.GenshinState; // Add if GenshinState type exists in v${v}`).join('\n')}
`;

    const barrelPath = path.join(SNAPSHOTS_DIR, 'index.ts');
    fs.writeFileSync(barrelPath, barrelContent);
    
    console.log(`✅ Updated barrel export with ${versions.length} versions`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update barrel export:', error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'generate') {
    const version = parseInt(args[1]);
    
    if (!version) {
      console.error('Usage: node generate-versioned-types.js generate <version>');
      process.exit(1);
    }
    
    if (generateVersionSnapshot(version)) {
      updateBarrelExport();
    }
    return;
  }
  
  if (command === 'update-barrel') {
    updateBarrelExport();
    return;
  }
  
  console.log(`
Usage: node generate-versioned-types.js <command> [options]

Commands:
  generate <version>    Generate versioned types for specified version
  update-barrel         Update the barrel export with all existing versions

Examples:
  node generate-versioned-types.js generate 4
  node generate-versioned-types.js update-barrel
`);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateVersionSnapshot,
  updateBarrelExport
};