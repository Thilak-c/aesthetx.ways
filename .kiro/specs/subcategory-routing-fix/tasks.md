# Implementation Plan

- [x] 1. Update normalization function to handle singular/plural variations
  - Modify the `normalizeSubcategory` function in `/app/shop/subcategory/page.jsx` to remove trailing 's' for better singular/plural matching
  - Ensure the function handles edge cases (null, undefined, empty strings)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2_

- [x] 2. Expand the static subcategory map with comprehensive variations
  - Add all common variations for each subcategory (singular, plural, with/without hyphens)
  - Include entries for: "hoodie"/"hoodies", "tshirt"/"t-shirt"/"tshirts"/"t-shirts", "pant"/"pants", etc.
  - Ensure all normalized keys map to the correct canonical subcategory names as stored in the database
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.3, 3.4_

- [x] 3. Implement dynamic subcategory discovery with fuzzy matching
  - Import and use the `getAllSubcategories` query from `convex/category.js`
  - Create a `findSubcategoryMatch` function that performs normalized comparison between URL parameter and database subcategories
  - Implement fallback logic: static map first, then dynamic discovery, then error state
  - _Requirements: 3.1, 3.3, 4.1_

- [x] 4. Update error handling to show available subcategories
  - Modify the error state UI to display a list of available subcategories from the database
  - Convert subcategory names to URL-friendly format for navigation links
  - Ensure error message shows the original parameter that was provided
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Update subcategory tab navigation to use canonical formats
  - Ensure tab navigation updates URL with canonical subcategory format
  - Maintain current filter state when switching subcategories
  - Update browser history correctly for back/forward navigation
  - _Requirements: 4.2, 4.3_

- [ ]* 6. Add validation tests for the normalization function
  - Test case variations (HOODIE, hoodie, Hoodie)
  - Test singular/plural handling (hoodie vs hoodies)
  - Test separator handling (men-low-top-sneakers, men_low_top_sneakers)
  - Test edge cases (null, undefined, empty string)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2_

- [ ]* 7. Add integration tests for subcategory routing
  - Test various URL parameter formats resolve correctly
  - Test product filtering works with different subcategory formats
  - Test error states for invalid subcategories
  - Test navigation between subcategories maintains state
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_
