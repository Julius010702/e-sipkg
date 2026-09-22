import { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { hitungKebutuhan } from '@/lib/kalkulasi'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Unauthorized', 401)

  const body = await req.json()
  const {
    isBK, jamMengajarPerMinggu, jumlahRombel,
    jumlahSiswa, jumlahGuruPNS, jumlahGuruPPPK,
  } = body

  const result = hitungKebutuhan({
    isBK:                 !!isBK,
    jamMengajarPerMinggu: Number(jamMengajarPerMinggu) || 24,
    jumlahRombel:         Number(jumlahRombel) || 0,
    jumlahSiswa:          Number(jumlahSiswa) || 0,
    jumlahGuruPNS:        Number(jumlahGuruPNS) || 0,
    jumlahGuruPPPK:       Number(jumlahGuruPPPK) || 0,
  })

  return apiResponse(result)
}