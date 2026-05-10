# Design Document

## Overview

This design implements an initial loading screen that displays when users first visit the AesthetX Ways e-commerce site. The loading screen will show for a minimum of 3 seconds, providing visual feedback during application initialization. The implementation will integrate with the existing Next.js application structure and leverage the current Framer Motion animations already in use.

## Architecture

### Component Structure

The loading screen will be implemented as a new client-side component that wraps the root layout. The architecture follows these principles:

1. **Session-based Display**: Use sessionStorage to track if the loading screen has been shown
2. **Minimum Duration Guarantee**: Use Promise-based timing to ensure 3-second minimum display
3. **Non-blocking**: Allow the application to initialize in parallel with the loading screen display
4. **Smooth Transitions**: Use Framer Motion for consistent animations with the existing app

### Integration Points

- **Root Layout** (`app/layout.js`): Will be modified to include the loading screen wrapper
- **New Component**: `InitialLoadingScreen.jsx` - handles display logic and timing
- **Session Storage**: Tracks loading screen display state across page navigations

## Components and Interfaces

### InitialLoadingScreen Component

**Location**: `components/InitialLoadingScreen.jsx`

**Props**: 
- `children`: React nodes to render after loading completes

**State**:
- `isLoading`: boolean - controls loading screen visibility
- `hasShownLoading`: boolean - tracks if loading has been shown this session

**Key Methods**:
```javascript
// Check if loading screen should be shown
const shouldShowLoading = () => {
  return !sessionStorage.getItem('initialLoadingShown');
}

// Handle loading completion with minimum duration
const handleLoadingComplete = async () => {
  const startTime = Date.now();
  const minDuration = 3000; // 3 seconds
  
  // Wait for minimum duration
  await new Promise(resolve => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);
    setTimeout(resolve, remaining);
  });
  
  // Mark as shown and hide
  sessionStorage.setItem('initialLoadingShown', 'true');
  setIsLoading(false);
}
```

### Visual Design

**Loading Screen Elements**:
1. Full-screen overlay with brand background color
2. Centered logo with pulse/fade animation
3. Optional loading text or progress indicator
4. Smooth fade-out transition

**Animation Specifications**:
- Logo: Pulse animation (scale 0.95 to 1.05) with 2-second duration
- Fade-in: 0.3 seconds on mount
- Fade-out: 0.5 seconds on completion
- Uses Framer Motion's `motion.div` for consistency

## Data Models

### Session Storage Schema

```javascript
{
  "initialLoadingShown": "true" | null
}
```

**Key**: `initialLoadingShown`
**Value**: String "true" when loading has been shown, null/undefined otherwise
**Scope**: Session (cleared when tab/window closes)

## Error Handling

### Scenarios and Solutions

1. **SessionStorage Unavailable** (private browsing, disabled storage)
   - Fallback: Always show loading screen
   - No error thrown, graceful degradation

2. **Animation Library Failure**
   - Fallback: CSS-based fade transition
   - Component still functions without Framer Motion

3. **Logo Image Load Failure**
   - Fallback: Display brand name text
   - Use `onError` handler on image element

4. **Timing Issues**
   - Ensure minimum duration is always respected
   - Use `Math.max()` to prevent negative timeout values

## Testing Strategy

### Unit Testing Focus

1. **Timing Logic**
   - Verify minimum 3-second duration is enforced
   - Test that loading completes after minimum duration
   - Verify sessionStorage is set correctly

2. **Session Tracking**
   - Test loading shows on first visit
   - Test loading doesn't show on subsequent navigations
   - Test loading shows in new tab/window

3. **Rendering**
   - Verify loading screen renders with correct elements
   - Verify children render after loading completes
   - Test animation states

### Integration Testing

1. **User Flow**
   - First visit: Loading screen appears for 3+ seconds
   - Navigation: Loading screen doesn't reappear
   - New session: Loading screen appears again

2. **Theme Support**
   - Verify loading screen respects light/dark theme
   - Test theme transitions during loading

3. **Responsive Design**
   - Test on mobile, tablet, and desktop viewports
   - Verify logo scales appropriately

### Manual Testing Checklist

- [ ] Loading screen appears on first visit
- [ ] Minimum 3-second duration is enforced
- [ ] Smooth fade-out transition
- [ ] No reappearance on navigation
- [ ] Reappears in new tab/window
- [ ] Logo displays correctly
- [ ] Animation is smooth
- [ ] Works in light and dark themes
- [ ] Responsive on all screen sizes
- [ ] No console errors

## Implementation Notes

### Performance Considerations

1. **Parallel Loading**: Application initialization happens during loading screen display
2. **Minimal Bundle Impact**: Component is small and uses existing dependencies
3. **No Blocking**: Loading screen doesn't prevent app from becoming interactive

### Accessibility

1. **Screen Readers**: Add `role="status"` and `aria-live="polite"` to loading container
2. **Reduced Motion**: Respect `prefers-reduced-motion` media query
3. **Focus Management**: Ensure focus moves to main content after loading

### Browser Compatibility

- Modern browsers with sessionStorage support (IE11+)
- Framer Motion compatibility (already in use)
- CSS Grid/Flexbox for layout (widely supported)

## Design Decisions and Rationales

### Why SessionStorage vs LocalStorage?

SessionStorage ensures the loading screen appears once per tab/window session, providing a balance between user experience (not showing repeatedly) and freshness (showing on new visits). LocalStorage would persist across all sessions, potentially hiding the loading screen for too long.

### Why 3 Seconds Minimum?

Three seconds provides enough time for:
- Brand recognition and visual impact
- Initial data fetching and hydration
- Smooth transition without feeling rushed
- Not too long to frustrate users

### Why Client-Side Component?

The loading screen needs to:
- Access sessionStorage (browser-only API)
- Manage timing and state
- Integrate with Framer Motion animations
- Wrap the entire application

This requires a client component with "use client" directive.

### Integration with Existing LayoutWrapper

The current `LayoutWrapper` already has loading logic for user authentication. The new `InitialLoadingScreen` will wrap the entire app at a higher level, showing before any user-specific loading occurs. This creates a layered loading experience:
1. Initial loading screen (3 seconds, first visit only)
2. User authentication loading (existing, when applicable)
