'use client';

import { useEffect } from 'react';

export default function ApiKeyInterceptor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

    window.fetch = async function (input, init) {
      let url = '';

      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else if (input && typeof input === 'object' && 'url' in input) {
        url = input.url;
      }

      // Check if it's a relative path starting with /api/ or an absolute path to /api/ of our own domain
      const isRelativeApi = url.startsWith('/api/') || url.startsWith('api/') || url.startsWith('./api/');
      const isAbsoluteApi = url.includes(window.location.host + '/api/');

      if (isRelativeApi || isAbsoluteApi) {
        if (input instanceof Request) {
          const headers = new Headers(input.headers);
          headers.set('x-api-key', apiKey);
          input = new Request(input, { headers });
        } else {
          init = init || {};
          init.headers = init.headers || {};

          if (init.headers instanceof Headers) {
            init.headers.set('x-api-key', apiKey);
          } else if (Array.isArray(init.headers)) {
            const hasKey = init.headers.some(([key]) => key.toLowerCase() === 'x-api-key');
            if (!hasKey) {
              init.headers.push(['x-api-key', apiKey]);
            }
          } else {
            init.headers['x-api-key'] = apiKey;
          }
        }
      }

      return originalFetch.call(this, input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
