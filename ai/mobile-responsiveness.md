# Mobile Responsiveness Implementation Guide

## Touch Target Standards

All interactive elements must meet **44x44px minimum** touch target size per Apple/Google accessibility guidelines.

## Patterns to follow

### Native Number Input Strategy

```tsx
// Replace custom spinners with native mobile controls
<input
  type="number"
  inputMode="numeric"
  pattern="[0-9]*"
  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none md:[&::-webkit-inner-spin-button]:appearance-auto md:[&::-webkit-outer-spin-button]:appearance-auto"
/>
```

### Touch Target Pattern

Touch targets should be at least 44x44px. This doesn't mean the visual element needs to be 44x44px, as sometimes this will appear too large, but the active touch area for things like checkbox must always be 44x44px.

```tsx
// Ensure minimum 44x44px touch targets
className = "min-h-[44px] min-w-[44px] flex items-center justify-center";
```

### Mobile-First Typography

```tsx
// Start large for mobile, get smaller for desktop
className = "text-base md:text-sm lg:text-xs";
```

## Testing Checklist

- [ ] Test on iPhone SE (375px width)
- [ ] Test on Android (various sizes)
- [ ] Verify all interactive elements are tappable
- [ ] Check text readability at arm's length
- [ ] Validate touch target sizes with browser dev tools
