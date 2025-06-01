# State Migration System Design

## Overview
Zero-manual-intervention system that automatically handles state schema versioning through git hooks and automated code generation.

## Components

### 1. State Schema Detector (`scripts/state-schema-detector.js`)
- Compares state shapes between git commits
- Generates semantic diff of changes
- Detects breaking vs non-breaking changes

### 2. Git Pre-commit Hook (`.git/hooks/pre-commit`)
- Runs schema detector on commit
- Shows diff to developer
- Prompts for version increment
- Blocks commit if changes detected but no version bump

### 3. Migration Generator (`scripts/auto-generate-migration.js`)
- Creates state snapshot files (`src/lib/mobx/snapshots/vN.ts`)
- Generates migration stub functions
- Updates version constants
- Includes change documentation in comments

## Automated Workflow

```bash
# Developer commits state changes
git commit -m "Add weapon pity tracking"

# Git hook automatically:
# 1. Detects: accountStatus shape changed
# 2. Shows diff:
#    + accountStatus.weaponPity: number
#    - accountStatusCurrentPity → accountStatus.characterPity
# 3. Prompts: "Increment version 5 → 6? (y/n)"
# 4. If yes, generates:
#    - snapshots/v6.ts (complete state shape)
#    - migrations.ts (stub with TODO)
#    - Updates CURRENT_STATE_VERSION = 6
# 5. Adds files to commit and proceeds
```

## Generated Migration Stub

```typescript
// Auto-generated migration stub for version 6
6: (state) => {
  // TODO: Implement migration from v5 to v6
  // Changes detected:
  // + accountStatus.weaponPity: number
  // - accountStatusCurrentPity → accountStatus.characterPity
  
  return {
    ...state,
    version: 6,
    accountStatus: {
      ...state.accountStatus,
      characterPity: state.accountStatusCurrentPity || 0,
      weaponPity: 0, // New field with default
    },
    // Remove old field
    accountStatusCurrentPity: undefined,
  };
}
```

## Testing Strategy

### Migration Path Testing
- Test every supported version → current version
- Test migration chains (v1→v2→v3)
- Verify data integrity across migrations
- CI fails if migration missing for new version

### Test Data Management
- Auto-generated snapshots for each version
- Real user data samples for edge cases
- Corruption scenarios and recovery testing

## Benefits

- **Zero forgotten migrations** - Git hook prevents commits without version bump
- **Perfect snapshots** - Generated from actual current state
- **Clear documentation** - Diff shows exactly what changed
- **Bulletproof testing** - Automated verification of migration paths
- **Maintainable at scale** - Works even with 100+ versions