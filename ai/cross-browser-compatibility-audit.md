# Cross-Browser Compatibility & Error Handling Audit

## Executive Summary

Based on user reports and codebase analysis, the application has critical cross-browser compatibility issues causing infinite reload loops in multiple browsers and ad blockers. The current error handling strategy is overly aggressive, clearing all user data on any error, which may be causing more harm than good.

## 🚨 Critical Issues Identified

### 1. Infinite Reload Loop (Multiple Browsers)

**User Reports:**

- OperaGX: "Keeps on reloading for some reason. Opening it on Private Browser fixed it though"
- Chrome: "Its reloading for me and I'm on chrome 😭"
- iOS Safari: "Just flashes constantly for me"
- Firefox + uBlock Origin: "When I have uBlock Origin enable, the page will constantly refresh and fail to properly load"

**Root Cause Analysis:**
The application has multiple error boundaries and global error handlers that automatically clear localStorage and reload the page:

1. `GlobalErrorHandler` (src/components/global-error-handler.tsx:34-36)
2. `SilentErrorBoundary` (src/app/error-boundary.tsx:52-54)
3. `Error.tsx` (src/app/error.tsx:40-42)

This creates a dangerous feedback loop where:

1. Error occurs (possibly from ad blocker interference, hydration mismatch, or browser compatibility)
2. Error handler clears all app data
3. Page reloads
4. Same error occurs again
5. Infinite loop continues

### 2. Hydration Errors

**Known Issues:**

- `src/components/resource.tsx:40-18` - Conditional rendering causing client/server mismatch
- `src/app/panels/configuration/wish-resources.tsx:64` - Number calculations differ between client/server

These hydration errors trigger the error boundaries, contributing to the reload loop.

### 3. Ad Blocker Compatibility

uBlock Origin specifically mentioned as causing issues. Possible causes:

- Analytics scripts blocked (Google Analytics, Vercel Analytics)
- Third-party fonts or resources blocked
- LocalStorage access restrictions

## 🔧 Error Handling Problems

### Current Strategy Issues

1. **Overly Aggressive Recovery**: All error handlers immediately clear user data and reload
2. **No Error Classification**: Treats all errors the same (state corruption vs temporary network issues)
3. **No User Notification**: Users get no explanation of what happened
4. **Multiple Overlapping Handlers**: 3 different error handling mechanisms can conflict

### Problematic Code Patterns

```typescript
// Pattern found in multiple files - clears ALL data on ANY error
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.includes("genshin-store")) {
    keysToRemove.push(key);
  }
}
```

## 🌐 Cross-Browser Compatibility Issues

### 1. Window/Document Access Patterns

**Potential Issues:**

- `window.addEventListener("resize", updateWidth)` in estimated-future-wishes.tsx:118-119
- Direct `window.location.reload()` calls without browser capability checks
- No fallbacks for browsers with restricted localStorage access

### 2. LocalStorage Reliability

**Issues:**

- No quota limit checking before writing
- No graceful degradation when localStorage is unavailable
- Silent failures in private browsing modes

### 3. Modern JavaScript Features

**Review Needed:**

- Optional chaining usage across codebase
- Modern array methods
- ES2020+ features without polyfills

### 4. Third-Party Dependencies

**Potential Conflicts:**

- Google Analytics integration
- Vercel Analytics/Speed Insights
- Font loading from external sources

## 📋 Recommended Fixes

### Priority 1: Stop the Infinite Reload Loop

1. **Implement Error Classification**

   ```typescript
   enum ErrorSeverity {
     RECOVERABLE = "recoverable", // Network, temporary issues
     STATE_CORRUPTION = "corruption", // Bad localStorage data
     FATAL = "fatal", // Critical app errors
   }
   ```

2. **Add Error Retry Logic**

   - Track error count in sessionStorage
   - Only clear data after 3+ consecutive errors
   - Add exponential backoff before reload

3. **Fix Hydration Errors**
   - Use `useIsomorphicLayoutEffect` for client-only code
   - Add `suppressHydrationWarning` for unavoidable mismatches
   - Implement proper SSR checks

### Priority 2: Improve Error Handling

1. **User-Friendly Error Messages**

   - Show specific error descriptions
   - Provide recovery options before data clearing
   - Add "Report Bug" functionality

2. **Graceful Degradation**

   - Continue functioning when localStorage unavailable
   - Provide in-memory fallbacks
   - Detect and handle private browsing mode

3. **Consolidate Error Boundaries**
   - Remove duplicate error handlers
   - Implement single, smart error boundary
   - Add error reporting/telemetry

### Priority 3: Cross-Browser Testing

1. **Browser Compatibility Matrix**

   - Test on Safari (iOS/macOS)
   - Test with common ad blockers
   - Test in private/incognito modes
   - Test on mobile browsers

2. **Feature Detection**

   ```typescript
   const supportsLocalStorage = (() => {
     try {
       const test = "__localStorage_test__";
       localStorage.setItem(test, test);
       localStorage.removeItem(test);
       return true;
     } catch {
       return false;
     }
   })();
   ```

3. **Add Polyfills/Fallbacks**
   - LocalStorage polyfill for unsupported browsers
   - Window/resize event debouncing
   - Graceful analytics loading

## 🎯 Immediate Action Items

1. **CRITICAL**: Add error counting to prevent infinite loops
2. **CRITICAL**: Fix known hydration errors
3. **HIGH**: Test with uBlock Origin enabled
4. **HIGH**: Implement localStorage availability checking
5. **MEDIUM**: Add user-friendly error messages
6. **MEDIUM**: Test across browser matrixI

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] Test with uBlock Origin enabled
- [ ] Test in private/incognito mode
- [ ] Test on iOS Safari
- [ ] Test with localStorage disabled
- [ ] Test with analytics blocked
- [ ] Test network disconnection scenarios

### Automated Testing

- Add cross-browser testing to CI/CD
- Implement error boundary testing
- Add localStorage compatibility tests

## 📊 Success Metrics

- Zero infinite reload reports
- Reduced error boundary activation rate
- Improved user retention (fewer data loss incidents)
- Positive feedback on error recovery experience

## 🔗 Related Files to Review/Fix

- `src/components/global-error-handler.tsx` - Main culprit
- `src/app/error-boundary.tsx` - Redundant with global handler
- `src/app/error.tsx` - User-facing error page
- `src/lib/mobx/make-local-storage.ts` - Storage reliability
- `src/components/resource.tsx` - Hydration error
- `src/app/panels/configuration/wish-resources.tsx` - Hydration error
