# Design Document

## Overview

This design addresses the subcategory routing issue in the `/app/shop/subcategory/page.jsx` component. The problem occurs when URL parameters don't match the hardcoded subcategory map, causing valid subcategories to show "Not Found" errors. The solution involves creating a comprehensive subcategory mapping system that handles all variations (singular/plural, case differences, formatting) and dynamically discovers available subcategories from the database.

## Architecture

### Current Architecture Issues

1. **Hardcoded Subcategory Map**: The current implementation uses a static `subcategoryMap` object with limited entries
2. **Incomplete Normalization**: The normalization function removes spaces/hyphens but doesn't handle singular/plural variations
3. **No Dynamic Discovery**: The system doesn't query available subcategories from the database
4. **Case Sensitivity**: While normalization converts to lowercase, the map keys must be manually maintained

### Proposed Architecture

The solution uses a two-tier approach:

1. **Static Mapping Layer**: Handles common URL variations and maps them to canonical names
2. **Dynamic Discovery Layer**: Queries the database for actual subcategories and performs fuzzy matching when static mapping fails

```
URL Parameter → Normalize → Static Map Lookup → Found? → Use Canonical Name
                                ↓ Not Found
                         Query Database → Fuzzy Match → Found? → Use Matched Name
                                                          ↓ Not Found
                                                    Show Error
```

## Components and Interfaces

### 1. Enhanced Normalization Function

**Purpose**: Convert any subcategory string to a consistent format for comparison

**Implementation**:
```javascript
const normalizeSubcategory = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[-_\s]+/g, "") // Remove separators
    .replace(/s$/, "")        // Remove trailing 's' for plural handling
    .trim();
};
```

**Key Features**:
- Case-insensitive
- Removes hyphens, underscores, spaces
- Handles singular/plural by removing trailing 's'
- Returns empty string for invalid input

### 2. Comprehensive Subcategory Map

**Purpose**: Map common URL variations to canonical subcategory names

**Structure**:
```javascript
const subcategoryMap = {
  // Men's Sneakers
  "menlowropsneaker": "Men Low Top Sneakers",
  "menlowropsneakers": "Men Low Top Sneakers",
  "men-low-top-sneaker": "Men Low Top Sneakers",
  "men-low-top-sneakers": "Men Low Top Sneakers",
  
  // T-Shirts
  "tshirt": "T-shirt",
  "t-shirt": "T-shirt",
  "tshirts": "T-shirt",
  "t-shirts": "T-shirt",
  
  // Hoodies
  "hoodie": "Hoodies",
  "hoodies": "Hoodies",
  
  // Sweatshirts
  "sweatshirt": "Sweatshirt",
  "sweatshirts": "Sweatshirt",
  
  // Pants
  "pant": "Pants",
  "pants": "Pants",
  
  // Women's Sneakers
  "womensneaker": "Women Sneakers",
  "womensneakers": "Women Sneakers",
  "women-sneaker": "Women Sneakers",
  "women-sneakers": "Women Sneakers",
};
```

### 3. Dynamic Subcategory Discovery

**Purpose**: Fetch available subcategories from database and perform fuzzy matching

**Implementation**:
- Use existing `getAllSubcategories` query from `convex/category.js`
- Perform normalized comparison between URL parameter and database subcategories
- Return best match or null if no match found

**Interface**:
```javascript
const findSubcategoryMatch = (urlParam, availableSubcategories) => {
  const normalized = normalizeSubcategory(urlParam);
  
  // Try exact normalized match first
  for (const sub of availableSubcategories) {
    if (normalizeSubcategory(sub) === normalized) {
      return sub;
    }
  }
  
  return null;
};
```

### 4. Updated Component Logic

**Flow**:
1. Get URL parameter `sub`
2. Normalize the parameter
3. Check static map for match
4. If not found, query database and perform fuzzy match
5. If still not found, show error with helpful suggestions
6. If found, display products using the canonical name

## Data Models

### Product Subcategory Field

**Current Schema** (from `convex/schema.js`):
```javascript
subcategories: v.optional(v.string())
```

**Usage**: Single string value per product (e.g., "Hoodies", "T-shirt", "Men Low Top Sneakers")

**No Changes Required**: The existing schema supports the solution

### Subcategory Query Response

**From `getAllSubcategories` query**:
```javascript
// Returns: string[]
// Example: ["Hoodies", "T-shirt", "Men Low Top Sneakers", "Women Sneakers", "Sweatshirt", "Pants"]
```

## Error Handling

### Invalid Subcategory Scenarios

1. **URL parameter doesn't match any variation**
   - Show error message with original parameter
   - Suggest valid subcategories from database
   - Provide navigation to popular subcategories

2. **Empty or missing parameter**
   - Default to a popular subcategory (e.g., "Men Low Top Sneakers")
   - Or show all subcategories as navigation options

3. **Database query fails**
   - Fall back to static map only
   - Show error if static map also fails
   - Log error for debugging

### Error UI Components

**Error Message Structure**:
```jsx
<div className="error-container">
  <h2>Subcategory Not Found</h2>
  <p>The subcategory "{originalParam}" doesn't exist.</p>
  <div className="suggestions">
    <h3>Available Subcategories:</h3>
    <ul>
      {availableSubcategories.map(sub => (
        <li key={sub}>
          <Link to={`/shop/subcategory?sub=${sub}`}>{sub}</Link>
        </li>
      ))}
    </ul>
  </div>
</div>
```

## Testing Strategy

### Unit Tests

1. **Normalization Function Tests**
   - Test case variations (HOODIE, hoodie, Hoodie)
   - Test singular/plural (hoodie, hoodies)
   - Test with separators (men-low-top-sneakers, men_low_top_sneakers)
   - Test edge cases (null, undefined, empty string, numbers)

2. **Subcategory Mapping Tests**
   - Test all map entries resolve correctly
   - Test that normalized keys match expected canonical names
   - Test duplicate detection (ensure no conflicting mappings)

3. **Fuzzy Matching Tests**
   - Test exact matches
   - Test partial matches
   - Test no matches
   - Test with empty database results

### Integration Tests

1. **URL Parameter Handling**
   - Test various URL formats
   - Test with query parameters
   - Test navigation between subcategories
   - Test browser back/forward navigation

2. **Product Filtering**
   - Verify products are correctly filtered by subcategory
   - Test with products that have different subcategory formats
   - Test empty results (valid subcategory but no products)

3. **Error States**
   - Test invalid subcategory parameter
   - Test missing parameter
   - Test database query failure

### Manual Testing Checklist

- [ ] Navigate to `/shop/subcategory?ct=men&sub=HOODIE` → Should show Hoodies
- [ ] Navigate to `/shop/subcategory?ct=men&sub=hoodie` → Should show Hoodies
- [ ] Navigate to `/shop/subcategory?ct=men&sub=hoodies` → Should show Hoodies
- [ ] Navigate to `/shop/subcategory?ct=men&sub=Hoodies` → Should show Hoodies
- [ ] Navigate to `/shop/subcategory?ct=men&sub=invalid` → Should show error
- [ ] Click subcategory tabs → Should update URL and filter products
- [ ] Test all subcategories from database → Should all work
- [ ] Test with products that have various subcategory formats

## Implementation Notes

### Performance Considerations

1. **Query Optimization**: The `getAllSubcategories` query should be cached or memoized to avoid repeated database calls
2. **Static Map Priority**: Check static map first before querying database for better performance
3. **Lazy Loading**: Only query database when static map fails

### Backward Compatibility

1. **Existing URLs**: All existing URLs with current subcategory formats will continue to work
2. **Product Data**: No changes required to existing product subcategory values
3. **Navigation**: Existing navigation components will work without modification

### Future Enhancements

1. **SEO-Friendly URLs**: Consider using canonical subcategory slugs in URLs
2. **Subcategory Aliases**: Allow admins to define custom URL aliases
3. **Analytics**: Track which URL variations are most commonly used
4. **Auto-Correction**: Suggest correct subcategory when user types invalid one
