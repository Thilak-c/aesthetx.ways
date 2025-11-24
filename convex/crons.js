import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup every minute to mark inactive sessions
crons.interval(
  "cleanup inactive sessions",
  { minutes: 1 }, // Run every 1 minute
  internal.analytics.cleanupInactiveSessionsInternal
);

export default crons;
