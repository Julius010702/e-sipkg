// app/api/admin/kontak/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SINGLETON_ID = 'singleton'

// Default data jika belum ada di DB
const DEFAULT_DATA = {
  id:           SINGLETON_ID,
  unit:         'Bagian Kelembagaan dan Analisis Jabatan',
  alamat:       'Jl. El Tari No. 52, Kota Kupang, NTT',
  telepon:      '(0380) 821710',
  email:        'biroorganisasi@nttprov.go.id',
  jamKerja:     'Senin–Jumat, 07.30–16.00 WITA',
  namaInstansi: 'Biro Organisasi Setda',
  namaProvinsi: 'Provinsi Nusa Tenggara Timur',
  emailAkses:   'biroorganisasi@nttprov.go.id',
}

// ── GET — ambil data kontak (public, dipakai di halaman publik) ───────────────
export async function GET() {
  try {
    let data = await prisma.kontakInfo.findUnique({ where: { id: SINGLETON_ID } })
    if (!data) {
      // Auto-seed jika belum ada
      data = await prisma.kontakInfo.create({ data: DEFAULT_DATA })
    }
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: DEFAULT_DATA })
  }
}

// ── PUT — update data kontak (hanya superadmin) ───────────────────────────────
export async function PUT(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { unit, alamat, telepon, email, jamKerja, namaInstansi, namaProvinsi, emailAkses } = body

    // Validasi sederhana
    if (!unit || !alamat || !telepon || !email || !jamKerja) {
      return NextResponse.json({ error: 'Field wajib tidak boleh kosong' }, { status: 400 })
    }

    const data = await prisma.kontakInfo.upsert({
      where:  { id: SINGLETON_ID },
      update: { unit, alamat, telepon, email, jamKerja, namaInstansi, namaProvinsi, emailAkses },
      create: { id: SINGLETON_ID, unit, alamat, telepon, email, jamKerja, namaInstansi, namaProvinsi, emailAkses },
    })

    return NextResponse.json({ data, message: 'Data kontak berhasil disimpan' })
  } catch (err) {
    console.error('[KONTAK PUT]', err)
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
  }
}