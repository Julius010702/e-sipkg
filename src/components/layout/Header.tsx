"use client";
// src/components/layout/Header.tsx

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  title: string;
  sidebarWidth: number;
  onMobileMenuClick: () => void;
  role: "ADMIN_PUSAT" | "ADMIN_SEKOLAH";
}

interface Notif {
  id: string;
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  ikon: string;
}

const NOTIF_AWAL: Notif[] = [
  { id: "1", judul: "Selamat Datang", pesan: "Anda berhasil masuk ke sistem E-SIPKG.", waktu: "Baru saja", dibaca: false, ikon: "👋" },
  { id: "2", judul: "Data Guru", pesan: "Pastikan data guru sudah diperbarui untuk tahun ajaran ini.", waktu: "1 jam lalu", dibaca: false, ikon: "📋" },
  { id: "3", judul: "Perhitungan Kebutuhan", pesan: "Rekap perhitungan kebutuhan guru siap ditinjau.", waktu: "Kemarin", dibaca: true, ikon: "📊" },
];

export function Header({ title, sidebarWidth, onMobileMenuClick, role }: HeaderProps) {
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIF_AWAL);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accentColor = role === "ADMIN_PUSAT" ? "#3b82f6" : "#10b981";
  const profileHref = role === "ADMIN_PUSAT" ? "/profil" : "/sekolah/profil";
  const belumDibaca = notifs.filter((n) => !n.dibaca).length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function bacaNotif(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
  }

  function bacaSemua() {
    setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    document.cookie = "esipkg_token=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("esipkg-auth");
    try {
      useAuthStore.getState().clearUser();
    } catch (_) {}
    window.location.replace("/login");
  }

  return (
    <>
      <style>{`
        @keyframes dropIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.15); } }
      `}</style>

      <header style={{
        position: "fixed",
        top: 0,
        left: isMobile ? 0 : sidebarWidth,
        right: 0,
        height: 56,
        background: "rgba(13,17,23,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 12px" : "0 24px",
        transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* ── Left: hamburger (mobile) + title ── */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 12, minWidth: 0 }}>
          {isMobile && (
            <button
              onClick={onMobileMenuClick}
              style={{
                width: 36, height: 36, flexShrink: 0,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9, cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {/* App icon on mobile */}
          {isMobile && (
            <div style={{
              width: 28, height: 28, flexShrink: 0,
              background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
              borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 8px ${accentColor}44`,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}

          <h1 style={{
            fontSize: isMobile ? 14 : 15,
            fontWeight: 700,
            color: "white",
            margin: 0,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: isMobile ? "calc(100vw - 200px)" : "none",
          }}>
            {title}
          </h1>
        </div>

        {/* ── Right: notifications + user ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {/* Notifikasi */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
              style={{
                width: 34, height: 34, position: "relative",
                background: notifOpen ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, cursor: "pointer",
                color: notifOpen ? "white" : "rgba(255,255,255,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {belumDibaca > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#ef4444", fontSize: 9, fontWeight: 800, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #0d1117", animation: "pulse 2s infinite",
                }}>
                  {belumDibaca}
                </span>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: "fixed",
                top: 64,
                right: isMobile ? 8 : 24,
                width: isMobile ? "calc(100vw - 16px)" : 320,
                maxWidth: 360,
                background: "#161b22",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                animation: "dropIn 0.15s ease", zIndex: 999,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Notifikasi</span>
                    {belumDibaca > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", background: "#ef444420", color: "#ef4444", borderRadius: 100, border: "1px solid #ef444430" }}>
                        {belumDibaca} baru
                      </span>
                    )}
                  </div>
                  {belumDibaca > 0 && (
                    <button onClick={bacaSemua} style={{ fontSize: 11, fontWeight: 600, color: accentColor, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifs.map((n) => (
                    <div key={n.id} onClick={() => bacaNotif(n.id)}
                      style={{
                        display: "flex", gap: 12, padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: n.dibaca ? "transparent" : "rgba(59,130,246,0.06)",
                        cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = n.dibaca ? "transparent" : "rgba(59,130,246,0.06)")}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {n.ikon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{n.judul}</span>
                          {!n.dibaca && <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />}
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>{n.pesan}</p>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>{n.waktu}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    {notifs.filter((n) => n.dibaca).length} dari {notifs.length} notifikasi dibaca
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: isMobile ? 6 : 8,
                padding: isMobile ? "4px 8px 4px 4px" : "4px 10px 4px 4px",
                background: dropdownOpen ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${accentColor}80, ${accentColor})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
              }}>
                {user?.nama?.charAt(0)?.toUpperCase() || "A"}
              </div>
              {/* On mobile: only show avatar + chevron, hide name */}
              {!isMobile && (
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.nama || "Admin"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                    {role === "ADMIN_PUSAT" ? "Admin Pusat" : "Admin Sekolah"}
                  </div>
                </div>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div style={{
                position: "fixed",
                top: 64,
                right: isMobile ? 8 : 24,
                width: 220,
                background: "#161b22",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                animation: "dropIn 0.15s ease", zIndex: 999,
              }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{user?.nama}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{user?.email}</div>
                  {user?.sekolahNama && (
                    <div style={{ fontSize: 10, marginTop: 6, padding: "2px 8px", background: `${accentColor}18`, color: accentColor, borderRadius: 4, display: "inline-block", fontWeight: 700 }}>
                      {user.sekolahNama}
                    </div>
                  )}
                </div>

                <Link href={profileHref} onClick={() => setDropdownOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13, transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  Profil Saya
                </Link>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", color: loggingOut ? "rgba(239,68,68,0.5)" : "#ef4444", background: "none", border: "none", cursor: loggingOut ? "not-allowed" : "pointer", fontSize: 13, textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (!loggingOut) e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {loggingOut ? "Keluar..." : "Keluar dari Sistem"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}