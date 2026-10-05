// ============================================================
// TYPES - e-SIPKG
// ============================================================

export type JenisSekolah = 'SMA' | 'SMK' | 'SLB'
export type StatusData = 'DRAFT' | 'DIKIRIM' | 'DISETUJUI' | 'DITOLAK'
export type RoleUser = 'SEKOLAH' | 'BIRO' | 'ADMIN'

export interface Wilayah {
  id: string
  nama: string
  provinsi: string
}

export interface Sekolah {
  id: string
  nama: string
  jenisSekolah: JenisSekolah
  npsn?: string
  alamat?: string
  wilayahId: string
  wilayah?: Wilayah
  jumlahSiswa: number
  jumlahRombel: number
  statusData: StatusData
  createdAt: string
  updatedAt: string
}

export interface JabatanGuru {
  id: string
  namaJabatan: string
  kode?: string
  jamStandar: number
  isBK: boolean
  deskripsi?: string
}

export interface GuruJabatan {
  id: string
  sekolahId: string
  jabatanId: string
  jabatan?: JabatanGuru
  periodeId?: string
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
  jamMengajarPerMinggu: number
  kebutuhanGuru: number
  tersedia: number
  selisih: number
  createdAt: string
  updatedAt: string
}

export interface PeriodeLaporan {
  id: string
  nama: string
  tahunAjaran: string
  semester: number
  tanggalMulai: string
  tanggalAkhir: string
  isAktif: boolean
}

export interface ValidasiLog {
  id: string
  sekolahId: string
  userId: string
  user?: { nama: string; email: string }
  statusBaru: StatusData
  catatan?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  nama: string
  role: RoleUser
  sekolahId?: string
  sekolah?: Sekolah
}

// Analisis types
export interface RekapKebutuhan {
  jabatan: string
  kebutuhan: number
  tersedia: number
  selisih: number
  pns: number
  pppk: number
}

export interface AnalisisSekolah {
  sekolah: Sekolah & { wilayah: Wilayah }
  totalKebutuhan: number
  totalTersedia: number
  totalSelisih: number
  guruJabatan: (GuruJabatan & { jabatan: JabatanGuru })[]
}
