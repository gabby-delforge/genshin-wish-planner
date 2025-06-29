# Simple Changelog Workflow

## How It Works

1. **Developer**: Edit `CHANGELOG.md` under `[Unreleased]` section
2. **Commit**: Use conventional commits (`feat:`, `fix:`, etc.)
3. **Merge to main**: Semantic-release automatically bumps version
4. **Users**: See changelog modal with your entries on next visit

## Developer Workflow

### 1. Add Changelog Entries

Edit `public/CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- New weapon banner optimization - get better wish recommendations
- Dark mode toggle in settings

### Changed  
- Faster wish calculations - simulations now run 40% faster

### Fixed
- Fixed scrolling issue in settings modal on mobile devices
```

### 2. Commit Changes

```bash
feat(ui): add dark mode toggle
```

### 3. Merge to Main

- Semantic-release detects `feat:` commit
- Bumps version (`0.1.0` → `0.2.0`)
- Moves `[Unreleased]` → `[0.2.0] - 2024-07-15`
- Creates GitHub release
- Users see changelog modal with your entries

## Writing Good Changelog Entries

### ✅ Good Examples
- "New weapon banner optimization - get better wish recommendations"
- "Faster wish calculations - simulations now run 40% faster"  
- "Fixed scrolling issue in settings modal on mobile devices"

### ❌ Avoid
- "refactor starglitter computation algorithm"
- "fix modal backdrop z-index CSS issue"
- "optimize performance in wish simulator"

## Validation

The system includes guardrails:

- **Pre-commit hook**: Reminds you to update CHANGELOG.md
- **CI validation**: Blocks release if no entries in `[Unreleased]`
- **Manual check**: `npm run changelog:check`

## Commands

- `npm run changelog:check` - Validate changelog entries exist
- `npm run changelog:remind` - Show reminder message

## Benefits

- **Simple**: Just edit one file (public/CHANGELOG.md)
- **Standard**: Uses industry-standard Keep a Changelog format
- **Automated**: Version bumping and user notifications are automatic
- **User-friendly**: You control exactly what users see