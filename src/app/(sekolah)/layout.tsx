"use client";
// src/app/(sekolah)/layout.tsx

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarSekolah } from "@/components/layout/SidebarSekolah";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/sekolah/dashboard":        "Dashboard",
  "/sekolah/unit-organisasi":  "Unit Organisasi",
  "/sekolah/jabatan":          "Daftar Jabatan",
  "/sekolah/jabatan/anjab":    "Analisis Jabatan (ANJAB)",
  "/sekolah/jabatan/abk":      "Analisis Beban Kerja (ABK)",
  "/sekolah/jabatan/bezeting": "Bezeting",
  "/sekolah/pemangku":         "Pemangku Jabatan",
  "/sekolah/perhitungan-guru": "Perhitungan Kebutuhan Guru",
  "/sekolah/data-guru":        "Data Guru",
  "/sekolah/profil":           "Profil Sekolah",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [k, v] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(k)) return v;
  }
  return "E-SIPKG";
}

export default function SekolahLayout({ children }: { children: React.ReactNode }) {
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
    if (mounted && user && user.role !== "ADMIN_SEKOLAH") {
      router.replace("/admin/dashboard");
    }
  }, [mounted, user, router]);

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

      <SidebarSekolah
        collapsed={collapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
        title={getTitle(pathname)}
        sidebarWidth={sidebarWidth}
        onMobileMenuClick={() => setMobileOpen(true)}
        role="ADMIN_SEKOLAH"
      />

      <main style={{
        marginLeft: sidebarWidth,
        marginTop: 64,
        minHeight: "calc(100vh - 64px)",
        background: "#090d14",
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        padding: "28px",
      }}>
        {children}
      </main>
    </>
  );
}