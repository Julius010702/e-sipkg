// src/types/index.ts
// Type global E-SIPKG

// ── Enum-like string literals ─────────────────────────────────

export type Role           = "ADMIN_PUSAT" | "ADMIN_SEKOLAH";
export type StatusPegawai  = "PNS" | "PPPK";
export type JenisSekolah   = "SMA" | "SMK" | "SLB";
export type JenisJabatan   = "STRUKTURAL" | "FUNGSIONAL" | "PELAKSANA";
export type StatusKebutuhan = "KURANG" | "LEBIH" | "SESUAI";
export type EfektivitasJabatan = "A" | "B" | "C" | "D" | "E";
export type StatusUser     = "AKTIF" | "NONAKTIF";
export type KondisiFisik   = "BAIK" | "SEDANG" | "KURANG";

// ── API Response wrapper ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Auth ──────────────────────────────────────────────────────

export interface AuthUser {
  userId: string;
  email: string;
  nama: string;
  role: Role;
  sekolahId: string | null;
  sekolahNama: string | null;
}

// ── Master Data ───────────────────────────────────────────────

export interface TypeUnitKerja {
  id: string;
  nama: string;
  createdAt: string;
}

export interface OPD {
  id: string;
  nama: string;
  kawil?: string;
  indukUnitKerja?: string;
  typeUnitKerjaId: string;
  typeUnitKerja?: TypeUnitKerja;
  createdAt: string;
}

export interface Eselon {
  id: string;
  kode: string;
  nama: string;
}

export interface UnitOrganisasi {
  id: string;
  namaUnit: string;
  opdId: string;
  opd?: OPD;
  eselonId: string;
  eselon?: Eselon;
  createdAt: string;
}

export interface Urusan {
  id: string;
  nama: string;
}

// ── Sekolah & User ────────────────────────────────────────────

export interface Sekolah {
  id: string;
  npsn?: string;
  nama: string;
  jenisSekolah: JenisSekolah;
  alamat?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi: string;
  telepon?: string;
  email?: string;
  logoUrl?: string;
  kepalaSekolah?: string;
  wakilKepala?: string;
  sekretaris?: string;
  aktif: boolean;
  opdId?: string;
  opd?: OPD;
  unitOrganisasiId?: string;
  unitOrganisasi?: UnitOrganisasi;
}

export interface User {
  id: string;
  nama: string;
  email: string;
  role: Role;
  status: StatusUser;
  sekolahId?: string;
  sekolah?: Pick<Sekolah, "id" | "nama" | "jenisSekolah">;
  createdAt: string;
}

// ── Guru ──────────────────────────────────────────────────────

export interface Guru {
  id: string;
  sekolahId: string;
  nip?: string;
  nama: string;
  statusPegawai: StatusPegawai;
  jenisKelamin?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  pangkatGolongan?: string;
  tmtGolongan?: string;
  pendidikanTerakhir?: string;
  bidangStudi?: string;
  mataPelajaran?: string;
  statusSertifikasi?: boolean;
  nomorSertifikasi?: string;
  tmtMasuk?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  foto?: string;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Pemangku ──────────────────────────────────────────────────

export interface Pemangku {
  id: string;
  jabatanId: string;
  namaPemangku: string;
  nip?: string;
  statusPegawai: StatusPegawai;
  pangkatGolongan?: string;
  pendidikan?: string;
  bidangPendidikan?: string;
  pengalamanKerja?: string[];
  keterampilan?: string[];
  kondisiFisik?: KondisiFisik;
  createdAt: string;
}

// ── Select Option (untuk komponen UI) ────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ── Pagination ────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
}

// ── Form helpers ──────────────────────────────────────────────

export type FormErrors<T> = Partial<Record<keyof T, string>>;

// ── Landing Config ────────────────────────────────────────────

export interface LandingConfig {
  id: string;
  logoUrl?: string;
  namaUnit?: string;
  keterangan?: string;
  slides?: { judul: string; deskripsi: string; imageUrl: string }[];
  alamat?: string;
  email?: string;
  kontak?: string;
  hakiInfo?: string;
}