# Design Document: Convex Loading Fix

## Overview

This design addresses the random loading issues on the home page by optimizing Convex queries, implementing proper error handling, and adding performance monitoring. The solution focuses on limiting query results, adding timeouts, implementing fallbacks, and improving the overall data fetching strategy.

## Architecture

### Current Issues

1. **NewArrivalsSlider** calls `api.products.getAll` without limits, potentially fetching hundreds of products
2. **TopPicksSlider** uses direct Convex client instead of React hooks
3. Multiple simultaneous queries on home page without prioritization
4. No timeout handling for slow queries
5. Insufficient error boundaries and fallback states

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Home Page                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ProductSlider│  │ TopPicks     │  │ NewArrivals  │      │
│  │ (Static)     │  │ (Query)      │  │ (Query)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Query Manager │                        │
│                    │  - Limits      │                        │
│                    │  - Timeouts    │                        │
│                    │  - Caching     │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │ Convex Backend │                        │
│                    │  - products.js │                        │
│                    │  - views.js    │                        │
│                    └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Optimized Convex Queries

#### New Query: `getRecentProducts`

```javascript
// convex/products.js
export const getRecentProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    try {
      const products = await ctx.db
        .query("products")
        .filter(q => q.neq(q.field("isDeleted"), true))
        .filter(q => q.neq(q.field("isHidden"), true))
        .order("desc")
        .take(limit);
      
      return products;
    } catch (error) {
      console.error("Error fetching recent products:", error);
      return [];
    }
  },
});
```

#### Updated Query: `getTopPicks`

```javascript
// Already exists but needs to ensure proper limit
export const getTopPicks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const allProducts = await ctx.db
      .query("products")
      .filter(q => q.neq(q.field("isDeleted"), true))
      .filter(q => q.neq(q.field("isHidden"), true))
      .collect();
    
    const visibleProducts = allProducts.filter(p => !p.isHidden);
    const sortedProducts = visibleProducts
      .sort((a, b) => (b.buys || 0) - (a.buys || 0))
      .slice(0, limit);
    
    return sortedProducts.map(p => ({
      _id: p._id,
      itemId: p.itemId,
      name: p.name,
      category: p.category,
      price: p.price,
      mainImage: p.mainImage || p.image || "/products/placeholder.jpg",
      buys: p.buys
    }));
  },
});
```

### 2. Updated Component Architecture

#### NewArrivalsSlider Component

**Changes:**
- Replace `api.products.getAll` with `api.products.getRecentProducts`
- Add proper error handling
- Implement retry mechanism
- Add loading timeout

```javascript
const products = useQuery(api.products.getRecentProducts, { limit: 20 });
const [error, setError] = useState(null);
const [isTimeout, setIsTimeout] = useState(false);

useEffect(() => {
  const timeout = setTimeout(() => {
    if (products === undefined) {
      setIsTimeout(true);
    }
  }, 5000); // 5 second timeout
  
  return () => clearTimeout(timeout);
}, [products]);
```

#### TopPicksSlider Component

**Changes:**
- Use React hooks instead of direct Convex client
- Add error boundaries
- Implement fallback data

```javascript
const products = useQuery(api.products.getTopPicks, { limit: 10 });
const [showFallback, setShowFallback] = useState(false);

useEffect(() => {
  if (products === undefined) {
    const timer = setTimeout(() => setShowFallback(true), 3000);
    return () => clearTimeout(timer);
  }
}, [products]);
```

### 3. Error Handling Strategy

#### Error States

1. **Loading State** (`products === undefined`)
   - Show skeleton loaders
   - Set timeout after 5 seconds

2. **Empty State** (`products?.length === 0`)
   - Show "No products available" message
   - Provide navigation to other sections

3. **Error State** (query fails)
   - Show error message
   - Provide retry button
   - Log error for debugging

4. **Timeout State** (query takes too long)
   - Show timeout message
   - Offer to reload page
   - Switch to cached data if available

#### Error Component

```javascript
const ErrorFallback = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-4">
    <p className="text-red-500">Failed to load products</p>
    <button 
      onClick={retry}
      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
    >
      Try Again
    </button>
  </div>
);
```

## Data Models

### Query Response Format

```typescript
interface Product {
  _id: string;
  itemId: string;
  name: string;
  category: string;
  price: number;
  mainImage: string;
  buys?: number;
  createdAt?: string;
}

interface QueryResponse {
  data: Product[];
  error?: string;
  isLoading: boolean;
  isTimeout: boolean;
}
```

## Error Handling

### Query-Level Error Handling

All Convex queries will implement try-catch blocks:

```javascript
handler: async (ctx, args) => {
  try {
    // Query logic
    return data;
  } catch (error) {
    console.error("Query error:", error);
    return []; // Return empty array instead of throwing
  }
}
```

### Component-Level Error Handling

Components will handle three states:

1. **Loading**: Show skeleton loaders
2. **Error**: Show error message with retry
3. **Success**: Render data

### Timeout Handling

Implement client-side timeouts:

```javascript
const QUERY_TIMEOUT = 5000; // 5 seconds

useEffect(() => {
  if (products === undefined) {
    const timer = setTimeout(() => {
      setIsTimeout(true);
      // Optionally trigger fallback or cached data
    }, QUERY_TIMEOUT);
    
    return () => clearTimeout(timer);
  } else {
    setIsTimeout(false);
  }
}, [products]);
```

## Testing Strategy

### Unit Tests

1. Test query functions return correct data structure
2. Test query limits are enforced
3. Test error handling returns empty arrays
4. Test timeout logic triggers correctly

### Integration Tests

1. Test home page loads all sections
2. Test error states display correctly
3. Test retry mechanisms work
4. Test skeleton loaders appear during loading

### Performance Tests

1. Measure query execution time
2. Test with large datasets
3. Test concurrent query performance
4. Measure time to first contentful paint

### Manual Testing Checklist

- [ ] Home page loads without infinite loading
- [ ] All product sections display correctly
- [ ] Error messages appear when queries fail
- [ ] Retry buttons work as expected
- [ ] Skeleton loaders show during loading
- [ ] Empty states display when no products
- [ ] Page remains responsive during loading
- [ ] No console errors in production

## Performance Considerations

### Query Optimization

1. **Limit Results**: Never fetch more than 20 items per query
2. **Index Usage**: Ensure queries use database indexes
3. **Parallel Queries**: Load critical content first
4. **Lazy Loading**: Load below-fold content after initial render

### Caching Strategy

1. **Client-Side Cache**: Use React Query or SWR for caching
2. **Cache Duration**: 5 minutes for product lists
3. **Stale-While-Revalidate**: Show cached data while fetching fresh
4. **Cache Invalidation**: Clear cache on product updates

### Loading Priorities

1. **Priority 1**: Hero section (ProductSlider)
2. **Priority 2**: Top Picks (above fold)
3. **Priority 3**: New Arrivals (above fold)
4. **Priority 4**: Other sections (below fold)

## Implementation Notes

### Phase 1: Query Optimization
- Add `getRecentProducts` query
- Update `getTopPicks` to enforce limits
- Add error handling to all queries

### Phase 2: Component Updates
- Update NewArrivalsSlider to use new query
- Update TopPicksSlider to use React hooks
- Add error boundaries

### Phase 3: Error Handling
- Implement timeout logic
- Add retry mechanisms
- Create error fallback components

### Phase 4: Testing & Monitoring
- Add performance logging
- Test all error scenarios
- Monitor query performance in production

## Migration Strategy

1. **Backward Compatibility**: Keep old queries temporarily
2. **Gradual Rollout**: Update one component at a time
3. **Monitoring**: Watch for errors during migration
4. **Rollback Plan**: Keep old code commented for quick rollback

## Security Considerations

- Ensure queries filter out deleted/hidden products
- Validate query limits on server side
- Rate limit queries to prevent abuse
- Log suspicious query patterns

## Accessibility

- Ensure skeleton loaders are announced to screen readers
- Error messages should be accessible
- Retry buttons should be keyboard accessible
- Loading states should not trap focus
