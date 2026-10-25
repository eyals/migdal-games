"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, body === undefined
    ? { cache: "no-store" }
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "שגיאה");
  return data as T;
}

// Polls a JSON endpoint. Returns the latest data and a function to refresh now.
export function usePoll<T>(path: string | null, ms = 1500) {
  const [data, setData] = useState<T | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  const refresh = useCallback(async () => {
    if (!pathRef.current) return;
    try {
      setData(await api<T>(pathRef.current));
    } catch {
      // Keep the last good state; the next poll will retry.
    }
  }, []);

  useEffect(() => {
    if (!path) return;
    refresh();
    const id = setInterval(refresh, ms);
    return () => clearInterval(id);
  }, [path, ms, refresh]);

  return [data, refresh] as const;
}
