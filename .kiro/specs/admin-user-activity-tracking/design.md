# Design Document

## Overview

This design implements a comprehensive user activity tracking system for the AesthetX Ways e-commerce platform. The system will track real-time user behavior including page visits, actions, sessions, and provide administrators with a dashboard to monitor and analyze user activity. The implementation leverages Convex's real-time database capabilities for live updates and efficient querying.

## Architecture

### Component Structure

The activity tracking system consists of four main layers:

1. **Client-Side Tracking Layer**: React hooks and components that capture user actions
2. **Data Layer**: Convex schema and queries for storing and retrieving activity data
3. **Admin Dashboard Layer**: React components for visualizing activity data
4. **Real-time Update Layer**: Convex subscriptions for live data updates

### Integration Points

- **LayoutWrapper** (`components/LayoutWrapper.jsx`): Track page navigation
- **Product Pages**: Track product views, add to cart, purchases
- **User Actions**: Track clicks, form submissions, searches
- **Admin Dashboard** (`app/admin/analytics/page.jsx`): New analytics dashboard
- **Convex Backend**: New tables and queries for activity tracking

## Components and Interfaces

### 1. Client-Side Tracking Components

#### ActivityTracker Hook
**Location**: `hooks/useActivityTracker.js`

**Purpose**: Central hook for tracking all user activities

```javascript
const useActivityTracker = () => {
  const trackPageView = (page, metadata) => { ... }
  const trackAction = (actionType, actionData) => { ... }
  const trackEvent = (eventName, eventData) => { ... }
  
  return { trackPageView, trackAction, trackEvent }
}
```

**Tracked Actions**:
- `page_view`: User navigates to a page
- `product_view`: User views a product
- `add_to_cart`: User adds item to cart
- `remove_from_cart`: User removes item from cart
- `add_to_wishlist`: User adds to wishlist
- `search`: User performs a search
- `filter_applied`: User applies filters
- `purchase`: User completes a purchase
- `click`: User clicks on specific elements
- `form_submit`: User submits a form

#### PageViewTracker Component
**Location**: `components/PageViewTracker.jsx`

**Purpose**: Automatically track page views

```javascript
export default function PageViewTracker() {
  const pathname = usePathname()
  const { trackPageView } = useActivityTracker()
  
  useEffect(() => {
    trackPageView(pathname, {
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    })
  }, [pathname])
  
  return null
}
```

### 2. Data Layer (Convex Schema)

#### userActivity Table

```javascript
userActivity: defineTable({
  // User identification
  userId: v.optional(v.id("users")), // Null for anonymous users
  sessionId: v.string(), // Unique session identifier
  
  // Activity details
  activityType: v.string(), // 'page_view', 'action', 'event'
  actionType: v.optional(v.string()), // Specific action like 'add_to_cart'
  
  // Page/location data
  page: v.string(), // Current page URL
  previousPage: v.optional(v.string()),
  
  // Action data
  actionData: v.optional(v.any()), // JSON data about the action
  
  // Session metadata
  deviceType: v.string(), // 'mobile', 'tablet', 'desktop'
  browser: v.string(),
  os: v.string(),
  screenResolution: v.optional(v.string()),
  
  // Location data (approximate)
  country: v.optional(v.string()),
  city: v.optional(v.string()),
  ipAddress: v.optional(v.string()), // Hashed for privacy
  
  // Referrer data
  referrer: v.optional(v.string()),
  referrerDomain: v.optional(v.string()),
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  
  // Timestamps
  timestamp: v.string(),
  duration: v.optional(v.number()), // Time spent on page (ms)
  
  // Privacy
  isAnonymized: v.boolean(),
  optedOut: v.optional(v.boolean()),
})
  .index("by_user", ["userId"])
  .index("by_session", ["sessionId"])
  .index("by_timestamp", ["timestamp"])
  .index("by_activity_type", ["activityType"])
  .index("by_action_type", ["actionType"])
  .index("by_page", ["page"])
  .index("by_user_timestamp", ["userId", "timestamp"])
```

#### activeSessions Table

```javascript
activeSessions: defineTable({
  sessionId: v.string(),
  userId: v.optional(v.id("users")),
  
  // Current state
  currentPage: v.string(),
  lastActivity: v.string(), // ISO timestamp
  
  // Session metadata
  deviceType: v.string(),
  browser: v.string(),
  os: v.string(),
  
  // Location
  country: v.optional(v.string()),
  city: v.optional(v.string()),
  
  // Session stats
  pageViews: v.number(),
  actionsCount: v.number(),
  sessionStart: v.string(),
  sessionDuration: v.number(), // milliseconds
  
  // Status
  isActive: v.boolean(), // Active if last activity < 5 minutes ago
})
  .index("by_session", ["sessionId"])
  .index("by_user", ["userId"])
  .index("by_active", ["isActive"])
  .index("by_last_activity", ["lastActivity"])
```

### 3. Convex Queries and Mutations

#### Queries

**getActiveUsers** - Get count and list of active users
```javascript
export const getActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const activeSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_last_activity")
      .filter(q => q.gte(q.field("lastActivity"), fiveMinutesAgo))
      .collect()
    
    return {
      count: activeSessions.length,
      sessions: activeSessions
    }
  }
})
```

**getUserActivity** - Get activity for specific user
```javascript
export const getUserActivity = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
    activityType: v.optional(v.string())
  },
  handler: async (ctx, { userId, limit = 50, activityType }) => {
    let query = ctx.db
      .query("userActivity")
      .withIndex("by_user_timestamp", q => q.eq("userId", userId))
      .order("desc")
    
    if (limit) {
      query = query.take(limit)
    }
    
    const activities = await query.collect()
    
    if (activityType) {
      return activities.filter(a => a.activityType === activityType)
    }
    
    return activities
  }
})
```

**getPageAnalytics** - Get analytics for specific page
```javascript
export const getPageAnalytics = query({
  args: { 
    page: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, { page, startDate, endDate }) => {
    let query = ctx.db
      .query("userActivity")
      .withIndex("by_page", q => q.eq("page", page))
    
    const activities = await query.collect()
    
    // Filter by date range if provided
    let filtered = activities
    if (startDate) {
      filtered = filtered.filter(a => a.timestamp >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter(a => a.timestamp <= endDate)
    }
    
    return {
      totalViews: filtered.length,
      uniqueUsers: new Set(filtered.map(a => a.userId)).size,
      avgDuration: filtered.reduce((sum, a) => sum + (a.duration || 0), 0) / filtered.length,
      activities: filtered
    }
  }
})
```

**getActivityStats** - Get overall activity statistics
```javascript
export const getActivityStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, { startDate, endDate }) => {
    const activities = await ctx.db.query("userActivity").collect()
    
    // Filter by date range
    let filtered = activities
    if (startDate) {
      filtered = filtered.filter(a => a.timestamp >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter(a => a.timestamp <= endDate)
    }
    
    // Calculate stats
    const stats = {
      totalActivities: filtered.length,
      uniqueUsers: new Set(filtered.map(a => a.userId)).size,
      uniqueSessions: new Set(filtered.map(a => a.sessionId)).size,
      pageViews: filtered.filter(a => a.activityType === 'page_view').length,
      actions: filtered.filter(a => a.activityType === 'action').length,
      
      // Top pages
      topPages: Object.entries(
        filtered.reduce((acc, a) => {
          acc[a.page] = (acc[a.page] || 0) + 1
          return acc
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 10),
      
      // Device breakdown
      deviceBreakdown: filtered.reduce((acc, a) => {
        acc[a.deviceType] = (acc[a.deviceType] || 0) + 1
        return acc
      }, {}),
      
      // Browser breakdown
      browserBreakdown: filtered.reduce((acc, a) => {
        acc[a.browser] = (acc[a.browser] || 0) + 1
        return acc
      }, {})
    }
    
    return stats
  }
})
```

#### Mutations

**trackActivity** - Record user activity
```javascript
export const trackActivity = mutation({
  args: {
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    activityType: v.string(),
    actionType: v.optional(v.string()),
    page: v.string(),
    previousPage: v.optional(v.string()),
    actionData: v.optional(v.any()),
    deviceInfo: v.object({
      deviceType: v.string(),
      browser: v.string(),
      os: v.string(),
      screenResolution: v.optional(v.string())
    }),
    referrer: v.optional(v.string()),
    duration: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Insert activity record
    await ctx.db.insert("userActivity", {
      ...args,
      deviceType: args.deviceInfo.deviceType,
      browser: args.deviceInfo.browser,
      os: args.deviceInfo.os,
      screenResolution: args.deviceInfo.screenResolution,
      timestamp: new Date().toISOString(),
      isAnonymized: !args.userId
    })
    
    // Update or create active session
    const existingSession = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .unique()
    
    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        currentPage: args.page,
        lastActivity: new Date().toISOString(),
        pageViews: existingSession.pageViews + (args.activityType === 'page_view' ? 1 : 0),
        actionsCount: existingSession.actionsCount + (args.activityType === 'action' ? 1 : 0),
        sessionDuration: Date.now() - new Date(existingSession.sessionStart).getTime(),
        isActive: true
      })
    } else {
      await ctx.db.insert("activeSessions", {
        sessionId: args.sessionId,
        userId: args.userId,
        currentPage: args.page,
        lastActivity: new Date().toISOString(),
        deviceType: args.deviceInfo.deviceType,
        browser: args.deviceInfo.browser,
        os: args.deviceInfo.os,
        pageViews: args.activityType === 'page_view' ? 1 : 0,
        actionsCount: args.activityType === 'action' ? 1 : 0,
        sessionStart: new Date().toISOString(),
        sessionDuration: 0,
        isActive: true
      })
    }
    
    return { success: true }
  }
})
```

**cleanupInactiveSessions** - Mark sessions as inactive
```javascript
export const cleanupInactiveSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const inactiveSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect()
    
    for (const session of inactiveSessions) {
      if (session.lastActivity < fiveMinutesAgo) {
        await ctx.db.patch(session._id, { isActive: false })
      }
    }
    
    return { success: true }
  }
})
```

### 4. Admin Dashboard Components

#### Analytics Dashboard Page
**Location**: `app/admin/analytics/page.jsx`

**Sections**:
1. **Overview Cards**: Active users, total sessions, page views, actions
2. **Real-time Activity Feed**: Live stream of user actions
3. **Active Users List**: Table showing current active users and their pages
4. **Activity Charts**: Visualizations of activity over time
5. **Top Pages**: Most visited pages
6. **User Journey**: Flow diagram of user navigation
7. **Filters**: Date range, user type, activity type

#### ActiveUsersList Component
**Location**: `components/admin/ActiveUsersList.jsx`

**Features**:
- Real-time list of active users
- Shows current page, device, location
- Click to view detailed user activity
- Auto-updates every 10 seconds

#### ActivityFeed Component
**Location**: `components/admin/ActivityFeed.jsx`

**Features**:
- Live stream of recent activities
- Filterable by activity type
- Shows user, action, page, timestamp
- Auto-scrolls to show latest

#### UserActivityModal Component
**Location**: `components/admin/UserActivityModal.jsx`

**Features**:
- Detailed view of single user's activity
- Timeline of all actions
- Session information
- Device and location data

## Data Models

### Session Identification

**Session ID Generation**:
```javascript
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

**Storage**: SessionStorage for persistence across page navigations within same tab

### Device Detection

```javascript
const getDeviceInfo = () => {
  const ua = navigator.userAgent
  
  return {
    deviceType: /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop',
    browser: detectBrowser(ua),
    os: detectOS(ua),
    screenResolution: `${window.screen.width}x${window.screen.height}`
  }
}
```

## Error Handling

### Scenarios and Solutions

1. **Tracking Failure**
   - Fallback: Log error, continue without tracking
   - Don't block user experience
   - Retry failed tracking requests

2. **Session Storage Unavailable**
   - Fallback: Use in-memory session ID
   - Generate new session ID on each page load

3. **Network Issues**
   - Queue tracking events locally
   - Send in batch when connection restored
   - Implement exponential backoff

4. **Privacy Opt-out**
   - Respect user preferences
   - Only track anonymized data
   - Provide clear opt-out mechanism

## Testing Strategy

### Unit Testing

1. **Tracking Hook**
   - Test activity recording
   - Test session management
   - Test device detection

2. **Convex Queries**
   - Test data retrieval
   - Test filtering and aggregation
   - Test real-time updates

3. **Dashboard Components**
   - Test data display
   - Test filtering
   - Test real-time updates

### Integration Testing

1. **End-to-End Tracking**
   - User navigates pages → activities recorded
   - User performs actions → actions tracked
   - Admin views dashboard → data displayed

2. **Real-time Updates**
   - User activity → dashboard updates immediately
   - Session expires → removed from active list

### Performance Testing

1. **High Volume**
   - Test with 1000+ concurrent users
   - Measure query performance
   - Optimize indexes

2. **Data Retention**
   - Test with 30+ days of data
   - Measure query performance
   - Implement data archiving

## Implementation Notes

### Privacy Considerations

1. **Data Minimization**: Only collect necessary data
2. **Anonymization**: Hash IP addresses, anonymize sensitive data
3. **Opt-out**: Provide clear opt-out mechanism
4. **Retention**: Auto-delete data after 30 days
5. **Compliance**: Follow GDPR, CCPA guidelines

### Performance Optimization

1. **Batching**: Batch tracking requests to reduce network calls
2. **Indexing**: Proper indexes on frequently queried fields
3. **Caching**: Cache aggregated stats for dashboard
4. **Pagination**: Paginate large result sets
5. **Cleanup**: Regular cleanup of old sessions and data

### Security

1. **Admin-only Access**: Require admin authentication for dashboard
2. **Data Sanitization**: Sanitize all user input
3. **Rate Limiting**: Limit tracking requests to prevent abuse
4. **Encryption**: Encrypt sensitive data at rest

## Design Decisions and Rationales

### Why Convex for Activity Tracking?

Convex provides:
- Real-time subscriptions for live updates
- Efficient querying with indexes
- Built-in authentication
- Serverless scaling

### Why Session-based Tracking?

Session-based tracking provides:
- Better privacy (no persistent cookies)
- Accurate session metrics
- Easy cleanup of old data
- Compliance with privacy regulations

### Why Separate activeSessions Table?

Separating active sessions allows:
- Fast queries for active users
- Efficient cleanup of inactive sessions
- Real-time dashboard updates
- Reduced query complexity

### Why 5-Minute Activity Threshold?

5 minutes provides:
- Reasonable definition of "active"
- Balance between accuracy and performance
- Industry standard for analytics
- Prevents false positives from idle tabs
