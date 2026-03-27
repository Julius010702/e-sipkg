"use client";
// src/components/dashboard/MenuCepat.tsx

import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────
export interface MenuCepatItem {
  label: string;
  deskripsi: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  disabled?: boolean;
}

interface MenuCepatProps {
  items: MenuCepatItem[];
  title?: string;
  columns?: 2 | 3 | 4;
}

// ── Preset menus ──────────────────────────────────────────────
export const MENU_CEPAT_ADMIN_PUSAT: MenuCepatItem[] = [
  {
    label: "Master Data OPD",
    deskripsi: "Kelola data OPD & unit organisasi",
    href: "/admin/master-data/opd",
    color: "#3b82f6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    label: "ANJAB & ABK",
    deskripsi: "Lihat & kelola analisis jabatan",
    href: "/admin/anjab-abk",
    color: "#10b981",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Perhitungan Final",
    deskripsi: "Rekap & pemerataan semua sekolah",
    href: "/admin/perhitungan-final",
    color: "#f59e0b",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Manajemen User",
    deskripsi: "Tambah & kelola akun pengguna",
    href: "/admin/pengaturan/users",
    color: "#8b5cf6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export const MENU_CEPAT_SEKOLAH: MenuCepatItem[] = [
  {
    label: "Tambah Jabatan",
    deskripsi: "Buat jabatan baru di sekolah",
    href: "/sekolah/jabatan",
    color: "#3b82f6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    label: "Isi Form ANJAB",
    deskripsi: "Lengkapi analisis jabatan",
    href: "/sekolah/jabatan/anjab",
    color: "#10b981",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    label: "Hitung Kebutuhan",
    deskripsi: "Perhitungan kebutuhan guru",
    href: "/sekolah/perhitungan-guru",
    color: "#f59e0b",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Data Guru",
    deskripsi: "Kelola daftar guru sekolah",
    href: "/sekolah/data-guru",
    color: "#8b5cf6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Pemangku Jabatan",
    deskripsi: "Data PNS & PPPK per jabatan",
    href: "/sekolah/pemangku",
    color: "#ef4444",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Profil Sekolah",
    deskripsi: "Info & pengaturan sekolah",
    href: "/sekolah/profil",
    color: "#06b6d4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

// ── Main Component ────────────────────────────────────────────
export function MenuCepat({ items, title = "Menu Cepat", columns = 4 }: MenuCepatProps) {
  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{items.length} menu tersedia</span>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 1,
        background: "rgba(255,255,255,0.04)",
      }}
        className="menu-cepat-grid"
      >
        <style>{`
          @media (max-width: 1024px) { .menu-cepat-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media (max-width: 768px)  { .menu-cepat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px)  { .menu-cepat-grid { grid-template-columns: 1fr !important; } }
          .mc-item:hover .mc-arrow { opacity: 1 !important; transform: translateX(3px) !important; }
          .mc-item:hover .mc-icon  { transform: scale(1.08); }
        `}</style>

        {items.map((item, i) => (
          <Link
            key={i}
            href={item.disabled ? "#" : item.href}
            className="mc-item"
            style={{
              display: "flex", flexDirection: "column", gap: 10,
              padding: "18px 18px",
              background: "#0d1117",
              textDecoration: "none",
              transition: "background 0.18s ease",
              cursor: item.disabled ? "not-allowed" : "pointer",
              opacity: item.disabled ? 0.45 : 1,
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled)
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#0d1117";
            }}
            onClick={(e) => { if (item.disabled) e.preventDefault(); }}
          >
            {/* Icon */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                className="mc-icon"
                style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: `${item.color}16`,
                  border: `1px solid ${item.color}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: item.color,
                  transition: "transform 0.2s ease",
                }}
              >
                {item.icon}
              </div>

              {item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 7px",
                  background: `${item.color}20`, color: item.color,
                  borderRadius: 100, border: `1px solid ${item.color}30`,
                }}>
                  {item.badge}
                </span>
              )}
            </div>

            {/* Text */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
                {item.label}
                <svg
                  className="mc-arrow"
                  width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke={item.color} strokeWidth="2.5"
                  style={{ opacity: 0, transition: "all 0.2s ease", flexShrink: 0 }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                {item.deskripsi}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}