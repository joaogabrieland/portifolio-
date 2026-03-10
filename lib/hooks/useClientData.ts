'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchClientData, saveClientData } from '@/lib/clients-api';

// Global save queue — ensures unmount flushes complete before the next mount fetch
const pendingSaves = new Map<string, Promise<void>>();

// Global data cache — prevents redundant fetches across mount/unmount cycles
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60_000; // 60 seconds — data younger than this is served from cache

// Track in-flight fetches to prevent duplicate concurrent requests
const inflightFetches = new Map<string, Promise<unknown>>();

function getSaveKey(clientId: string, dataType: string) {
  return `${clientId}:${dataType}`;
}

/**
 * Hook to load and persist per-client sub-data (kanban, agenda, etc.) via API.
 * Replaces direct localStorage read/write with debounced API calls.
 *
 * Features:
 * - Global data cache: re-mounting a component uses cached data instantly (no flash)
 * - Deduplicates in-flight fetches: multiple hooks for same key share one request
 * - Waits for any pending save to complete before fetching on mount
 * - Properly handles empty arrays as valid data (not treated as "no data")
 * - Synchronous flush on unmount tracked globally to prevent race conditions
 */
export function useClientData<T>(
  clientId: string,
  dataType: string,
  fallback: T
): {
  data: T;
  setData: (newData: T | ((prev: T) => T)) => void;
  loading: boolean;
} {
  const key = getSaveKey(clientId, dataType);

  // Initialize from cache if available, otherwise use fallback
  const cached = dataCache.get(key);
  const initialData = (cached && cached.data !== undefined) ? cached.data as T : fallback;

  const [data, setDataState] = useState<T>(initialData);
  const [loading, setLoading] = useState(!cached); // not loading if cache hit
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<T>(initialData);
  const hasSavedRef = useRef(false);

  // Load data on mount — use cache if fresh, otherwise fetch
  useEffect(() => {
    const currentKey = getSaveKey(clientId, dataType);

    let cancelled = false;

    // Check cache freshness
    const cachedEntry = dataCache.get(currentKey);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
      // Cache is fresh — use it, skip fetch
      if (!hasSavedRef.current) {
        setDataState(cachedEntry.data as T);
        latestDataRef.current = cachedEntry.data as T;
      }
      setLoading(false);
      return () => { cancelled = true; };
    }

    setLoading(true);

    const load = async () => {
      // Wait for any pending save from a previous unmount
      const pending = pendingSaves.get(currentKey);
      if (pending) {
        await pending;
        pendingSaves.delete(currentKey);
      }

      try {
        // Deduplicate in-flight fetches for the same key
        let fetchPromise = inflightFetches.get(currentKey);
        if (!fetchPromise) {
          fetchPromise = fetchClientData<T>(clientId, dataType);
          inflightFetches.set(currentKey, fetchPromise);
          fetchPromise.finally(() => {
            // Only remove if this is still the active fetch
            if (inflightFetches.get(currentKey) === fetchPromise) {
              inflightFetches.delete(currentKey);
            }
          });
        }

        const result = await fetchPromise as T;

        if (!cancelled) {
          if (result !== null && result !== undefined) {
            if (!hasSavedRef.current) {
              setDataState(result);
              latestDataRef.current = result;
            }
            // Update global cache
            dataCache.set(currentKey, { data: result, timestamp: Date.now() });
          }
          setLoading(false);
        }
      } catch (err) {
        console.error(`useClientData(${dataType}) load error:`, err);
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [clientId, dataType]);

  // setData: optimistic update + debounced API save + cache update
  const setData = useCallback(
    (newDataOrFn: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const newData = typeof newDataOrFn === 'function'
          ? (newDataOrFn as (prev: T) => T)(prev)
          : newDataOrFn;

        latestDataRef.current = newData;
        hasSavedRef.current = true;

        // Update global cache immediately on mutation
        const currentKey = getSaveKey(clientId, dataType);
        dataCache.set(currentKey, { data: newData, timestamp: Date.now() });

        // Debounce API write
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const savePromise = saveClientData(clientId, dataType, latestDataRef.current).catch((err) => {
            console.error(`useClientData(${dataType}) save error:`, err);
          });
          pendingSaves.set(currentKey, savePromise);
          savePromise.then(() => {
            if (pendingSaves.get(currentKey) === savePromise) {
              pendingSaves.delete(currentKey);
            }
          });
        }, 300);

        return newData;
      });
    },
    [clientId, dataType]
  );

  // Cleanup debounce on unmount — flush pending save
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        // Only flush if data was actually modified
        if (hasSavedRef.current) {
          const currentKey = getSaveKey(clientId, dataType);
          const savePromise = saveClientData(clientId, dataType, latestDataRef.current).catch(() => {});
          pendingSaves.set(currentKey, savePromise);
          savePromise.then(() => {
            if (pendingSaves.get(currentKey) === savePromise) {
              pendingSaves.delete(currentKey);
            }
          });
        }
      }
    };
  }, [clientId, dataType]);

  return { data, setData, loading };
}
