"use client";

/**
 * Client-side admin API helper.
 * Stores the session token in localStorage and includes it as a Bearer header
 * in all admin API requests. Falls back to the httpOnly cookie if present.
 */

const TOKEN_KEY = "rk_admin_token";
const ADMIN_KEY = "rk_admin";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdmin(): { id: string; email: string; name: string; role: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(ADMIN_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(admin: { id: string; email: string; name: string; role: string }, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Authenticated fetch for admin API calls.
 * Automatically adds the Authorization: Bearer header.
 * Returns null if unauthorized (caller should handle by showing login).
 */
export async function adminFetch<T = any>(url: string, options: RequestInit = {}): Promise<T | null> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // Token expired or invalid — clear session
      clearAdminSession();
      return null;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (e) {
    if (e instanceof Error && e.message === "Failed to fetch") {
      // Network error — server may be down
      return null;
    }
    throw e;
  }
}
