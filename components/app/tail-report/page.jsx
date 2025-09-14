"use client";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export default function TailReportPage() {
  const submitReport = useMutation(api.reports.submitReport);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate file preview
  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter a report.");

    setLoading(true);

    let fileUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-2", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      fileUrl = data.url;
    }

    const userId = localStorage.getItem("visitorId") || "anonymous";

    await submitReport({ userId, message, fileUrl });

    setSubmitted(true);
    setMessage("");
    setFile(null);
    setLoading(false);

    // Auto-hide success after 4s
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <img src="/logo.png" className="absolute w--full" alt="" />
      <div className="w-full max-w-lg bg-white/20 rounded-3xl backdrop-blur-[4px]  shadow-2xl p-10 relative">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-3 text-center">
          Report an Issue
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Found something wrong? Let us know and attach a file if needed.
        </p>

        {/* Success popup */}
        {submitted && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-6 py-3 rounded-xl shadow-lg animate-fadeIn">
            Thank you! Your report has been submitted successfully.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue..."
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 h-36 resize-none shadow-sm transition"
            required
          />

          {/* File upload */}
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition text-gray-500">
            {file ? (
              <span className="mb-2">{file.name}</span>
            ) : (
              <span>Attach a file (optional)</span>
            )}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          {/* Preview */}
          {filePreview && (
            <div className="border border-gray-300 rounded-xl overflow-hidden max-h-64 mb-2">
              <img
                src={filePreview}
                alt="Preview"
                className="w-full object-contain"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-lg transition shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Your feedback helps us improve the website.
        </p>
      </div>
    </div>
  );
}
