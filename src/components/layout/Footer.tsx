"use client";
// src/components/layout/Footer.tsx

export function Footer() {
  return (
    <footer style={{
      padding: "16px 28px",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      marginTop: "auto",
    }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
        © 2024 E-SIPKG — Dinas Pendidikan dan Kebudayaan Provinsi NTT
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
        v1.0.0
      </span>
    </footer>
  );
}