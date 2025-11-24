"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FiUsers, FiActivity, FiEye, FiMousePointer } from "react-icons/fi";
import Link from "next/link";

// Animated Number Component
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = Math.max(1, Math.floor(duration / (value || 1)));
    const timer = setInterval(() => {
      start += Math.ceil((value || 0) / (duration / stepTime));
      if (start >= value) {
        start = value;
        clearInterval(timer);
      }
      setDisplayValue(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return displayValue.toLocaleString();
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("today");
  const [activityFilter, setActivityFilter] = useState("all");

  // Fetch data
  const activeUsersData = useQuery(api.analytics.getActiveUsers);
  const activityStats = useQuery(api.analytics.getActivityStats, {});
  const recentActivities = useQuery(api.analytics.getRecentActivities, { 
    limit: 50,
    activityType: activityFilter === "all" ? undefined : activityFilter
  });

  const activeUsers = activeUsersData?.count || 0;
  const totalSessions = activityStats?.uniqueSessions || 0;
  const pageViews = activityStats?.pageViews || 0;
  const actions = activityStats?.actions || 0;

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900 p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time user activity monitoring</p>
        </div>
        <Link
          href="/admin/analytics/map"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          View Map
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Active Users" 
          value={activeUsers} 
          icon={<FiUsers size={24} />}
          color="bg-blue-500"
        />
        <StatsCard 
          title="Total Sessions" 
          value={totalSessions} 
          icon={<FiActivity size={24} />}
          color="bg-green-500"
        />
        <StatsCard 
          title="Page Views" 
          value={pageViews} 
          icon={<FiEye size={24} />}
          color="bg-purple-500"
        />
        <StatsCard 
          title="Actions" 
          value={actions} 
          icon={<FiMousePointer size={24} />}
          color="bg-orange-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Active Users List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Active Users</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeUsersData?.sessions?.length > 0 ? (
              activeUsersData.sessions.map((session) => {
                // Debug: log session data
                console.log('Session data:', { city: session.city, country: session.country });
                return (
                <Link
                  key={session._id}
                  href={`/admin/analytics/user/${session.sessionId}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {session.user ? session.user.name : 'GUEST'}
                      </p>
                      {session.user && (
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      )}
                      {session.city && (
                        <p className="text-xs text-blue-600 font-medium">
                          📍 {session.city}, {session.country} {session.postal && `- ${session.postal}`}
                        </p>
                      )}
                      {!session.city && (
                        <p className="text-xs text-gray-400">📍 Location unknown</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{session.currentPage}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {session.deviceType}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {session.browser}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {Math.floor(session.sessionDuration / 1000 / 60)}m
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.pageViews} views
                      </p>
                    </div>
                  </div>
                </Link>
              )})
            ) : (
              <p className="text-gray-500 text-center py-8">No active users</p>
            )}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Pages</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityStats?.topPages?.length > 0 ? (
              activityStats.topPages.map(([page, count], index) => (
                <div 
                  key={page} 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{page}</p>
                      <p className="text-xs text-gray-500">{count} views</p>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(count / activityStats.topPages[0][1]) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Activities</option>
            <option value="page_view">Page Views</option>
            <option value="action">Actions</option>
            <option value="event">Events</option>
          </select>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentActivities?.length > 0 ? (
            recentActivities.map((activity) => (
              <div 
                key={activity._id} 
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.activityType === 'page_view' ? 'bg-blue-500' :
                  activity.activityType === 'action' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {activity.user ? activity.user.name : 'GUEST'}
                    </span>
                    {activity.city && (
                      <span className="text-xs text-blue-600">
                        📍 {activity.city}{activity.postal && ` - ${activity.postal}`}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {activity.activityType === 'page_view' ? 'viewed' : 
                       activity.activityType === 'action' ? 'performed' : 'triggered'}
                    </span>
                    {activity.actionType && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {activity.actionType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{activity.page}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activity.deviceType}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          )}
        </div>
      </div>

      {/* Device & Browser Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Device Breakdown</h2>
          <div className="space-y-3">
            {activityStats?.deviceBreakdown && Object.entries(activityStats.deviceBreakdown).map(([device, count]) => (
              <div key={device} className="flex items-center justify-between">
                <span className="text-sm capitalize">{device}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(count / activityStats.totalActivities) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Browser Breakdown</h2>
          <div className="space-y-3">
            {activityStats?.browserBreakdown && Object.entries(activityStats.browserBreakdown).map(([browser, count]) => (
              <div key={browser} className="flex items-center justify-between">
                <span className="text-sm">{browser}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${(count / activityStats.totalActivities) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon, color }) {
  return (
    <div className="p-6 rounded-xl shadow-md bg-white transform hover:scale-105 transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`${color} text-white p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}
