"use client";

import { getAuthToken } from "@/stores/authStore";
import { getVendorToken } from "@/stores/vendorAuthStore";

// Consistent error type so UI can show friendly messages.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

type AuthMode = "student" | "vendor" | "none";

interface RequestOpts {
  method?: string;
  body?: unknown;
  auth?: AuthMode;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOpts["query"]): string {
  const url = path.startsWith("/api") ? path : `/api${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function apiFetch<T>(
  path: string,
  opts: RequestOpts = {}
): Promise<T> {
  const { method = "GET", body, auth = "none", query } = opts;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth === "student") {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } else if (auth === "vendor") {
    const token = getVendorToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Network error. Check your connection and try again.",
      0
    );
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }

  if (!res.ok || !json?.success) {
    const message =
      json?.error?.message || `Something went wrong (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return json.data as T;
}
