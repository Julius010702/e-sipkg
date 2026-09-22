import type { Sekolah } from './sekolah'
import type { GuruJabatan, JabatanGuru } from './guru'
import type { Wilayah } from './index'

export interface RekapJabatan {
  jabatanId: string
  namaJabatan: string
  kode?: string
  isBK: boolean
  jumlahSekolah: number
  totalKebutuhan: number
  totalTersedia: number
  totalPNS: number
  totalPPPK: number
  totalSelisih: number
}

export interface AnalisisSekolah {
  sekolah: Sekolah & { wilayah: Wilayah }
  totalKebutuhan: number
  totalTersedia: number
  totalSelisih: number
  guruJabatan: (GuruJabatan & { jabatan: JabatanGuru })[]
}

export interface SekolahRanking {
  id: string
  nama: string
  jenisSekolah: string
  statusData: string
  wilayah: { nama: string }
  totalKekurangan: number
  jabatanKurang: { namaJabatan: string; selisih: number }[]
}

export interface DistribusiJabatan {
  jabatanId: string
  namaJabatan: string
  totalSurplus: number
  totalDefisit: number
  sekolahSurplus: { sekolahId: string; namaSekolah: string; wilayah: string; surplus: number }[]
  sekolahDefisit: { sekolahId: string; namaSekolah: string; wilayah: string; defisit: number }[]
}

export interface RekomendasiDistribusi {
  jabatan: string
  totalDefisit: string
  totalSurplus: string
  bisa_dipindahkan: string
  sekolahKekurangan: { nama: string; wilayah: string; selisih: number }[]
  sekolahKelebihan: { nama: string; wilayah: string; selisih: number }[]
}

export interface RekapWilayah {
  wilayahId: string
  namaWilayah: string
  jumlahSekolah: number
  totalSiswa: number
  totalPNS: number
  totalPPPK: number
  totalKebutuhan: number
  totalSelisih: number
}
