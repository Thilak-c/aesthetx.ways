"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ViewReportsPage() {
  const reports = useQuery(api.reports.getAllReports);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Submitted Reports
        </h1>

        {!reports ? (
          <p className="text-gray-500 text-center">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500 text-center">No reports submitted yet.</p>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report._id.toString()}
                className="bg-white shadow-md rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">
                    User: {report.userId}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 mb-3">{report.message}</p>
                {report.fileUrl && (
                  <div className="mt-2">
                    <img
                      src={report.fileUrl}
                      alt="Attached file"
                      className="max-h-64 w-full object-contain rounded-lg border"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
