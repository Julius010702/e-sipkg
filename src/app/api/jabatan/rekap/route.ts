import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'

const VALID_JENJANG = ['AHLI_PERTAMA', 'AHLI_MUDA', 'AHLI_MADYA', 'AHLI_UTAMA'] as const
type JenjangVal = typeof VALID_JENJANG[number]

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || !['BIRO', 'ADMIN'].includes(session.role)) {
    return apiError('Forbidden', 403)
  }

  const { searchParams } = new URL(req.url)
  const jenjang   = searchParams.get('jenjangJabatan')
  const wilayahId = searchParams.get('wilayahId')
  const periodeId = searchParams.get('periodeId')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (jenjang && (VALID_JENJANG as readonly string[]).includes(jenjang)) {
    where.jenjangJabatan = jenjang as JenjangVal
  }
  if (wilayahId) where.sekolah   = { wilayahId }
  if (periodeId) where.periodeId = periodeId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await (prisma.guruJabatan as any).findMany({
    where,
    include: {
      sekolah: { include: { wilayah: true } },
    },
    orderBy: [{ namaJabatan: 'asc' }, { jenjangJabatan: 'asc' }],
  })

  const map = new Map<string, {
    namaJabatan:    string
    jenjangJabatan: string
    isBK:           boolean
    jumlahSekolah:  number
    totalKebutuhan: number
    totalPNS:       number
    totalPPPK:      number
    totalASN:       number
    totalSelisih:   number
  }>()

  for (const g of rows) {
    const key = `${g.namaJabatan}|||${g.jenjangJabatan}`
    const asn = g.jumlahGuruPNS + g.jumlahGuruPPPK
    const keb = Math.round(g.kebutuhanGuru)

    if (map.has(key)) {
      const e = map.get(key)!
      e.jumlahSekolah  += 1
      e.totalKebutuhan += keb
      e.totalPNS       += g.jumlahGuruPNS
      e.totalPPPK      += g.jumlahGuruPPPK
      e.totalASN       += asn
      e.totalSelisih   += asn - keb
    } else {
      map.set(key, {
        namaJabatan:    g.namaJabatan,
        jenjangJabatan: g.jenjangJabatan,
        isBK:           g.isBK,
        jumlahSekolah:  1,
        totalKebutuhan: keb,
        totalPNS:       g.jumlahGuruPNS,
        totalPPPK:      g.jumlahGuruPPPK,
        totalASN:       asn,
        totalSelisih:   asn - keb,
      })
    }
  }

  const data = Array.from(map.values()).sort((a, b) =>
    a.namaJabatan.localeCompare(b.namaJabatan)
  )

  // ✅ FIX: langsung pass `data`, bukan `{ data }`
  return apiResponse(data)
}