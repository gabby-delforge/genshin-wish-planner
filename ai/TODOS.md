# Launch Readiness Tasks

## 🚨 CRITICAL LAUNCH BLOCKERS

**Must fix before any deployment**


- [ ] **Add comprehensive state validation**

  - `src/lib/mobx/make-local-storage.ts:24-29`
  - Validate pity (0-89), constellation (0-6), resources (non-negative)

- [ ] **Fix error boundary coverage**
  - `src/app/error-boundary.tsx`, `src/components/safe-error-wrapper.tsx`
  - ErrorBoundary doesn't catch state initialization failures

## 🔥 HIGH PRIORITY

### State Management

- [ ] **Implement state backup/restore functionality**
- [ ] **Setup automated migration tests**

### Mobile Responsiveness → [Details](./mobile-responsiveness.md)

- [ ] **Remove input spinners for touch devices**
  - `src/components/ui/input.tsx:163-184` - Use native `inputMode="numeric"`
- [ ] **Increase button touch targets to 44x44px minimum**
  - `src/components/ui/button.tsx:24-27`
- [ ] **Fix plus/minus buttons (currently 12px)**
  - `src/components/ui/input.tsx:165,175`
- [ ] **Increase checkbox touch targets**
  - `src/components/ui/checkbox.tsx:16`
- [ ] **Add touch targets to IconButton component**
  - `src/components/ui/icon-button.tsx:27-28`

## 🔧 MEDIUM PRIORITY

### System Improvements

- [ ] **Fix banner data validation**
  - `src/lib/mobx/genshin-state.ts:97,104`
- [ ] **Enable MobX error boundaries**
  - `src/lib/mobx/configure.ts:8`
- [ ] **Replace silent error handling with user notifications**
  - `src/lib/mobx/make-local-storage.ts:50-54`

### Mobile Polish

- [ ] **Increase input container heights to 44px**
  - `src/components/ui/input.tsx:126`
- [ ] **Implement mobile-first typography**
  - `src/components/ui/input.tsx:138`
- [ ] **Increase grid gaps for touch interactions**
  - `src/app/panels/configuration/configuration-panel.tsx:21`
- [ ] **Add granular mobile breakpoints**
  - `tailwind.config.js`

## 🎯 LOW PRIORITY

### Features

- [ ] **Implement weapon wishing**
- [ ] **Implement strategy mode**

### Advanced Features

- [ ] **Automated git hook migration system** → [Details](./state-migration-system.md)
- [ ] **Fix scenarios grid narrow columns**
  - `src/components/simulation-results/scenarios-grid.tsx:23-25,35-37`

---

## ✅ COMPLETED

- [x] **CRITICAL: Change CLEAR_DATA from true to false** (Fixed data loss issue)
  - `src/lib/mobx/make-local-storage.ts:3`
- [x] **Add state schema versioning system** → [Details](./state-migration-system.md)
  - `src/lib/mobx/genshin-state.ts` - Added STATE_VERSION constant
  - `src/lib/mobx/migrations.ts` - Created migration infrastructure
  - `src/lib/mobx/make-local-storage.ts` - Added callback support for migrations
- [x] **Add data migration system** → [Details](./state-migration-system.md)
  - `scripts/state-schema-detector.js` - Automated schema change detection
  - `scripts/migration-generator.js` - Auto-generates migration stubs
  - `scripts/setup-git-hooks.js` - Git pre-commit hook for schema validation
- [x] **Add proper fallback states for corrupted data**
  - Enhanced `make-local-storage.ts` with better error handling and validation callbacks
