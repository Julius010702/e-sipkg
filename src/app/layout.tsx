// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-SIPKG — Sistem Informasi Perhitungan Kebutuhan Guru",
  description:
    "Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, SLB Provinsi Nusa Tenggara Timur",

  // ✅ FIX ICON
  icons: {
    icon: "/logo-ntt.ico",
    shortcut: "/logo-ntt.ico",
    apple: "/logo-ntt.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}