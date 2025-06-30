# Semantic Release Setup

This project uses semantic-release for automated versioning with manual user-friendly changelog entries.

## How It Works

1. **Commit Messages**: Follow conventional commit format  
2. **Manual Changelog**: Write user-friendly entries in `upcoming-changelog.ts`
3. **Auto Versioning**: semantic-release analyzes commits to determine version bumps
4. **Auto Release**: Creates GitHub releases when pushed to main branch
5. **User Notifications**: In-app changelog modal shows your manual entries

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature (→ minor version bump)
- `fix`: A bug fix (→ patch version bump)
- `perf`: Performance improvement (→ patch version bump)
- `refactor`: Code refactoring (→ patch version bump)
- `docs`: Documentation changes (→ no version bump)
- `style`: Code style changes (→ no version bump)
- `test`: Test changes (→ no version bump)
- `build`: Build system changes (→ no version bump)
- `ci`: CI configuration changes (→ no version bump)
- `chore`: Other changes (→ no version bump)

### Breaking Changes

- `feat!`: Breaking change (→ major version bump)
- `BREAKING CHANGE:` in footer (→ major version bump)

### Examples

```bash
# Feature (0.1.0 → 0.2.0)
feat(simulation): add starglitter calculation improvements

# Bug fix (0.1.0 → 0.1.1)  
fix(ui): resolve modal backdrop scroll issue

# Breaking change (0.1.0 → 1.0.0)
feat!: redesign banner configuration API

# Or with footer
feat(api): redesign banner configuration

BREAKING CHANGE: The banner configuration API has been completely redesigned.
Old configurations will need to be migrated.
```

## Workflow

### Development
1. Make changes
2. **Add user-facing entries** to `src/lib/changelog/upcoming-changelog.ts`
3. Commit with conventional format
4. Push to feature branch
5. Create PR to main

### Release (Automatic)
1. PR merged to main
2. GitHub Actions runs
3. **Validates changelog entries exist**
4. semantic-release analyzes commits
5. Version bumped automatically
6. GitHub release created
7. **Users see your manual changelog entries** in modal

## Writing Changelog Entries

### Location
Add entries to: `src/lib/changelog/upcoming-changelog.ts`

### Guidelines
- **Write for users**, not developers
- **Focus on benefits** and impact
- **Use clear, simple language**
- **Avoid technical jargon**

### Examples

```typescript
// ✅ Good - User-focused
{
  type: "feature",
  description: "New weapon banner optimization - get better wish recommendations for weapon banners"
},
{
  type: "improvement", 
  description: "Faster wish calculations - simulations now run 40% faster"
},
{
  type: "fix",
  description: "Fixed scrolling issue in settings modal on mobile devices"
}

// ❌ Bad - Developer-focused
{
  type: "feature",
  description: "refactor starglitter computation algorithm"
},
{
  type: "fix", 
  description: "fix modal backdrop z-index CSS issue"
}
```

## Scripts

- `npm run release` - Run semantic release (for CI)
- `npm run release:dry-run` - Test release without publishing
- `git config commit.template .gitmessage` - Set up commit template

## Setup Commit Template

To use the provided commit message template:

```bash
git config commit.template .gitmessage
```

This will help you follow the conventional commit format.

## Changelog System

The app automatically shows users a changelog modal when they visit after a new version is released. The changelog uses:

1. **Manual user-friendly entries** from `upcoming-changelog.ts`
2. **Historical entries** maintained in `changelog-data.ts`

Developers write the messages, automation handles the delivery!

## Branch Configuration

- **main**: Production releases
- **beta**: Beta prereleases (optional)
- **alpha**: Alpha prereleases (optional)

Only pushes to main trigger production releases.