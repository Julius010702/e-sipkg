import type { Wilayah } from './index'

export type JenisSekolah = 'SMA' | 'SMK' | 'SLB'
export type StatusData   = 'DRAFT' | 'DIKIRIM' | 'DISETUJUI' | 'DITOLAK'

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

export interface SekolahWithGuru extends Sekolah {
  guruJabatan: import('./guru').GuruJabatan[]
}

export interface SekolahFormData {
  nama: string
  jenisSekolah: JenisSekolah
  npsn?: string
  alamat?: string
  wilayahId: string
  jumlahSiswa: number
  jumlahRombel: number
}

export interface KompetensiKeahlian {
  id: string
  sekolahId: string
  namaJurusan: string
  bidangStudi?: string
  jumlahSiswa: number
  jumlahRombel: number
}
