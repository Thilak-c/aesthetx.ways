"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({ error, reset }) {
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error to console for debugging
    console.error("Application Error:", error);
  }, [error]);

  const debugInfo = {
    timestamp: new Date().toISOString(),
    error: error?.message || "Unknown error",
    stack: error?.stack || "No stack trace available",
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
  };

  const copyDebugInfo = () => {
    const debugText = `
Error Report
============
Time: ${debugInfo.timestamp}
URL: ${debugInfo.url}
Error: ${debugInfo.error}

Stack Trace:
${debugInfo.stack}

User Agent:
${debugInfo.userAgent}
    `.trim();

    navigator.clipboard.writeText(debugText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6"
      >
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Oops! Something Went Wrong
          </h1>
          <p className="text-gray-600 text-lg">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        {/* Error Details (Collapsible) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between text-left"
          >
            <span className="font-medium text-gray-700">
              {showDebug ? "Hide" : "Show"} Debug Information
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showDebug ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showDebug && (
            <div className="p-4 bg-gray-900 text-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-gray-400">Time:</span>{" "}
                    <span className="text-green-400">{debugInfo.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">URL:</span>{" "}
                    <span className="text-blue-400 break-all">{debugInfo.url}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Error:</span>{" "}
                    <span className="text-red-400">{debugInfo.error}</span>
                  </div>
                </div>
                <button
                  onClick={copyDebugInfo}
                  className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Stack Trace:</p>
                <pre className="text-xs text-gray-300 overflow-x-auto max-h-40 overflow-y-auto">
                  {debugInfo.stack}
                </pre>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  💡 Tip: Screenshot this information and send it to support
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-900 transition-colors text-center"
            >
              Go Home
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Error ID for reference */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Error ID: {debugInfo.timestamp.replace(/[^0-9]/g, "").slice(0, 12)}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
