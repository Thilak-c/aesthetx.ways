import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Track user activity
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
    duration: v.optional(v.number()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    postal: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Insert activity record
    await ctx.db.insert("userActivity", {
      userId: args.userId,
      sessionId: args.sessionId,
      activityType: args.activityType,
      actionType: args.actionType,
      page: args.page,
      previousPage: args.previousPage,
      actionData: args.actionData,
      deviceType: args.deviceInfo.deviceType,
      browser: args.deviceInfo.browser,
      os: args.deviceInfo.os,
      screenResolution: args.deviceInfo.screenResolution,
      referrer: args.referrer,
      duration: args.duration,
      city: args.city,
      country: args.country,
      postal: args.postal,
      timestamp: new Date().toISOString(),
      isAnonymized: !args.userId
    });
    
    // Update or create active session
    const existingSession = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    
    if (existingSession) {
      // Update existing session
      const updateData = {
        currentPage: args.page,
        lastActivity: new Date().toISOString(),
        pageViews: existingSession.pageViews + (args.activityType === 'page_view' ? 1 : 0),
        actionsCount: existingSession.actionsCount + (args.activityType === 'action' ? 1 : 0),
        sessionDuration: Date.now() - new Date(existingSession.sessionStart).getTime(),
        isActive: true
      };
      
      // If user just logged in (session was anonymous, now has userId), update userId
      if (args.userId && !existingSession.userId) {
        updateData.userId = args.userId;
      }
      
      await ctx.db.patch(existingSession._id, updateData);
    } else {
      // Create new session
      await ctx.db.insert("activeSessions", {
        sessionId: args.sessionId,
        userId: args.userId,
        currentPage: args.page,
        lastActivity: new Date().toISOString(),
        deviceType: args.deviceInfo.deviceType,
        browser: args.deviceInfo.browser,
        os: args.deviceInfo.os,
        city: args.city,
        country: args.country,
        postal: args.postal,
        pageViews: args.activityType === 'page_view' ? 1 : 0,
        actionsCount: args.activityType === 'action' ? 1 : 0,
        sessionStart: new Date().toISOString(),
        sessionDuration: 0,
        isActive: true
      });
    }
    
    return { success: true };
  }
});

// Get active users
export const getActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const activeSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Filter by last activity time
    const recentlyActive = activeSessions.filter(
      session => session.lastActivity >= fiveMinutesAgo
    );
    
    // Fetch user data for each session
    const sessionsWithUsers = await Promise.all(
      recentlyActive.map(async (session) => {
        let userData = null;
        if (session.userId) {
          const user = await ctx.db.get(session.userId);
          if (user) {
            userData = {
              name: user.name || user.email,
              email: user.email
            };
          }
        }
        return {
          ...session,
          user: userData
        };
      })
    );
    
    return {
      count: sessionsWithUsers.length,
      sessions: sessionsWithUsers
    };
  }
});

// Get user activity history
export const getUserActivity = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
    activityType: v.optional(v.string())
  },
  handler: async (ctx, { userId, limit = 50, activityType }) => {
    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    if (activityType) {
      return activities.filter(a => a.activityType === activityType);
    }
    
    return activities;
  }
});

// Get page analytics
export const getPageAnalytics = query({
  args: { 
    page: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, { page, startDate, endDate }) => {
    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_page", (q) => q.eq("page", page))
      .collect();
    
    // Filter by date range if provided
    let filtered = activities;
    if (startDate) {
      filtered = filtered.filter(a => a.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(a => a.timestamp <= endDate);
    }
    
    const uniqueUsers = new Set(filtered.map(a => a.userId).filter(Boolean));
    const totalDuration = filtered.reduce((sum, a) => sum + (a.duration || 0), 0);
    
    return {
      totalViews: filtered.length,
      uniqueUsers: uniqueUsers.size,
      avgDuration: filtered.length > 0 ? totalDuration / filtered.length : 0,
      activities: filtered
    };
  }
});

// Get overall activity statistics
export const getActivityStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string())
  },
  handler: async (ctx, { startDate, endDate }) => {
    const activities = await ctx.db.query("userActivity").collect();
    
    // Filter by date range
    let filtered = activities;
    if (startDate) {
      filtered = filtered.filter(a => a.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(a => a.timestamp <= endDate);
    }
    
    const uniqueUsers = new Set(filtered.map(a => a.userId).filter(Boolean));
    const uniqueSessions = new Set(filtered.map(a => a.sessionId));
    
    // Top pages
    const pageCount = {};
    filtered.forEach(a => {
      pageCount[a.page] = (pageCount[a.page] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Device breakdown
    const deviceBreakdown = {};
    filtered.forEach(a => {
      deviceBreakdown[a.deviceType] = (deviceBreakdown[a.deviceType] || 0) + 1;
    });
    
    // Browser breakdown
    const browserBreakdown = {};
    filtered.forEach(a => {
      browserBreakdown[a.browser] = (browserBreakdown[a.browser] || 0) + 1;
    });
    
    return {
      totalActivities: filtered.length,
      uniqueUsers: uniqueUsers.size,
      uniqueSessions: uniqueSessions.size,
      pageViews: filtered.filter(a => a.activityType === 'page_view').length,
      actions: filtered.filter(a => a.activityType === 'action').length,
      topPages,
      deviceBreakdown,
      browserBreakdown
    };
  }
});

// Get recent activities (for activity feed)
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
    activityType: v.optional(v.string())
  },
  handler: async (ctx, { limit = 50, activityType }) => {
    let activities = await ctx.db
      .query("userActivity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    
    if (activityType) {
      activities = activities.filter(a => a.activityType === activityType);
    }
    
    // Fetch user data for each activity
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        let userData = null;
        if (activity.userId) {
          const user = await ctx.db.get(activity.userId);
          if (user) {
            userData = {
              name: user.name || user.email,
              email: user.email
            };
          }
        }
        return {
          ...activity,
          user: userData
        };
      })
    );
    
    return activitiesWithUsers;
  }
});

// Cleanup inactive sessions (public mutation)
export const cleanupInactiveSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const allSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    let cleanedCount = 0;
    for (const session of allSessions) {
      if (session.lastActivity < fiveMinutesAgo) {
        await ctx.db.patch(session._id, { isActive: false });
        cleanedCount++;
      }
    }
    
    return { success: true, cleanedCount };
  }
});

// Internal mutation for cron job
export const cleanupInactiveSessionsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const allSessions = await ctx.db
      .query("activeSessions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    let cleanedCount = 0;
    for (const session of allSessions) {
      if (session.lastActivity < fiveMinutesAgo) {
        await ctx.db.patch(session._id, { isActive: false });
        cleanedCount++;
      }
    }
    
    return { success: true, cleanedCount };
  }
});

// Get session details
export const getSessionDetails = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .unique();
    
    if (!session) {
      return null;
    }
    
    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
    
    return {
      session,
      activities,
      activityCount: activities.length
    };
  }
});
