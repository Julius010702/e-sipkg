// ============================================================
// KALKULASI KEBUTUHAN GURU - e-SIPKG
// ============================================================

/**
 * Hitung kebutuhan guru mapel (non-BK)
 * Formula: (jamMengajar × jumlahRombel) / 24
 */
export function hitungKebutuhanGuruMapel(
  jamMengajarPerMinggu: number,
  jumlahRombel: number
): number {
  if (jamMengajarPerMinggu <= 0 || jumlahRombel <= 0) return 0
  return Math.round((jamMengajarPerMinggu * jumlahRombel) / 24)
}

/**
 * Hitung kebutuhan guru BK
 * Formula: jumlahSiswa / 150
 */
export function hitungKebutuhanGuruBK(jumlahSiswa: number): number {
  if (jumlahSiswa <= 0) return 0
  return Math.round(jumlahSiswa / 150)
}

/**
 * Hitung total guru tersedia
 */
export function hitungTersedia(pns: number, pppk: number): number {
  return (pns || 0) + (pppk || 0)
}

/**
 * Hitung selisih (+ = kurang, - = lebih)
 */
export function hitungSelisih(kebutuhan: number, tersedia: number): number {
  return kebutuhan - tersedia
}

export interface KalkulasiInput {
  isBK: boolean
  jamMengajarPerMinggu: number
  jumlahRombel: number
  jumlahSiswa: number
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
}

export interface KalkulasiResult {
  kebutuhanGuru: number
  tersedia: number
  selisih: number
}

export function hitungKebutuhan(input: KalkulasiInput): KalkulasiResult {
  const kebutuhanGuru = input.isBK
    ? hitungKebutuhanGuruBK(input.jumlahSiswa)
    : hitungKebutuhanGuruMapel(input.jamMengajarPerMinggu, input.jumlahRombel)

  const tersedia = hitungTersedia(
    input.jumlahGuruPNS,
    input.jumlahGuruPPPK
  )

  const selisih = hitungSelisih(kebutuhanGuru, tersedia)

  return { kebutuhanGuru, tersedia, selisih }
}

export function labelStatusGuru(selisih: number): {
  label: string
  status: 'kurang' | 'cukup' | 'lebih'
} {
  if (selisih > 0) return { label: `Kurang ${selisih} guru`, status: 'kurang' }
  if (selisih < 0) return { label: `Lebih ${Math.abs(selisih)} guru`, status: 'lebih' }
  return { label: 'Terpenuhi', status: 'cukup' }
}