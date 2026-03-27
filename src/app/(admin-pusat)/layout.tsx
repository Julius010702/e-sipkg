"use client";
// src/app/(admin-pusat)/layout.tsx

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarAdminPusat } from "@/components/layout/SidebarAdminPusat";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":                          "Dashboard",
  "/admin/master-data/type-unit-kerja":  "Type Unit Kerja",
  "/admin/master-data/opd":              "OPD",
  "/admin/master-data/unit-organisasi":  "Unit Organisasi",
  "/admin/anjab-abk":                    "ANJAB & ABK",
  "/admin/perhitungan-final":            "Perhitungan Final & Pemerataan",
  "/admin/pengaturan/users":             "Manajemen User",
  "/admin/profil":                       "Profil Admin Pusat",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [k, v] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(k)) return v;
  }
  return "E-SIPKG";
}

export default function AdminPusatLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);

  const [collapsed, setCollapsed]   = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role !== "ADMIN_PUSAT") {
      router.replace("/sekolah/dashboard");
    }
  }, [mounted, user, router]);

  // Tutup drawer otomatis saat pindah halaman
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  const sidebarWidth = isMobile ? 0 : collapsed ? 68 : 240;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Lato', sans-serif; background: #090d14; color: white; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <SidebarAdminPusat
        collapsed={collapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onMobileMenuClick={() => setMobileOpen((v) => !v)}
      />

      <Header
        title={getTitle(pathname)}
        sidebarWidth={sidebarWidth}
        onMobileMenuClick={() => setMobileOpen((v) => !v)}
        role="ADMIN_PUSAT"
      />

      <main style={{
        marginLeft: sidebarWidth,
        marginTop: 56,
        minHeight: "calc(100vh - 56px)",
        background: "#090d14",
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        padding: isMobile
          ? "20px 16px calc(60px + env(safe-area-inset-bottom) + 16px)"
          : "28px",
      }}>
        {children}
      </main>
    </>
  );
}