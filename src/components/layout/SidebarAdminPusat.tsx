"use client";
// src/components/layout/SidebarAdminPusat.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ACCENT = "#3b82f6";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
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
    label: "Master Data",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    children: [
      { label: "Type Unit Kerja", href: "/master-data/type-unit-kerja" },
      { label: "OPD",             href: "/master-data/opd" },
      { label: "Eselon",          href: "/master-data/eselon" },
      { label: "Unit Organisasi", href: "/master-data/unit-organisasi" },
    ],
  },
  {
    label: "ANJAB & ABK",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    children: [
      { label: "Rekap ANJAB & ABK", href: "/anjab-abk/rekap-anjab_abk" },
      { label: "ANJAB",             href: "/anjab-abk/anjab" },
      { label: "ABK",               href: "/anjab-abk/abk" },
      { label: "Bezeting",          href: "/anjab-abk/bezeting" },
    ],
  },
  {
    label: "Perhitungan Final",
    href: "/perhitungan-final",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Pengaturan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    children: [
      { label: "Manajemen User", href: "/pengaturan/users" },
    ],
  },
  {
    label: "Profil",
    href: "/profil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// Bottom nav items for mobile — maps to the real nav routes above
const BOTTOM_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Master Data",
    href: "/master-data/type-unit-kerja",
    matchPrefix: "/master-data",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    label: "Hitung",
    href: "/perhitungan-final",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "ANJAB",
    href: "/anjab-abk/anjab",
    matchPrefix: "/anjab-abk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  // "More" button to open drawer
  {
    label: "Lainnya",
    href: null as string | null,
    isMore: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
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
  onMobileMenuClick: () => void;
}

export function SidebarAdminPusat({ collapsed, onCollapse, isMobile, mobileOpen, onMobileClose, onMobileMenuClick }: Props) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        setExpandedMenus((prev) => prev.includes(item.label) ? prev : [...prev, item.label]);
      }
    });
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isBottomActive = (item: typeof BOTTOM_NAV_ITEMS[0]) => {
    if (!item.href) return false;
    if ((item as any).matchPrefix) return pathname.startsWith((item as any).matchPrefix);
    return isActive(item.href);
  };
  const isParentActive = (item: typeof NAV_ITEMS[0]) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

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

  // ── MOBILE: Bottom Navigation Bar + Full-menu Drawer ───────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
          .mob-drawer-item { transition: background 0.15s, color 0.15s; }
          .mob-drawer-item:hover { background: rgba(255,255,255,0.06) !important; }
          .mob-bottom-tab { transition: color 0.15s; -webkit-tap-highlight-color: transparent; outline: none; }
          @keyframes slideUpDrawer { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        `}</style>

        {/* Overlay */}
        {mobileOpen && (
          <div
            onClick={onMobileClose}
            style={{
              position: "fixed", inset: 0, zIndex: 299,
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
              animation: "fadeInOverlay 0.2s ease",
            }}
          />
        )}

        {/* Slide-up full menu drawer */}
        {mobileOpen && (
          <div style={{
            position: "fixed", left: 0, right: 0, bottom: 0,
            zIndex: 300,
            background: "#0d1117",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px 20px 0 0",
            // leave room above the bottom nav bar
            paddingBottom: "calc(env(safe-area-inset-bottom) + 68px)",
            maxHeight: "82vh",
            overflowY: "auto",
            animation: "slideUpDrawer 0.3s cubic-bezier(0.32,0.72,0,1)",
          }}>
            {/* Handle bar */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            </div>

            {/* App brand */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: 32, height: 32, flexShrink: 0,
                background: `linear-gradient(135deg, ${ACCENT}cc, ${ACCENT})`,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 12px ${ACCENT}44`,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}>E-SIPKG</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Admin Pusat</div>
              </div>
            </div>

            {/* Full nav */}
            <nav style={{ padding: "8px 12px" }}>
              {NAV_ITEMS.map((item) => {
                const hasChildren = !!item.children?.length;
                const expanded = expandedMenus.includes(item.label);
                const active = item.href ? isActive(item.href) : isParentActive(item);

                return (
                  <div key={item.label}>
                    {hasChildren ? (
                      <button
                        onClick={() => setExpandedMenus((p) =>
                          p.includes(item.label) ? p.filter((l) => l !== item.label) : [...p, item.label]
                        )}
                        className="mob-drawer-item"
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px",
                          borderRadius: 10, border: "none", cursor: "pointer",
                          background: active ? `${ACCENT}18` : "transparent",
                          color: active ? ACCENT : "rgba(255,255,255,0.6)",
                          marginBottom: 2, position: "relative",
                        }}
                      >
                        {active && (
                          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", borderRadius: 2, background: ACCENT }} />
                        )}
                        <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 700 : 500, textAlign: "left" }}>{item.label}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    ) : (
                      <Link href={item.href!} onClick={onMobileClose}
                        className="mob-drawer-item"
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px",
                          borderRadius: 10, textDecoration: "none",
                          background: active ? `${ACCENT}18` : "transparent",
                          color: active ? ACCENT : "rgba(255,255,255,0.6)",
                          marginBottom: 2, position: "relative",
                        }}
                      >
                        {active && (
                          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", borderRadius: 2, background: ACCENT }} />
                        )}
                        <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                      </Link>
                    )}

                    {hasChildren && expanded && (
                      <div style={{ paddingLeft: 18, marginBottom: 4 }}>
                        {item.children!.map((child) => (
                          <Link key={child.href} href={child.href} onClick={onMobileClose}
                            className="mob-drawer-item"
                            style={{
                              display: "flex", alignItems: "center",
                              padding: "10px 14px", borderRadius: 8,
                              textDecoration: "none", fontSize: 13, marginBottom: 1,
                              color: isActive(child.href) ? ACCENT : "rgba(255,255,255,0.4)",
                              background: isActive(child.href) ? `${ACCENT}14` : "transparent",
                              fontWeight: isActive(child.href) ? 700 : 400,
                              borderLeft: `2px solid ${isActive(child.href) ? ACCENT : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* User info + logout */}
            <div style={{
              margin: "8px 12px 0",
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 38, height: 38, flexShrink: 0, borderRadius: "50%",
                background: `linear-gradient(135deg, ${ACCENT}80, ${ACCENT})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, color: "white",
              }}>
                {user?.nama?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.nama || "Administrator"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Admin Pusat</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  cursor: "pointer", color: "#ef4444",
                  padding: "7px 14px", borderRadius: 8,
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom Navigation Bar ── */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: `calc(60px + env(safe-area-inset-bottom))`,
          background: "#0d1117",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "stretch",
          zIndex: 200,
        }}>
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = (item as any).isMore ? mobileOpen : isBottomActive(item);

            if ((item as any).isMore) {
              return (
                <button
                  key="more"
                  onClick={onMobileMenuClick}
                  className="mob-bottom-tab"
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 3,
                    background: "none", border: "none", cursor: "pointer",
                    color: active ? ACCENT : "rgba(255,255,255,0.35)",
                    padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
                    position: "relative",
                  }}
                >
                  {active && (
                    <div style={{
                      position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                      width: 28, height: 2, borderRadius: "0 0 2px 2px", background: ACCENT,
                    }} />
                  )}
                  <span style={{ display: "flex" }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className="mob-bottom-tab"
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 3,
                  textDecoration: "none",
                  color: active ? ACCENT : "rgba(255,255,255,0.35)",
                  padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
                  position: "relative",
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: 28, height: 2, borderRadius: "0 0 2px 2px", background: ACCENT,
                  }} />
                )}
                <span style={{ display: "flex" }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </>
    );
  }

  // ── DESKTOP: Collapsible Sidebar (unchanged logic) ──────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        .sap-nav-item { transition: background 0.15s, color 0.15s; }
        .sap-nav-item:hover { background: rgba(255,255,255,0.05) !important; color: white !important; }
        .sap-sub-item { transition: background 0.15s, color 0.15s; }
        .sap-sub-item:hover { background: rgba(255,255,255,0.04) !important; color: white !important; }
      `}</style>

      <aside style={{
        position: "fixed", top: 0, bottom: 0, left: 0,
        width: sidebarWidth,
        background: "#0d1117",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        zIndex: 200,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{
          height: 64, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "0 17px" : "0 18px",
          justifyContent: collapsed ? "center" : "flex-start",
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
          {!collapsed && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: "'Cinzel', serif", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                E-SIPKG
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: -1 }}>
                Admin Pusat
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "10px 8px" }}>
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children?.length;
            const expanded = expandedMenus.includes(item.label);
            const active = item.href ? isActive(item.href) : isParentActive(item);

            return (
              <div key={item.label}>
                {hasChildren ? (
                  <button
                    onClick={() => !collapsed && setExpandedMenus((p) =>
                      p.includes(item.label) ? p.filter((l) => l !== item.label) : [...p, item.label]
                    )}
                    title={collapsed ? item.label : undefined}
                    className="sap-nav-item"
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: collapsed ? "10px 0" : "9px 12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 8, border: "none", cursor: "pointer",
                      background: active ? `${ACCENT}18` : "transparent",
                      color: active ? ACCENT : "rgba(255,255,255,0.55)",
                      marginBottom: 2, position: "relative",
                    }}
                  >
                    {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", borderRadius: 2, background: ACCENT }} />}
                    <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 500, textAlign: "left", whiteSpace: "nowrap" }}>{item.label}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <Link href={item.href!} title={collapsed ? item.label : undefined}
                    className="sap-nav-item"
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: collapsed ? "10px 0" : "9px 12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 8, textDecoration: "none",
                      background: active ? `${ACCENT}18` : "transparent",
                      color: active ? ACCENT : "rgba(255,255,255,0.55)",
                      marginBottom: 2, position: "relative",
                    }}
                  >
                    {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", borderRadius: 2, background: ACCENT }} />}
                    <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                    {!collapsed && (
                      <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>{item.label}</span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {hasChildren && expanded && !collapsed && (
                  <div style={{ paddingLeft: 16, marginBottom: 4 }}>
                    {item.children!.map((child) => (
                      <Link key={child.href} href={child.href}
                        className="sap-sub-item"
                        style={{
                          display: "flex", alignItems: "center",
                          padding: "8px 12px", borderRadius: 6,
                          textDecoration: "none", fontSize: 12, marginBottom: 1,
                          color: isActive(child.href) ? ACCENT : "rgba(255,255,255,0.4)",
                          background: isActive(child.href) ? `${ACCENT}14` : "transparent",
                          fontWeight: isActive(child.href) ? 700 : 400,
                          borderLeft: `2px solid ${isActive(child.href) ? ACCENT : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div style={{
          padding: collapsed ? "12px 8px" : "12px",
          borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        }}>
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

          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "8px 0" : "8px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
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
            {!collapsed && (
              <>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.nama || "Administrator"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Admin Pusat</div>
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