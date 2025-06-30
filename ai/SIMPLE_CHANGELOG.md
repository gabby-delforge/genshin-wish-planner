# Simple Changelog Workflow

## Developer Workflow

### 1. Add Changes to CHANGELOG.md
When you make changes, add user-friendly entries to `public/CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- Dark mode toggle in settings - switch between light and dark themes
- Better mobile scrolling in wish planner

### Fixed  
- Fixed calculator freezing on large wish simulations
```

### 2. Release a Version
When ready to release:

```bash
# For bug fixes
npm run version:patch

# For new features  
npm run version:minor

# For breaking changes
npm run version:major
```

This will:
- Bump version in package.json
- Create git tag
- Push to GitHub

### 3. Update CHANGELOG.md for Release
After running version bump, manually move [Unreleased] entries to the new version:

```markdown
## [Unreleased]

## [1.1.0] - 2025-06-30

### Added
- Dark mode toggle in settings - switch between light and dark themes
- Better mobile scrolling in wish planner

### Fixed  
- Fixed calculator freezing on large wish simulations
```

### 4. Users See Changes
Users automatically see the changelog modal when they visit after the version update.

## Benefits

- **Simple**: Just edit one file and run one command
- **Manual control**: You write exactly what users see
- **No automation complexity**: No semantic-release, no commit conventions
- **Git hook reminders**: Pre-commit hook reminds you to update changelog

## Commands

- `npm run changelog:check` - Check if unreleased entries exist
- `npm run version:patch` - Release bug fix (1.0.0 → 1.0.1)
- `npm run version:minor` - Release feature (1.0.0 → 1.1.0)  
- `npm run version:major` - Release breaking change (1.0.0 → 2.0.0)