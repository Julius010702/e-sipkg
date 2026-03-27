"use client";
// src/hooks/useFetch.ts

import { useState, useEffect, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  enabled?: boolean;        // false = jangan fetch otomatis
  refetchInterval?: number; // auto refresh setiap N ms
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

interface UseFetchReturn<T> extends FetchState<T> {
  refetch: () => Promise<void>;
  mutate: (newData: T) => void; // update local state tanpa fetch
}

// ── Main hook ──────────────────────────────────────────────────
export function useFetch<T = unknown>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null, loading: false, error: null,
  });

  const abortRef    = useRef<AbortController | null>(null);
  const mountedRef  = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; abortRef.current?.abort(); };
  }, []);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState((p) => ({ ...p, loading: true, error: null }));

    try {
      const res  = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!mountedRef.current) return;

      const data = json.data ?? json;
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (err) {
      if (!mountedRef.current) return;
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setState((p) => ({ ...p, loading: false, error: msg }));
      onError?.(msg);
    }
  }, [url, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch saat mount / url berubah
  useEffect(() => {
    if (enabled && url) fetchData();
  }, [url, enabled, fetchData]);

  // Auto refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled || !url) return;
    const id = setInterval(fetchData, refetchInterval);
    return () => clearInterval(id);
  }, [refetchInterval, enabled, url, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    mutate: (newData: T) => setState((p) => ({ ...p, data: newData })),
  };
}

// ── Paginated fetch ────────────────────────────────────────────
interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface UsePaginatedFetchReturn<T> {
  items: T[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  setSearch: (s: string) => void;
  refetch: () => void;
}

export function usePaginatedFetch<T = unknown>(
  baseUrl: string,
  extraParams?: Record<string, string>
): UsePaginatedFetchReturn<T> {
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch]     = useState("");
  const [trigger, setTrigger]   = useState(0);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(search && { search }),
    ...extraParams,
  });

  const url = `${baseUrl}?${params}`;

  const { data, loading, error } = useFetch<PaginatedData<T>>(url, {
    enabled: true,
  });

  return {
    items:    data?.data    ?? [],
    total:    data?.total   ?? 0,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    setSearch: (s: string) => { setSearch(s); setPage(1); },
    refetch:   () => setTrigger((p) => p + 1),
  };
}

// ── Mutation (POST/PUT/DELETE) ─────────────────────────────────
interface MutationOptions<TInput, TOutput> {
  url: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
}

interface UseMutationReturn<TInput, TOutput> {
  mutate: (body?: TInput) => Promise<TOutput | null>;
  loading: boolean;
  error: string | null;
  data: TOutput | null;
}

export function useMutation<TInput = unknown, TOutput = unknown>(
  options: MutationOptions<TInput, TOutput>
): UseMutationReturn<TInput, TOutput> {
  const { url, method = "POST", onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [data, setData]       = useState<TOutput | null>(null);

  const mutate = useCallback(
    async (body?: TInput): Promise<TOutput | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json();
        if (!json.success && !res.ok) throw new Error(json.message || `HTTP ${res.status}`);
        const result = json.data ?? json;
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { mutate, loading, error, data };
}