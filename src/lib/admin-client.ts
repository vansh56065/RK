"use client";

/**
 * Client-side admin API helper with auto-retry.
 * Stores the session token in localStorage and includes it as a Bearer header
 * in all admin API requests. Auto-retries on network failure (server compiling).
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
 * Authenticated fetch with auto-retry.
 * Retries up to 3 times with 2s delay between attempts when the server
 * is unreachable (OOM during compilation). Returns null only if all
 * retries fail or the token is invalid.
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

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        clearAdminSession();
        return null;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return res.json();
    } catch (e) {
      if (e instanceof Error && (e.message === "Failed to fetch" || e.message.includes("fetch"))) {
        // Network error — server may be compiling. Wait and retry.
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return null;
      }
      throw e;
    }
  }
  return null;
}
