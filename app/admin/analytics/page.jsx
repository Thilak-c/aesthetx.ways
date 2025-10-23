"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ReportsDashboard from "@/components/admin/ReportsDashboard";

const getSessionToken = () => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const token = getSessionToken();
  const adminUser = useQuery(api.users.adminMeByToken, token ? { token } : "skip");

  if (adminUser === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminUser || !token) {
    return null; // Layout will handle redirect
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate insights and reports for your business data
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboard"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "templates"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "scheduled"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Scheduled
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <ReportsDashboard
        adminUser={adminUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}