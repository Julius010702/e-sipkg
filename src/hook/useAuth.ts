"use client";
// src/hooks/useAuth.ts

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdminPusat: boolean;
  isAdminSekolah: boolean;
  sekolahId: string | null;
  logout: () => Promise<void>;
  requireAuth: (role?: "ADMIN_PUSAT" | "ADMIN_SEKOLAH") => void;
}

export function useAuth(): UseAuthReturn {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const storeLogout = useAuthStore((s) => s.logout);

  // isLoading lokal — tidak bergantung pada store
  const isAuthenticated = !!user;
  const isAdminPusat    = user?.role === "ADMIN_PUSAT";
  const isAdminSekolah  = user?.role === "ADMIN_SEKOLAH";

  // Verifikasi session dari server saat mount jika belum ada user
  useEffect(() => {
    if (user) return;
    let cancelled = false;
    async function checkSession() {
      try {
        const res  = await fetch("/api/auth/me");
        const data = await res.json();
        if (!cancelled && data.success && data.user) {
          setUser(data.user);
        }
      } catch {
        // biarkan middleware yang handle redirect
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const requireAuth = useCallback(
    (role?: "ADMIN_PUSAT" | "ADMIN_SEKOLAH") => {
      if (!user) { router.push("/login"); return; }
      if (role && user.role !== role) {
        router.push(user.role === "ADMIN_PUSAT" ? "/admin/dashboard" : "/sekolah/dashboard");
      }
    },
    [user, router]
  );

  // Wrapper agar return Promise<void>
  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  return {
    user,
    isLoading:       false, // gunakan Suspense atau loading state lokal di komponen
    isAuthenticated,
    isAdminPusat,
    isAdminSekolah,
    sekolahId:       user?.sekolahId ?? null,
    logout,
    requireAuth,
  };
}