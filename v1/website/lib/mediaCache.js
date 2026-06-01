// A premium media caching utility that handles both IndexedDB (for large videos)
// and localStorage (for fast product image access).

const DB_NAME = 'AesthetxMediaCache';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('Not in browser');
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Caches a video file in IndexedDB to bypass 5MB localStorage limits
export async function getCachedVideo(url) {
  // Bypass caching; return the original URL directly.
  return url;
}

// Caches a product image in localStorage as a Base64 string for instant loading
export function getCachedImage(itemId, imageUrl) {
  // Bypass caching; return the original URL directly.
  return imageUrl;
}
