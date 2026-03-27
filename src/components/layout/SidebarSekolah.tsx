"use client";
// src/components/layout/SidebarSekolah.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ACCENT = "#10b981";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/sekolah/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Unit Organisasi",
    href: "/unit-organisasi",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="6" height="6" rx="1" />
        <rect x="9" y="3" width="6" height="6" rx="1" />
        <rect x="16" y="7" width="6" height="6" rx="1" />
        <rect x="9" y="15" width="6" height="6" rx="1" />
        <line x1="5" y1="13" x2="12" y2="15" />
        <line x1="19" y1="13" x2="12" y2="15" />
        <line x1="12" y1="9" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    label: "Jabatan",
    href: "/jabatan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Pemangku Jabatan",
    href: "/pemangku",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Perhitungan Guru",
    href: "/perhitungan-guru",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Data Guru",
    href: "/data-guru",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Profil Sekolah",
    href: "/sekolah/profil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

interface Props {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function SidebarSekolah({ collapsed, onCollapse, isMobile, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/jabatan") {
      return pathname === "/jabatan" || pathname.startsWith("/jabatan/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarWidth = collapsed ? 68 : 240;

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    document.cookie = "esipkg_token=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("esipkg-auth");
    try { useAuthStore.getState().clearUser(); } catch (_) {}
    window.location.replace("/login");
  }

  return (
    <>
      <style>{`
        .ss-nav-item { transition: background 0.15s, color 0.15s; }
        .ss-nav-item:hover { background: rgba(255,255,255,0.05) !important; color: white !important; }
      `}</style>

      {isMobile && mobileOpen && (
        <div onClick={onMobileClose} style={{
          position: "fixed", inset: 0, zIndex: 199,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        }} />
      )}

      <aside style={{
        position: "fixed", top: 0, bottom: 0,
        left: isMobile ? (mobileOpen ? 0 : -260) : 0,
        width: isMobile ? 260 : sidebarWidth,
        background: "#0d1117",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        zIndex: 200,
        transition: isMobile ? "left 0.3s ease" : "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{
          height: 64, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed && !isMobile ? "0 17px" : "0 18px",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            background: `linear-gradient(135deg, ${ACCENT}cc, ${ACCENT})`,
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${ACCENT}44`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {(!collapsed || isMobile) && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                E-SIPKG
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: -1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                {user?.sekolahNama || "Admin Sekolah"}
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "10px 8px" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="ss-nav-item"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: collapsed && !isMobile ? "10px 0" : "9px 12px",
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  borderRadius: 8, textDecoration: "none",
                  background: active ? `${ACCENT}18` : "transparent",
                  color: active ? ACCENT : "rgba(255,255,255,0.55)",
                  marginBottom: 2, position: "relative",
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%",
                    transform: "translateY(-50%)",
                    width: 3, height: "60%", borderRadius: 2, background: ACCENT,
                  }} />
                )}
                <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                {(!collapsed || isMobile) && (
                  <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div style={{
          padding: collapsed && !isMobile ? "12px 8px" : "12px",
          borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        }}>
          {!isMobile && (
            <button onClick={() => onCollapse(!collapsed)} style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-end", gap: 6,
              padding: "5px 8px", background: "transparent", border: "none",
              cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: 11,
              marginBottom: 8, borderRadius: 6, transition: "color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s" }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {!collapsed && <span>Ciutkan</span>}
            </button>
          )}

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed && !isMobile ? "8px 0" : "8px 10px",
            justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            borderRadius: 8, background: "rgba(255,255,255,0.03)",
          }}>
            <div style={{
              width: 32, height: 32, flexShrink: 0, borderRadius: "50%",
              background: `linear-gradient(135deg, ${ACCENT}80, ${ACCENT})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white",
            }}>
              {user?.nama?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {(!collapsed || isMobile) && (
              <>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.nama || "Admin"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.sekolahNama || "Admin Sekolah"}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", padding: 4, borderRadius: 4,
                    display: "flex", transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}