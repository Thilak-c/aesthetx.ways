'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export function getToken() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  const m2 = document.cookie.match(/(?:^|; )token=([^;]+)/);
  return m2 ? decodeURIComponent(m2[1]) : null;
}

const handler = {
  get(target, tableName) {
    if (tableName === '_isProxy') return true;
    return new Proxy({}, {
      get(_, operationName) {
        return { __convexFn: true, table: tableName, operation: operationName };
      },
    });
  },
};

export const api = new Proxy({}, handler);

function resolveFn(ref) {
  if (ref && ref.__convexFn) return { table: ref.table, operation: ref.operation };
  return null;
}

let listeners = [];
let version = 0;
function notify() {
  version++;
  listeners.forEach(fn => fn(version));
}

export function useQuery(ref, args) {
  const resolved = resolveFn(ref);
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const shouldSkip = args === 'skip' || !resolved;
  const fetchKey = `${resolved?.table}:${resolved?.operation}:${JSON.stringify(args || {})}`;
  const seenVersion = useRef(version);

  const doFetch = useCallback(() => {
    if (shouldSkip || !resolved) {
      setData(undefined);
      return;
    }
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: resolved.table, operation: resolved.operation, args: args || {} }),
    })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Query failed'); });
        return res.json();
      })
      .then(result => setData(result))
      .catch(err => setError(err));
  }, [resolved?.table, resolved?.operation, shouldSkip, fetchKey]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    const handler = (v) => {
      if (v !== seenVersion.current) {
        seenVersion.current = v;
        doFetch();
      }
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter(fn => fn !== handler); };
  }, [doFetch]);

  if (error) throw error;
  return data;
}

export function useMutation(ref) {
  const resolved = resolveFn(ref);
  return useCallback(async (args) => {
    if (!resolved) throw new Error('Invalid mutation reference');
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: resolved.table, operation: resolved.operation, args: args || {} }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Mutation failed');
    notify();
    return data;
  }, [resolved?.table, resolved?.operation]);
}

export const useAction = useMutation;
