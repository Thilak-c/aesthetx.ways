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
  if (typeof window === 'undefined') return url;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = async () => {
        if (request.result) {
          // Re-create object URL from cached Blob
          const objectUrl = URL.createObjectURL(request.result);
          resolve(objectUrl);
        } else {
          // Fetch and store
          fetch(url)
            .then(res => res.blob())
            .then(blob => {
              const writeTx = db.transaction(STORE_NAME, 'readwrite');
              const writeStore = writeTx.objectStore(STORE_NAME);
              writeStore.put(blob, url);
              resolve(URL.createObjectURL(blob));
            })
            .catch(err => {
              console.error('Failed to fetch video for caching:', err);
              resolve(url); // Fallback to raw network URL
            });
        }
      };
      request.onerror = () => resolve(url);
    });
  } catch (err) {
    console.error('IndexedDB error:', err);
    return url;
  }
}

// Caches a product image in localStorage as a Base64 string for instant loading
export function getCachedImage(itemId, imageUrl) {
  if (typeof window === 'undefined' || !imageUrl) return imageUrl;
  const cacheKey = `aw_img_cache_${itemId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return cached;
  }

  // Use proxy-image to bypass browser CORS limitations for third-party media sources
  const fetchUrl = imageUrl.startsWith('http')
    ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    : imageUrl;

  // Asynchronously fetch and store in localStorage
  fetch(fetchUrl)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          localStorage.setItem(cacheKey, reader.result);
        } catch (e) {
          // Quota exceeded: clear older image caches to make room
          console.warn('LocalStorage quota exceeded. Clearing older cached images.');
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aw_img_cache_')) {
              localStorage.removeItem(key);
            }
          }
          // Try saving again
          try {
            localStorage.setItem(cacheKey, reader.result);
          } catch (retryError) {
            console.error('Failed to store image in localStorage even after cleanup:', retryError);
          }
        }
      };
      reader.readAsDataURL(blob);
    })
    .catch(err => console.error('Failed to fetch image for caching:', err));

  return imageUrl;
}
