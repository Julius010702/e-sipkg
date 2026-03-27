// src/types/anjab.ts

import type { Jabatan } from "./jabatan";

export interface BahanKerjaRow {
  no: number;
  bahan: string;
  penggunaan: string;
}

export interface PerangkatKerjaRow {
  no: number;
  perangkat: string;
  penggunaan: string;
}

export interface HasilKerjaRow {
  no: number;
  hasil: string;
  satuan: string;
  jumlah: number;
}

export interface Anjab {
  id: string;
  jabatanId: string;
  jabatan?: Pick<Jabatan, "id" | "kodeJabatan" | "namaJabatan" | "jenisJabatan" | "unitOrganisasi" | "indukJabatan">;

  // 16 komponen ANJAB
  ikhtisarJabatan?: string;
  uraianTugas?: string;
  bahanKerja?: BahanKerjaRow[];
  perangkatKerja?: PerangkatKerjaRow[];
  hasilKerja?: HasilKerjaRow[];
  tanggungjawab?: string[];

  pangkatGolonganTerendah?: string;
  pangkatGolonganTertinggi?: string;
  pendidikanTerendah?: string;
  bidangPendidikanTerendah?: string;
  pendidikanTertinggi?: string;
  bidangPendidikanTertinggi?: string;

  kursusPelatihanPemimpin?: string[];
  pengalamanKerja?: string[];
  pengetahuan?: string[];
  keterampilan?: string[];

  progressPersen: number;
  createdAt: string;
  updatedAt: string;

  // relasi
  abk?: { id: string };
}

export interface AnjabFormInput {
  jabatanId: string;
  ikhtisarJabatan?: string;
  uraianTugas?: string;
  bahanKerja?: BahanKerjaRow[];
  perangkatKerja?: PerangkatKerjaRow[];
  hasilKerja?: HasilKerjaRow[];
  tanggungjawab?: string[];
  pangkatGolonganTerendah?: string;
  pangkatGolonganTertinggi?: string;
  pendidikanTerendah?: string;
  bidangPendidikanTerendah?: string;
  pendidikanTertinggi?: string;
  bidangPendidikanTertinggi?: string;
  kursusPelatihanPemimpin?: string[];
  pengalamanKerja?: string[];
  pengetahuan?: string[];
  keterampilan?: string[];
  progressPersen?: number;
}

// Kalkulasi progress ANJAB (0–100%)
export function calcAnjabProgress(anjab: Partial<AnjabFormInput>): number {
  const checks = [
    (anjab.ikhtisarJabatan?.trim().length ?? 0) > 0,
    (anjab.uraianTugas?.trim().length ?? 0) > 0,
    (anjab.bahanKerja?.some((b) => b.bahan.trim())) ?? false,
    (anjab.perangkatKerja?.some((p) => p.perangkat.trim())) ?? false,
    (anjab.hasilKerja?.some((h) => h.hasil.trim())) ?? false,
    (anjab.tanggungjawab?.some((t) => t.trim())) ?? false,
    !!anjab.pangkatGolonganTerendah,
    !!anjab.pangkatGolonganTertinggi,
    !!anjab.pendidikanTerendah,
    (anjab.bidangPendidikanTerendah?.trim().length ?? 0) > 0,
    !!anjab.pendidikanTertinggi,
    (anjab.bidangPendidikanTertinggi?.trim().length ?? 0) > 0,
    (anjab.kursusPelatihanPemimpin?.some((k) => k.trim())) ?? false,
    (anjab.pengalamanKerja?.some((p) => p.trim())) ?? false,
    (anjab.pengetahuan?.some((p) => p.trim())) ?? false,
    (anjab.keterampilan?.some((k) => k.trim())) ?? false,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}