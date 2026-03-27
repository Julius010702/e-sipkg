// src/types/abk.ts

import type { EfektivitasJabatan, StatusKebutuhan } from "./index";
import type { Anjab } from "./anjab";

export interface BebanKerjaRow {
  no: number;
  uraianTugas: string;
  satuanHasil: string;
  volumeKerja: number;
  normaWaktu: number;   // dalam menit
  bebanKerja: number;   // auto = volume × normaWaktu
}

export interface ABK {
  id: string;
  anjabId: string;
  anjab?: Pick<Anjab, "id" | "jabatanId" | "ikhtisarJabatan" | "jabatan">;

  detailBebanKerja?: BebanKerjaRow[];
  totalBebanKerja?: number;
  efektivitasNilai?: number;
  efektivitasJabatan?: EfektivitasJabatan;
  kebutuhanPegawai?: number;
  statusKebutuhan?: StatusKebutuhan;
  jumlahKurangLebih?: number;

  createdAt: string;
  updatedAt: string;
}

export interface ABKFormInput {
  anjabId: string;
  detailBebanKerja: BebanKerjaRow[];
  totalBebanKerja?: number;
  efektivitasNilai?: number;
  efektivitasJabatan?: EfektivitasJabatan;
  kebutuhanPegawai?: number;
  statusKebutuhan?: StatusKebutuhan;
  jumlahKurangLebih?: number;
}

// Label EJ
export const EJ_LABELS: Record<EfektivitasJabatan, string> = {
  A: "Sangat Baik",
  B: "Baik",
  C: "Cukup Baik",
  D: "Cukup",
  E: "Kurang",
};

export const EJ_COLORS: Record<EfektivitasJabatan, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#06b6d4",
  D: "#f59e0b",
  E: "#ef4444",
};

// Konstanta jam kerja efektif
export const JAM_EFEKTIF_PER_TAHUN  = 1250;
export const MENIT_EFEKTIF_PER_TAHUN = JAM_EFEKTIF_PER_TAHUN * 60; // 75.000 menit

// Kalkulasi ABK lengkap
export function kalkulasiABK(rows: Pick<BebanKerjaRow, "volumeKerja" | "normaWaktu">[]): {
  totalBebanKerja: number;
  kebutuhanPegawai: number;
  efektivitasNilai: number;
  efektivitasJabatan: EfektivitasJabatan;
  efektivitasLabel: string;
} {
  const rowsWithBeban = rows.map((r) => ({ ...r, bebanKerja: r.volumeKerja * r.normaWaktu }));
  const total  = rowsWithBeban.reduce((s, r) => s + r.bebanKerja, 0);
  const ej     = total / MENIT_EFEKTIF_PER_TAHUN;
  const ejVal  = parseFloat(ej.toFixed(2));
  const kebt   = parseFloat(ej.toFixed(2));

  let kategori: EfektivitasJabatan;
  if (ej >= 0.91)      kategori = "A";
  else if (ej >= 0.76) kategori = "B";
  else if (ej >= 0.61) kategori = "C";
  else if (ej >= 0.51) kategori = "D";
  else                  kategori = "E";

  return {
    totalBebanKerja:     total,
    kebutuhanPegawai:    kebt,
    efektivitasNilai:    ejVal,
    efektivitasJabatan:  kategori,
    efektivitasLabel:    EJ_LABELS[kategori],
  };
}