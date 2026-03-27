// src/types/perhitungan.ts

import type { StatusKebutuhan } from "./index";
import type { Sekolah } from "./index";

// ── Perhitungan Kebutuhan Guru ────────────────────────────────

export interface PerhitunganGuru {
  id: string;
  sekolahId: string;
  sekolah?: Pick<Sekolah, "id" | "nama" | "jenisSekolah" | "kabupatenKota">;
  tahunAjaran: string;
  jumlahRombel?: number;
  jumlahJamPelajaran?: number;
  bebanMengajar?: number;
  jumlahGuruTersedia?: number;
  jumlahGuruPNS?: number;
  jumlahGuruPPPK?: number;
  kebutuhanGuru?: number;
  kekuranganGuru?: number;
  kelebihanGuru?: number;
  statusKebutuhan?: StatusKebutuhan;
  prediksiData?: PrediksiPoint[];
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerhitunganGuruFormInput {
  sekolahId: string;
  tahunAjaran: string;
  jumlahRombel: number;
  jumlahJamPelajaran: number;
  bebanMengajar: number;
  jumlahGuruTersedia: number;
  jumlahGuruPNS?: number;
  jumlahGuruPPPK?: number;
  catatan?: string;
}

// ── Prediksi ──────────────────────────────────────────────────

export interface PrediksiPoint {
  tahun: string;
  prediksi: number;
  aktual?: number;
  tersedia?: number;
  batasAtas?: number;
  batasBawah?: number;
  isHistoris?: boolean;
}

// ── Rekap Final (Admin Pusat) ─────────────────────────────────

export interface RekapRow {
  sekolahId: string;
  namaSekolah: string;
  jenisSekolah: string;
  kabupatenKota: string;
  guruPNS: number;
  guruPPPK: number;
  total: number;
  kebutuhan: number;
  kekurangan: number;
  kelebihan: number;
  statusKebutuhan: StatusKebutuhan;
  persentasePemenuhan: number;
}

export interface RekapSummary {
  totalSekolah: number;
  totalGuruPNS: number;
  totalGuruPPPK: number;
  totalGuru: number;
  totalKebutuhan: number;
  totalKekurangan: number;
  totalKelebihan: number;
  sekolahKurang: number;
  sekolahLebih: number;
  sekolahSesuai: number;
}

export interface RekomendasiPemerataan {
  dari: string;
  ke: string;
  namaSekolahDari: string;
  namaSekolahTujuan: string;
  jumlahGuru: number;
  kabupatenDari?: string;
  kabupatenTujuan?: string;
}

export interface RekapFinal {
  id: string;
  tahun: string;
  totalSekolah?: number;
  totalGuruPNS?: number;
  totalGuruPPPK?: number;
  totalKebutuhan?: number;
  totalKekurangan?: number;
  totalKelebihan?: number;
  distribusiData?: RekapRow[];
  rekomendasiData?: RekomendasiPemerataan[];
  createdAt: string;
  updatedAt: string;
}

// ── Status label & warna ──────────────────────────────────────

export const STATUS_LABEL: Record<StatusKebutuhan, string> = {
  KURANG: "Kekurangan Guru",
  LEBIH:  "Kelebihan Guru",
  SESUAI: "Sudah Sesuai",
};

export const STATUS_COLOR: Record<StatusKebutuhan, string> = {
  KURANG: "#ef4444",
  LEBIH:  "#f59e0b",
  SESUAI: "#10b981",
};

export const STATUS_BG: Record<StatusKebutuhan, string> = {
  KURANG: "rgba(239,68,68,0.1)",
  LEBIH:  "rgba(245,158,11,0.1)",
  SESUAI: "rgba(16,185,129,0.1)",
};