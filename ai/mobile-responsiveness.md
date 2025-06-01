# Mobile Responsiveness Implementation Guide

## Touch Target Standards
All interactive elements must meet **44x44px minimum** touch target size per Apple/Google accessibility guidelines.

## Implementation Patterns

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
```tsx
// Ensure minimum 44x44px touch targets
className="min-h-[44px] min-w-[44px] flex items-center justify-center"
```

### Mobile-First Typography
```tsx
// Start large for mobile, get smaller for desktop
className="text-base md:text-sm lg:text-xs"
```

## Testing Checklist
- [ ] Test on iPhone SE (375px width)
- [ ] Test on Android (various sizes)
- [ ] Verify all interactive elements are tappable
- [ ] Check text readability at arm's length
- [ ] Validate touch target sizes with browser dev tools

## Critical Issues Found

### Input Components
- Plus/minus buttons only 12px (extremely hard to tap)
- Input containers only 28px height
- Number input spinners hidden but should use native on mobile

### Button Components
- Default button height 36px (below 44px minimum)
- Icon buttons have no minimum touch target

### Layout Issues
- Grid gaps only 8px between interactive elements
- Typography backwards (smaller on mobile)
- Missing mobile breakpoints