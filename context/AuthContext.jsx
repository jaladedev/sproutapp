"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import api, { refreshAccessToken } from "../utils/api";
import { isAuthed, clearAuthedFlag } from "../utils/tokenStore";
import { resetNotificationCache } from "../services/notificationService";
import { PUBLIC_ROUTES, isPublicRoute } from "../utils/routes";

export const AuthContext = createContext(null);

// ── Constants ─────────────────────────────────────────────────────────────────

const REFRESH_MARGIN_MS = 5 * 60 * 1000; // refresh 5 min before expiry
const MIN_REFRESH_DELAY_MS = 5 * 1000;   // avoid rapid-fire refresh loops

// ── Provider ──────────────────────────────────────────────────────────────────
//
// httpOnly cookie migration: the API now owns auth_token/user_role as
// httpOnly cookies (set via Set-Cookie on /login, /refresh, cleared on
// /logout) — this file never reads or writes the token itself. It only
// checks the non-sensitive `is_authed` flag cookie to know whether a
// session exists, and relies on the API returning `expires_at` (epoch ms)
// in the /login, /refresh, and /me response bodies so proactive refresh
// can still be scheduled without decoding a JWT client-side. See
// utils/tokenStore.ts for the full backend contract this depends on.

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const router       = useRouter();
  const pathname      = usePathname();
  const refreshTimer = useRef(null);
  const queryClient  = useQueryClient();

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  // ── scheduleProactiveRefresh ────────────────────────────────────────────
  // Schedules a refresh ~5 min before the session's expiry (as told to us
  // by the API), so long-lived forms (KYC, PIN setup, etc.) don't get cut
  // off mid-flow waiting for a reactive 401 refresh.

  const scheduleProactiveRefresh = useCallback(
    (expiresAtMs) => {
      clearRefreshTimer();

      if (!expiresAtMs) return; // API didn't tell us an expiry — skip

      const delay = Math.max(
        expiresAtMs - Date.now() - REFRESH_MARGIN_MS,
        MIN_REFRESH_DELAY_MS
      );

      refreshTimer.current = setTimeout(async () => {
        try {
          const nextExpiresAt = await refreshAccessToken();
          scheduleProactiveRefresh(nextExpiresAt); // chain the next cycle
        } catch {
          // refreshAccessToken already clears the session on failure; the
          // next protected request will 401 and route to /login as usual.
        }
      }, delay);
    },
    [clearRefreshTimer]
  );

  // ── clearSession ────────────────────────────────────────────────────────

  const clearSession = useCallback(() => {
    clearRefreshTimer();
    resetNotificationCache();
    clearAuthedFlag(); // optimistic — /logout clears the real httpOnly cookies
    setUser(null);
  }, [clearRefreshTimer]);

  // ── applySession ────────────────────────────────────────────────────────

  const applySession = useCallback(
    (userData, expiresAtMs) => {
      setUser(userData);
      scheduleProactiveRefresh(expiresAtMs);
    },
    [scheduleProactiveRefresh]
  );

  // ── checkAuth ───────────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    if (!isAuthed()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res       = await api.get("/me"); // httpOnly cookie sent automatically
      const userData  = res.data?.data ?? res.data?.user ?? res.data;
      const expiresAt = res.data?.expires_at ?? null;
      applySession(userData, expiresAt);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        // Definitively invalid — wipe session and redirect.
        clearSession();

        const isGuest = isPublicRoute(pathname, PUBLIC_ROUTES);

        if (!isGuest) {
          sessionStorage.setItem("redirectAfterLogin", pathname);
          router.replace("/login");
        }
      } else if (!err.response) {
        // Network timeout / offline — keep the session flag, surface
        // nothing to the user. The dashboard's own auth timeout fallback
        // handles this gracefully.
        console.warn("Auth check: no network response (offline or timeout).");
      } else {
        // 500 / 503 transient error — do not log the user out.
        console.warn("Auth check: server error", status);
      }
    } finally {
      setLoading(false);
    }
  }, [applySession, clearSession, pathname, router]);

  useEffect(() => {
    checkAuth();
    return () => clearRefreshTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally once on mount

  // ── login ────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const res       = await api.post("/login", { email, password });
    const expiresAt = res.data?.expires_at ?? null;

    let userData;
    try {
      const meRes = await api.get("/me"); // cookie already set by /login's response
      userData    = meRes.data?.data ?? meRes.data?.user ?? meRes.data;
    } catch {
      userData = res.data?.user ?? res.data?.data?.user ?? null;
    }
    applySession(userData, expiresAt);
    return userData;
  };

  // ── logout ───────────────────────────────────────────────────────────────
  // Uses router.push instead of a full window.location reload (see todo doc
  // #11) — but a plain client-side navigation alone would leave React
  // Query's cache sitting in memory, which risks flashing the previous
  // user's dashboard/wallet data for a moment if someone else logs in
  // right after on a shared device. queryClient.clear() avoids that while
  // still avoiding the full-page reload's loss of client state.

  const logout = async () => {
    try {
      await api.post("/logout"); // awaited — clears the httpOnly cookies server-side
    } catch {
      // Best-effort: even if this fails, still clear the local session below
      // so the user isn't stuck "logged in" client-side with a dead session.
    }
    clearSession();
    queryClient.clear();
    sessionStorage.removeItem("redirectAfterLogin");
    router.push("/login");
  };

  // ── context ──────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);