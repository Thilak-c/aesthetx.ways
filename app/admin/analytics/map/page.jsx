"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FiArrowLeft, FiMapPin } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function UserMapPage() {
    const router = useRouter();
    const activeUsersData = useQuery(api.analytics.getActiveUsers);
    const [locationCounts, setLocationCounts] = useState({});

    useEffect(() => {
        if (activeUsersData?.sessions) {
            // Count users by location
            const counts = {};
            activeUsersData.sessions.forEach(session => {
                if (session.city && session.country) {
                    const location = `${session.city}, ${session.country}`;
                    counts[location] = (counts[location] || 0) + 1;
                }
            });
            setLocationCounts(counts);
        }
    }, [activeUsersData]);

    const totalUsers = activeUsersData?.count || 0;
    const locationsArray = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);

    return (
        <div className="min-h-screen w-full bg-gray-100 text-gray-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <FiArrowLeft /> Back to Analytics
                </button>
                <h1 className="text-3xl font-bold mb-2">User Location Map</h1>
                <p className="text-gray-600">Real-time view of where your users are browsing from</p>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Active Users</p>
                        <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Unique Locations</p>
                        <p className="text-3xl font-bold text-green-600">{locationsArray.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Most Popular</p>
                        <p className="text-xl font-bold text-purple-600">
                            {locationsArray[0]?.[0] || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Visualization */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Geographic Distribution</h2>

                    {/* Simple World Map Representation */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                            {/* Decorative world map background */}
                            <svg className="w-full h-full opacity-10" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                                <path d="M 100 250 Q 250 150, 400 250 T 700 250 Q 850 350, 900 250"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    className="text-blue-600" />
                                <circle cx="200" cy="200" r="3" fill="currentColor" className="text-blue-600" />
                                <circle cx="400" cy="250" r="3" fill="currentColor" className="text-blue-600" />
                                <circle cx="600" cy="220" r="3" fill="currentColor" className="text-blue-600" />
                                <circle cx="800" cy="280" r="3" fill="currentColor" className="text-blue-600" />
                            </svg>
                        </div>

                        {/* Location Pins */}
                        <div className="relative z-10 w-full">
                            {locationsArray.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {locationsArray.map(([location, count], index) => (
                                        <div
                                            key={location}
                                            className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border-2 border-blue-200 hover:border-blue-400 transition transform hover:scale-105"
                                        >
                                            <div className="flex items-start gap-2">
                                                <FiMapPin className="text-red-500 mt-1 flex-shrink-0" size={20} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{location}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {count} {count === 1 ? 'user' : 'users'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Pulse animation for active locations */}
                                            <div className="mt-2">
                                                <div className="flex gap-1">
                                                    {[...Array(Math.min(count, 5))].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                                                            style={{ animationDelay: `${i * 200}ms` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <FiMapPin size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No active users with location data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location List */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Locations</h2>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {locationsArray.length > 0 ? (
                            locationsArray.map(([location, count], index) => {
                                const [city, country] = location.split(', ');
                                return (
                                    <div
                                        key={location}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-400">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-sm">{city}</p>
                                                    <p className="text-xs text-gray-500">{country}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-600">{count}</p>
                                                <p className="text-xs text-gray-500">
                                                    {count === 1 ? 'user' : 'users'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                                style={{
                                                    width: `${(count / totalUsers) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-center py-8">No location data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* User Details by Location */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Users by Location</h2>
                <div className="space-y-4">
                    {locationsArray.map(([location]) => {
                        const usersInLocation = activeUsersData?.sessions.filter(
                            s => s.city && s.country && `${s.city}, ${s.country}` === location
                        ) || [];

                        return (
                            <div key={location} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FiMapPin className="text-red-500" />
                                    {location}
                                    <span className="text-sm text-gray-500">
                                        ({usersInLocation.length} {usersInLocation.length === 1 ? 'user' : 'users'})
                                    </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {usersInLocation.map((session) => (
                                        <div
                                            key={session._id}
                                            className="p-3 bg-gray-50 rounded-lg text-sm"
                                        >
                                            <p className="font-medium">
                                                {session.user ? session.user.name : 'GUEST'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {session.currentPage}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs bg-white px-2 py-1 rounded">
                                                    {session.deviceType}
                                                </span>
                                                <span className="text-xs bg-white px-2 py-1 rounded">
                                                    {session.browser}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
