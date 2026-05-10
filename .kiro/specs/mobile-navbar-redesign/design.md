# Design Document

## Overview

The mobile navbar redesign focuses on creating a cleaner, more intuitive layout by repositioning key navigation elements. The new design follows mobile UI best practices with the hamburger menu on the left (easily accessible for thumb navigation), the logo centered (prominent brand identity), and action icons on the right (natural reading flow).

## Architecture

### Component Structure

The redesign modifies the existing `NavbarMobile` component in `components/Navbar.jsx`. The component maintains its current functionality while reorganizing the visual layout and element positioning.

**Key Changes:**
- Restructure the flex layout to support left-center-right positioning
- Use absolute positioning for the centered logo
- Adjust spacing and sizing for compact mobile display
- Relocate or remove the user navigation component from the top navbar

### Layout Strategy

The navbar uses a three-section flex layout:

```
┌─────────────────────────────────────────┐
│ [☰]        [LOGO]         [🔍] [🛒]    │
└─────────────────────────────────────────┘
  Left      Center (abs)      Right
```

- **Left Section**: Hamburger menu button
- **Center Section**: Logo (absolutely positioned)
- **Right Section**: Search and cart icons

## Components and Interfaces

### NavbarMobile Component

**Props:** None (uses internal state and hooks)

**State Variables:**
- `sidebarOpen`: Controls sidebar drawer visibility
- `showSearch`: Controls search overlay visibility
- `searchTerm`: Stores search input value
- `token`: User session token
- `me`: User data from Convex query

**Layout Structure:**

```jsx
<nav className="fixed top-0 left-0 z-[40] w-full flex items-center justify-between">
  {/* Left: Hamburger */}
  <button onClick={() => setSidebarOpen(true)}>
    <Menu size={24} />
  </button>

  {/* Center: Logo (absolute positioning) */}
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <img src="/favicon.ico" alt="Logo" />
  </div>

  {/* Right: Search + Cart */}
  <div className="flex items-center gap-2">
    <button onClick={() => setShowSearch(true)}>
      <Search size={24} />
    </button>
    <Link href="/cart">
      <button className="relative">
        <ShoppingBag size={24} />
        {/* Badge */}
      </button>
    </Link>
  </div>
</nav>
```

### Styling Approach

**Navbar Container:**
- Fixed positioning at top
- Full width with minimal horizontal padding
- Reduced vertical padding (py-2 or py-1.5)
- Maintains existing backdrop blur and border styling

**Icon Buttons:**
- Consistent sizing (24px icons)
- Minimal padding (p-1 or p-2)
- Touch-friendly tap targets (44x44px minimum)
- Hover states for visual feedback

**Logo:**
- Absolute positioning with transform centering
- Width: 35-40px
- Maintains aspect ratio

**Badge (Cart Counter):**
- Positioned absolutely on cart icon
- Small circular badge (w-5 h-5)
- Black background with white text
- Displays count or "99+" for large numbers

## Data Models

No new data models required. The component continues to use existing Convex queries:

- `api.users.meByToken`: Fetches user data
- `api.cart.getCartSummary`: Fetches cart item count

## Error Handling

**Missing User Data:**
- Cart badge only displays when user is logged in and cart data is available
- Gracefully handles undefined/null cart summary

**Search Overlay:**
- Prevents body scroll when search is open
- Cleans up event listeners on unmount
- Handles focus management for accessibility

**Navigation:**
- Sidebar drawer state managed independently
- Search overlay state managed independently
- No conflicts between overlays

## Testing Strategy

### Visual Testing
1. Verify layout on various mobile screen sizes (320px - 767px)
2. Confirm logo remains centered across different widths
3. Check icon alignment and spacing
4. Verify touch target sizes meet accessibility standards

### Functional Testing
1. Test hamburger menu opens sidebar drawer
2. Test search icon opens search overlay
3. Test cart icon navigates to cart page
4. Verify cart badge displays correct count
5. Test search overlay closes properly
6. Verify body scroll lock works with search overlay

### Responsive Testing
1. Confirm navbar only displays on mobile (< 768px)
2. Verify desktop navbar remains unchanged
3. Test orientation changes (portrait/landscape)

### Integration Testing
1. Verify Convex queries load cart data correctly
2. Test user authentication state affects cart badge
3. Confirm navigation links work properly
