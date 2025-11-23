# Requirements Document

## Introduction

This feature addresses the subcategory routing issue where certain subcategory URL parameters (like "HOODIE") fail to match the internal subcategory mapping, resulting in "Subcategory Not Found" errors. The system needs to handle various subcategory name formats (singular/plural, case variations, with/without spaces or hyphens) and correctly map them to the canonical subcategory names used in the product database.

## Glossary

- **Subcategory Page**: The page component at `/app/shop/subcategory/page.jsx` that displays products filtered by subcategory
- **URL Parameter**: The query string parameter "sub" that specifies which subcategory to display
- **Subcategory Map**: The object that maps normalized URL parameters to canonical subcategory names
- **Normalization Function**: The function that converts subcategory strings to a consistent format for comparison
- **Canonical Subcategory Name**: The official subcategory name as stored in the product database

## Requirements

### Requirement 1

**User Story:** As a user, I want to access subcategory pages using various URL formats (singular, plural, different cases), so that I can view products regardless of how the URL is formatted

#### Acceptance Criteria

1. WHEN a user navigates to `/shop/subcategory?ct=men&sub=HOODIE`, THE Subcategory Page SHALL display products from the "Hoodies" subcategory
2. WHEN a user navigates to `/shop/subcategory?ct=men&sub=hoodie`, THE Subcategory Page SHALL display products from the "Hoodies" subcategory
3. WHEN a user navigates to `/shop/subcategory?ct=men&sub=hoodies`, THE Subcategory Page SHALL display products from the "Hoodies" subcategory
4. WHEN a user navigates to `/shop/subcategory?ct=men&sub=Hoodies`, THE Subcategory Page SHALL display products from the "Hoodies" subcategory

### Requirement 2

**User Story:** As a user, I want to see helpful error messages when a subcategory truly doesn't exist, so that I can navigate to valid subcategories

#### Acceptance Criteria

1. WHEN a user navigates to a URL with an invalid subcategory parameter that cannot be mapped, THE Subcategory Page SHALL display an error message indicating the subcategory was not found
2. WHEN the error message is displayed, THE Subcategory Page SHALL show the original parameter value that was provided
3. WHEN the error message is displayed, THE Subcategory Page SHALL provide navigation options to valid subcategories

### Requirement 3

**User Story:** As a developer, I want the subcategory mapping to be comprehensive and maintainable, so that new subcategories can be easily added without routing issues

#### Acceptance Criteria

1. THE Subcategory Page SHALL include mappings for all common variations of each subcategory name (singular, plural, hyphenated, space-separated)
2. THE Subcategory Page SHALL use a normalization function that handles case-insensitivity, spaces, hyphens, and underscores consistently
3. THE Subcategory Page SHALL map all variations to the exact canonical subcategory name as stored in the product database
4. THE Subcategory Page SHALL support adding new subcategory mappings without modifying the normalization logic

### Requirement 4

**User Story:** As a user, I want subcategory navigation to work consistently across the site, so that I have a seamless browsing experience

#### Acceptance Criteria

1. WHEN products are filtered by subcategory, THE Subcategory Page SHALL use the same normalized comparison logic for both URL parameters and product subcategory fields
2. WHEN a subcategory is selected from the navigation tabs, THE Subcategory Page SHALL update the URL to use a canonical format
3. WHEN the URL is updated, THE Subcategory Page SHALL maintain the current filter state without page reload
