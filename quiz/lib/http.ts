import { NextResponse } from "next/server";

export const ok = (data: unknown) => NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export const cleanName = (v: unknown) =>
  typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, 40) : "";
