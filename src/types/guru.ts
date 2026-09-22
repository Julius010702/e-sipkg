export type StatusGuru = 'PNS' | 'PPPK' | 'HONORER'

export interface JabatanGuru {
  id: string
  namaJabatan: string
  kode?: string
  jamStandar: number
  isBK: boolean
  deskripsi?: string
  createdAt: string
  updatedAt: string
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

  // Kalkulasi
  kebutuhanGuru: number
  tersedia: number
  selisih: number

  createdAt: string
  updatedAt: string
}

export interface GuruJabatanFormData {
  jabatanId: string
  periodeId?: string
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
  jamMengajarPerMinggu: number
}

export interface GuruJabatanKalkulasi {
  kebutuhanGuru: number
  tersedia: number
  selisih: number
}

export interface JabatanGuruFormData {
  namaJabatan: string
  kode?: string
  jamStandar: number
  isBK: boolean
  deskripsi?: string
}
