# Implementation Plan

- [x] 1. Restructure NavbarMobile component layout
  - Modify the main nav container to support three-section layout (left, center, right)
  - Update className to reduce padding and optimize for compact mobile display
  - Ensure fixed positioning and z-index remain correct
  - _Requirements: 1.1, 1.3, 4.1, 4.2, 5.1, 5.2_

- [x] 2. Implement left section with hamburger menu
  - Move hamburger menu button to the leftmost position
  - Remove the logo/brand section from the left side
  - Reduce button padding to minimize space usage while maintaining touch targets
  - Ensure onClick handler for opening sidebar drawer remains functional
  - _Requirements: 1.1, 1.2, 1.3, 4.2, 4.3_

- [x] 3. Implement center section with logo
  - Create absolutely positioned container for logo in the center
  - Use left-1/2 and -translate-x-1/2 for horizontal centering
  - Replace current logo/brand display with favicon.ico
  - Set logo width to 35-40px and maintain aspect ratio
  - Wrap logo in Link component to navigate to home page
  - _Requirements: 2.1, 2.2, 2.3, 5.3_

- [x] 4. Implement right section with search and cart icons
  - Create flex container for search and cart icons on the right side
  - Position search icon to the left of cart icon
  - Reduce gap between icons (gap-1 or gap-2)
  - Ensure search icon onClick handler opens search overlay
  - Ensure cart icon Link navigates to /cart page
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 4.2_

- [x] 5. Update cart icon with badge display
  - Maintain relative positioning on cart button for badge placement
  - Keep badge absolutely positioned with proper offset
  - Ensure badge displays cart item count from cartSummary query
  - Show "99+" for counts over 99
  - Only display badge when user is logged in and cart has items
  - _Requirements: 3.3, 5.3_

- [x] 6. Remove or relocate user navigation component
  - Remove UserNavigation component from the mobile navbar
  - Verify user navigation is accessible through sidebar drawer or other means
  - Ensure no visual clutter in the compact navbar design
  - _Requirements: 4.4_

- [x] 7. Verify responsive behavior and styling consistency
  - Test navbar displays only on screens < 768px (md:hidden)
  - Confirm backdrop blur, border, and shadow effects are maintained
  - Verify icon sizes are consistent across all elements
  - Test touch target sizes meet 44x44px minimum
  - Check navbar height is appropriately compact
  - _Requirements: 4.1, 4.3, 5.1, 5.2, 5.3_

- [x] 8. Test search overlay functionality
  - Verify search icon opens full-screen search overlay
  - Confirm body scroll lock activates when search is open
  - Test search input focus management
  - Verify search overlay closes properly with back button
  - Ensure SearchDropdown component displays correctly
  - _Requirements: 3.4_

- [x] 9. Test navigation and interaction flows
  - Test hamburger menu opens sidebar drawer
  - Test cart icon navigates to cart page
  - Verify cart badge updates when cart items change
  - Test all touch interactions on mobile devices
  - Confirm no layout shifts or visual glitches during interactions
  - _Requirements: 1.2, 3.5, 3.3_
