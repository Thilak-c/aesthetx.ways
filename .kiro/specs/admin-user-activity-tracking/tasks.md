# Implementation Plan

- [x] 1. Set up Convex schema for activity tracking
  - Add `userActivity` table to `convex/schema.js` with all required fields and indexes
  - Add `activeSessions` table to `convex/schema.js` with session tracking fields
  - Ensure proper indexing for efficient queries (by_user, by_session, by_timestamp, etc.)
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4_

- [x] 2. Create Convex queries and mutations for activity tracking
  - Implement `trackActivity` mutation in `convex/analytics.js` to record user activities
  - Implement `getActiveUsers` query to fetch currently active users
  - Implement `getUserActivity` query to get activity history for specific user
  - Implement `getPageAnalytics` query for page-specific analytics
  - Implement `getActivityStats` query for overall statistics
  - Implement `cleanupInactiveSessions` mutation to mark inactive sessions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Create client-side activity tracking hook
  - Create `hooks/useActivityTracker.js` with tracking functions
  - Implement session ID generation and storage in sessionStorage
  - Implement device detection (mobile, tablet, desktop)
  - Implement browser and OS detection
  - Implement `trackPageView`, `trackAction`, and `trackEvent` functions
  - Add error handling and retry logic for failed tracking requests
  - Implement privacy opt-out mechanism
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4_

- [x] 4. Integrate activity tracking into application
  - Create `components/PageViewTracker.jsx` to automatically track page views
  - Add PageViewTracker to root layout or LayoutWrapper
  - Add tracking to product view pages (track product_view action)
  - Add tracking to cart operations (add_to_cart, remove_from_cart)
  - Add tracking to wishlist operations (add_to_wishlist)
  - Add tracking to search functionality
  - Add tracking to purchase completion
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2_

- [x] 5. Create admin analytics dashboard page
  - Create `app/admin/analytics/page.jsx` with admin authentication check
  - Implement overview cards showing active users, sessions, page views, actions
  - Add real-time data updates using Convex subscriptions
  - Implement date range filters for historical data
  - Add activity type filters (page_view, action, event)
  - Display top pages and popular routes
  - Show device and browser breakdown charts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [ ] 6. Create active users list component
  - Create `components/admin/ActiveUsersList.jsx` component
  - Display table of currently active users with real-time updates
  - Show user info, current page, device type, session duration
  - Add click handler to view detailed user activity
  - Implement auto-refresh every 10 seconds
  - Add sorting and filtering capabilities
  - _Requirements: 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Create activity feed component
  - Create `components/admin/ActivityFeed.jsx` for live activity stream
  - Display recent activities in real-time with auto-scroll
  - Show user, action type, page, timestamp for each activity
  - Implement activity type filtering (all, page_view, action, event)
  - Add user filtering to show activities for specific user
  - Style activities with icons and colors based on type
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3, 5.4_

- [ ] 8. Create user activity detail modal
  - Create `components/admin/UserActivityModal.jsx` for detailed user view
  - Display complete activity timeline for selected user
  - Show session information (device, browser, location, duration)
  - Display activity statistics (page views, actions, session duration)
  - Add filtering by activity type and date range
  - Implement export functionality for user activity data
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 6.4_

- [ ] 9. Implement session cleanup and data retention
  - Create scheduled job or cron function to run `cleanupInactiveSessions` periodically
  - Implement data archiving for activities older than 30 days
  - Add mutation to permanently delete old archived data
  - Implement data export functionality before deletion
  - _Requirements: 6.1, 6.2, 7.1, 7.2_

- [x] 10. Add analytics navigation to admin dashboard
  - Update `app/admin/page.jsx` to include Analytics link in navigation
  - Add analytics icon and card to admin dashboard
  - Ensure proper routing to `/admin/analytics` page
  - Add analytics to admin sidebar if one exists
  - _Requirements: 5.1, 5.2_

- [ ]* 11. Add privacy and compliance features
  - Implement user opt-out mechanism for detailed tracking
  - Add IP address hashing for privacy
  - Create privacy policy section explaining data collection
  - Implement GDPR/CCPA compliance features (data export, deletion)
  - Add admin settings for data retention period
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 12. Performance optimization and testing
  - Add indexes to optimize frequent queries
  - Implement query result caching for dashboard stats
  - Add pagination for large activity lists
  - Test with high volume of concurrent users (load testing)
  - Optimize real-time subscription performance
  - Test data retention and cleanup processes
  - _Requirements: 1.5, 5.5, 6.5_
