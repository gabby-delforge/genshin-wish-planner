# Launch Readiness Tasks

## 🚨 CRITICAL LAUNCH BLOCKERS

**Must fix before any deployment**

- [ ] **Create media query hooks system**
  - `src/lib/hooks/use-media-query.ts` - Custom hook for responsive breakpoints
  - `src/lib/hooks/use-mobile.ts` - Mobile-specific hook for component branching
  - Enables proper responsive component rendering instead of CSS-only solutions
  - Critical for proper mobile UX and performance

- [ ] **Fix hydration errors:**

  - `src/components/resource.tsx:40-18` - `{number && <div>{number}</div>}` rendered on client/server and not the other
  - `src/app/panels/configuration/wish-resources.tsx:64` - Number of total wishes is different on client and server

- [ ] **Add comprehensive state validation**

  - `src/lib/mobx/make-local-storage.ts` - Validate pity (0-89), constellation (0-6), resources (non-negative)

- [ ] **Fix error boundary coverage**
  - `src/app/error-boundary.tsx`, `src/components/safe-error-wrapper.tsx`
  - ErrorBoundary doesn't catch state initialization failures

## 🔥 HIGH PRIORITY

### Mobile Responsiveness (Launch Critical) → [Details](./mobile-responsiveness.md)

- [x] **Remove input spinners for touch devices**
  - `src/components/ui/input.tsx` - Added `inputMode="numeric"` and CSS to hide spinners
- [x] **Increase button touch targets to 44x44px minimum**
  - `src/components/ui/button.tsx` - Updated all size variants to meet 44px minimum
- [x] **Fix plus/minus buttons (currently 12px)**
  - `src/components/ui/input.tsx` - Increased icon size and added proper touch targets
- [x] **Increase checkbox touch targets**
  - `src/components/ui/checkbox.tsx` - Added 44x44px minimum touch area
- [x] **Add touch targets to IconButton component**
  - `src/components/ui/icon-button.tsx` - Added 44x44px minimum touch targets

### Core Features

- [ ] [FEATURE] **Implement weapon wishing**

### State Management

- [ ] **Add localStorage cleanup test**
  - Verify old keys are removed after migration to prevent quota issues

- [ ] **Implement state backup/restore functionality**

- [ ] [FEATURE] **Implement "strategies"** so that users can tell the simulator what to do with leftover wishes if characters are obtained early - see ./wish-strategies.md

- [ ] [FEATURE] **Implement Capturing Radiance**

## 🔧 MEDIUM PRIORITY

### System Improvements

- [ ] **Fix banner data validation**
  - `src/lib/mobx/genshin-state.ts:97,104`
- [ ] **Enable MobX error boundaries**
  - `src/lib/mobx/configure.ts:8`
- [ ] **Replace silent error handling with user notifications**
  - `src/lib/mobx/make-local-storage.ts:50-54`

### Mobile Polish

- [x] **Increase input container heights to 44px**
  - `src/components/ui/input.tsx` - Updated from h-7 to h-11 (44px)
- [ ] **Implement mobile-first typography**
  - `src/components/ui/input.tsx:138`
- [ ] **Increase grid gaps for touch interactions**
  - `src/app/panels/configuration/configuration-panel.tsx:21`
- [ ] **Add granular mobile breakpoints**
  - `tailwind.config.js`

## 🎯 LOW PRIORITY

### Features

- [ ] **Implement strategy mode**

### Advanced Features

- [ ] **Automated git hook migration system** → [Details](./state-migration-system.md)
- [ ] **Fix scenarios grid narrow columns**
  - `src/components/simulation-results/scenarios-grid.tsx:23-25,35-37`

---

## ✅ COMPLETED

### Mobile Responsiveness

- [x] **Implement mobile-responsive banner card layouts**
  - `src/components/banner/character-row.tsx` - 2x2 grid layout on mobile (character name spans 2 cols, constellation and wishes each span 1 col)
  - `src/components/banner/weapon-banner-row.tsx` - 2x2 grid layout on mobile (weapon selector spans 2 cols, refinement and wishes each span 1 col)

### State Management & Infrastructure

- [x] **CRITICAL: Change CLEAR_DATA from true to false** (Fixed data loss issue)
  - `src/lib/mobx/make-local-storage.ts:3`
- [x] **Add state schema versioning system** → [Details](./state-migration-system.md)
  - `src/lib/mobx/state-version.ts` - Automated STATE_VERSION management
  - `src/lib/mobx/migrations.ts` - Complete migration infrastructure with tests
  - `src/lib/mobx/make-local-storage.ts` - Generic callback support + localStorage cleanup
- [x] **Add data migration system** → [Details](./state-migration-system.md)
  - `scripts/state-schema-detector.js` - Fast schema detection with rename detection
  - `scripts/migration-generator.js` - Auto-generates migration stubs
  - `scripts/setup-git-hooks.js` - Git pre-commit hook with symlinks
  - `package.json` - Added npm scripts: `state:check`, `state:version`, `state:hooks:install`
- [x] **Add proper fallback states for corrupted data**
  - Enhanced `make-local-storage.ts` with error handling and localStorage cleanup
- [x] **Setup automated migration tests**
  - `src/lib/mobx/__tests__/migrations.test.ts` - Comprehensive test suite using real snapshots
  - `src/lib/mobx/snapshots/v1.json`, `v2.json` - Real state data snapshots for testing
