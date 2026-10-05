// app/api/admin/slide/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// GET tetap publik — dipakai halaman beranda untuk menampilkan banner
export async function GET() {
  const slides = await prisma.slide.findMany({
    orderBy: { urutan: 'asc' },
  })
  return NextResponse.json({ data: slides })
}

// POST wajib ADMIN — menambah slide baru
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }

  try {
    const body = await req.json()
    if (!body?.src) {
      return NextResponse.json({ error: 'URL gambar (src) wajib diisi' }, { status: 400 })
    }

    const maxUrutan = await prisma.slide.aggregate({ _max: { urutan: true } })
    const nextUrutan = (maxUrutan._max.urutan ?? -1) + 1

    const newSlide = await prisma.slide.create({
      data: {
        src:    String(body.src),
        alt:    String(body.alt || 'Banner e-SIPKG NTT'),
        urutan: typeof body.urutan === 'number' ? body.urutan : nextUrutan,
        aktif:  body.aktif !== false,
      },
    })

    return NextResponse.json({ data: newSlide }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Gagal menambah slide' }, { status: 500 })
  }
}