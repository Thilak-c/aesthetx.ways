'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, getOrCreateSession } from '@/lib/analytics';
import { convexClient } from '@/lib/convex';

function TrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Log page view on pathname or query string change
  useEffect(() => {
    trackEvent('page_view');
  }, [pathname, searchParams]);

  // 2. Manage 30-second active session heartbeat
  useEffect(() => {
    const { sessionId } = getOrCreateSession();
    if (!sessionId) return;

    // Send heartbeat immediately on session initialization/load
    const sendHeartbeat = async () => {
      try {
        await convexClient.mutation('analytics:heartbeatSession', {
          sessionId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        // Fail silently in background
      }
    };
    sendHeartbeat();

    // Heartbeat loop every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
