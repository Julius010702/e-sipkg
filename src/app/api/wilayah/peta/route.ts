import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'

// ── GET /api/wilayah/peta ──────────────────────────────────────
// Data ringkasan per wilayah (kabupaten/kota) untuk ditampilkan sebagai
// titik di peta — dihitung langsung dari data terkini (bukan cache),
// supaya selalu "real-time" setiap kali di-poll oleh client.
// Sengaja PUBLIK (tanpa cek sesi) — dipakai juga di halaman beranda publik,
// dan datanya cuma agregat per wilayah, bukan data pribadi/sensitif.
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const wilayahList = await prisma.wilayah.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    include: { sekolah: { include: { guruJabatan: true } } },
    orderBy: { nama: 'asc' },
  })

  const data = wilayahList.map(w => {
    const jumlahSekolah = w.sekolah.length
    let kebutuhan = 0, pns = 0, pppk = 0
    for (const s of w.sekolah) {
      for (const g of s.guruJabatan) {
        kebutuhan += g.kebutuhanGuru
        pns  += g.jumlahGuruPNS
        pppk += g.jumlahGuruPPPK
      }
    }
    kebutuhan = Math.round(kebutuhan)
    const totalASN = pns + pppk
    const selisih = totalASN - kebutuhan
    return {
      id: w.id,
      nama: w.nama,
      latitude: w.latitude,
      longitude: w.longitude,
      jumlahSekolah,
      kebutuhan,
      totalASN,
      kurang: selisih < 0 ? Math.abs(selisih) : 0,
      lebih: selisih > 0 ? selisih : 0,
    }
  })

  return apiResponse(data)
}
