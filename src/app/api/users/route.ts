import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/utils'
import { logActivity } from '@/lib/activity-log'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await (prisma.user as any).findMany({
    select: {
      id:        true,
      nama:      true,
      email:     true,
      nip:       true,
      role:      true,
      isAktif:   true,
      sekolahId: true,
      sekolah:   { select: { nama: true } },
      wilayahId: true,
      wilayah:   { select: { nama: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return apiResponse(data)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

  const body = await req.json()
  const { email, password, nama, role, nip } = body

  // Semua peran (Sekolah, Wilayah, Biro, Admin) login memakai NIP.
  if (!nip?.trim())                     return apiError('NIP wajib diisi')
  if (!password || password.length < 6) return apiError('Password minimal 6 karakter')
  if (!nama?.trim())                    return apiError('Nama wajib diisi')
  if (!['ADMIN', 'BIRO', 'WILAYAH', 'SEKOLAH'].includes(role)) return apiError('Role tidak valid')

  try {
    const hashed = await bcrypt.hash(password, 10)
    let sekolahId: string | null = null
    let wilayahId: string | null = null

    if (role === 'SEKOLAH') {
      if (!body.namaSekolah?.trim())  return apiError('Nama sekolah wajib diisi')
      if (!['SMA', 'SMK', 'SLB'].includes(body.jenisSekolah)) {
        return apiError('Jenis sekolah tidak valid')
      }
      if (!body.wilayahId) return apiError('Wilayah wajib dipilih')

      const wilayah = await prisma.wilayah.findUnique({ where: { id: body.wilayahId } })
      if (!wilayah) return apiError('Wilayah tidak ditemukan')

      const sekolahBaru = await prisma.sekolah.create({
        data: {
          nama:         body.namaSekolah.trim(),
          jenisSekolah: body.jenisSekolah,
          wilayahId:    body.wilayahId,
          statusData:   'DRAFT',
        },
      })
      sekolahId = sekolahBaru.id
    }

    // Akun WILAYAH: hanya perlu dikaitkan ke satu wilayah (kabupaten/kota)
    // untuk akses monitoring read-only — tidak membuat data Sekolah baru.
    if (role === 'WILAYAH') {
      if (!body.wilayahId) return apiError('Wilayah wajib dipilih untuk akun Wilayah')
      const wilayah = await prisma.wilayah.findUnique({ where: { id: body.wilayahId } })
      if (!wilayah) return apiError('Wilayah tidak ditemukan')
      wilayahId = body.wilayahId
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await (prisma.user as any).create({
      data: {
        nip:       nip.trim(),
        password:  hashed,
        nama:      nama.trim(),
        role,
        email:     email?.trim() ? email.trim().toLowerCase() : null,
        isAktif:   true,
        sekolahId,
        wilayahId,
      },
      select: {
        id:        true,
        nama:      true,
        email:     true,
        nip:       true,
        role:      true,
        isAktif:   true,
        sekolahId: true,
        wilayahId: true,
      },
    })

    await logActivity(session.id, session.nama, `Menambahkan pengguna baru: ${nama.trim()}`)

    return apiResponse(data, 201)

  } catch (e: unknown) {    if ((e as { code?: string }).code === 'P2002') {
      return apiError('NIP atau email sudah terdaftar')
    }
    console.error('[POST /api/users]', e)
    return apiError('Gagal membuat pengguna', 500)
  }
}
