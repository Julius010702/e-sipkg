// src/app/(landing)/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-SIPKG — Sistem Informasi Perhitungan Kebutuhan Guru Prov. NTT",
  description:
    "Platform digital untuk mengelola analisis jabatan, analisis beban kerja, dan perhitungan kebutuhan guru SMA, SMK, SLB secara transparan dan akurat di Provinsi Nusa Tenggara Timur.",
  keywords: ["SIPKG", "kebutuhan guru", "NTT", "ANJAB", "ABK", "disdikbud", "NTT"],
  openGraph: {
    title: "E-SIPKG Prov. NTT",
    description: "Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, SLB Provinsi NTT",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}