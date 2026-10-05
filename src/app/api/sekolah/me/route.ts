// app/api/sekolah/me/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session?.sekolahId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.sekolah.findUnique({
    where: { id: session.sekolahId },
    include: {
      wilayah: true,
      guruJabatan: true,
    },
  })

  if (!data) {
    return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session?.sekolahId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    nama, jenisSekolah, npsn, alamat, namaWilayah,
    jumlahSiswa, jumlahRombel, kepalaSekolah, nipKepala,
    fotoSekolah, fotoKepala,
  } = body

  // Cari / pastikan wilayah ada (sesuaikan dengan logic aslimu)
  const wilayah = await prisma.wilayah.findFirst({ where: { nama: namaWilayah } })
  if (!wilayah) {
    return NextResponse.json({ error: 'Kabupaten/Kota tidak ditemukan' }, { status: 400 })
  }

  const updated = await prisma.sekolah.update({
    where: { id: session.sekolahId },
    data: {
      nama,
      jenisSekolah,
      npsn,
      alamat,
      wilayahId: wilayah.id,
      jumlahSiswa,
      jumlahRombel,
      kepalaSekolah,
      nipKepala,
      fotoSekolah,
      fotoKepala,
    },
  })

  return NextResponse.json({ data: updated })
}

// ── PATCH /api/sekolah/me ───────────────────────────────────
// Update ringan untuk 1 field saja (dipakai form "Tambah/Filter Data Guru"
// untuk mengubah Jumlah Seluruh Siswa tanpa perlu resend seluruh profil).
export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session?.sekolahId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data: Record<string, number> = {}

  if (body.jumlahSiswa !== undefined) {
    const n = Number(body.jumlahSiswa)
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: 'Jumlah siswa tidak valid' }, { status: 400 })
    }
    data.jumlahSiswa = Math.round(n)
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Tidak ada data untuk diperbarui' }, { status: 400 })
  }

  const updated = await prisma.sekolah.update({
    where: { id: session.sekolahId },
    data,
  })

  return NextResponse.json({ data: updated })
}