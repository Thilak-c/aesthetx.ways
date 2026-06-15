import { convexClient } from "./convex";

// Helper to generate a random session ID
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Manage the session ID and handle inactive timeout (30 mins)
export function getOrCreateSession() {
  if (typeof window === 'undefined') return { sessionId: '', isNew: false };

  const now = Date.now();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes in ms

  let sessionId = sessionStorage.getItem('aw_session_id');
  let isNew = false;

  const storedSessionId = localStorage.getItem('aw_session_id');
  const storedExpiry = localStorage.getItem('aw_session_expiry');

  if (sessionId) {
    // Session is active in current tab, refresh rolling expiry in localStorage
    localStorage.setItem('aw_session_expiry', (now + sessionTimeout).toString());
  } else if (storedSessionId && storedExpiry && parseInt(storedExpiry, 10) > now) {
    // Reuse session from other tabs because it hasn't expired yet
    sessionId = storedSessionId;
    sessionStorage.setItem('aw_session_id', sessionId);
    localStorage.setItem('aw_session_expiry', (now + sessionTimeout).toString());
  } else {
    // No session or session expired, generate a new one
    sessionId = generateSessionId();
    isNew = true;
    sessionStorage.setItem('aw_session_id', sessionId);
    localStorage.setItem('aw_session_id', sessionId);
    localStorage.setItem('aw_session_expiry', (now + sessionTimeout).toString());
  }

  return { sessionId, isNew };
}

// Helper to extract device type
function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Helper to parse browser and OS
function getBrowserAndOS() {
  if (typeof window === 'undefined') return { browser: 'unknown', os: 'unknown' };
  const ua = navigator.userAgent;
  let browser = 'other';
  let os = 'other';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Trident')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'MacOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

// Resolve approximate location (with local caching in sessionStorage)
async function getGeoLocation() {
  if (typeof window === 'undefined') return { country: 'Unknown', city: 'Unknown', postal: 'Unknown', latitude: undefined, longitude: undefined, ipAddress: '' };

  const cachedGeo = sessionStorage.getItem('aw_location');
  if (cachedGeo) {
    try {
      return JSON.parse(cachedGeo);
    } catch (_) {}
  }

  try {
    const res = await fetch('/api/analytics/location');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const geoInfo = {
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
          postal: data.postal || 'Unknown',
          latitude: data.latitude,
          longitude: data.longitude,
          ipAddress: data.ipAddress || '',
        };
        sessionStorage.setItem('aw_location', JSON.stringify(geoInfo));
        return geoInfo;
      }
    }
  } catch (err) {
    console.error('Failed to resolve visitor geolocation:', err);
  }

  return { country: 'Unknown', city: 'Unknown', postal: 'Unknown', latitude: undefined, longitude: undefined, ipAddress: '' };
}

// Parse UTM query parameters from the URL
function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

// Main event tracker function
export async function trackEvent(activityType, actionType = undefined, actionData = undefined) {
  if (typeof window === 'undefined') return;

  try {
    const { sessionId } = getOrCreateSession();
    
    // Resolve user ID if authenticated
    let userId = undefined;
    const userStr = localStorage.getItem('aw_user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.loggedIn && userObj.id) {
          userId = userObj.id; // Convex User ID (valid id("users") type)
        }
      } catch (_) {}
    }

    // Resolve location
    const geo = await getGeoLocation();

    // Parse technical parameters
    const { browser, os } = getBrowserAndOS();
    const deviceType = getDeviceType();
    const screenResolution = `${window.screen.width}x${window.screen.height}`;

    // Acquisition parameters
    const utm = getUtmParams();
    const referrer = document.referrer || 'direct';
    let referrerDomain = undefined;
    if (referrer !== 'direct') {
      try {
        referrerDomain = new URL(referrer).hostname;
      } catch (_) {}
    }

    const payload = {
      userId,
      sessionId,
      activityType,
      actionType,
      page: window.location.pathname + window.location.search,
      previousPage: sessionStorage.getItem('aw_previous_page') || undefined,
      actionData,
      deviceType,
      browser,
      os,
      screenResolution,
      country: geo.country,
      city: geo.city,
      postal: geo.postal,
      latitude: geo.latitude,
      longitude: geo.longitude,
      ipAddress: geo.ipAddress,
      referrer,
      referrerDomain,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      timestamp: new Date().toISOString(),
      isAnonymized: false,
    };

    // Cache current page as previous page for next navigation event
    sessionStorage.setItem('aw_previous_page', payload.page);

    // Write directly to Convex
    await convexClient.mutation("analytics:recordActivity", payload);
  } catch (error) {
    console.error('Failed to log analytics activity:', error);
  }
}
