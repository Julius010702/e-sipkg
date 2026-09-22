// app/api/admin/slide/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const existing = await prisma.slide.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Slide tidak ditemukan' }, { status: 404 })
    }

    const updated = await prisma.slide.update({
      where: { id: params.id },
      data: {
        src:    body.src    !== undefined ? String(body.src)    : undefined,
        alt:    body.alt    !== undefined ? String(body.alt)    : undefined,
        urutan: body.urutan !== undefined ? Number(body.urutan) : undefined,
        aktif:  body.aktif  !== undefined ? Boolean(body.aktif) : undefined,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Gagal memperbarui slide' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }

  try {
    const existing = await prisma.slide.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Slide tidak ditemukan' }, { status: 404 })
    }

    await prisma.slide.delete({ where: { id: params.id } })
    return NextResponse.json({ data: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Gagal menghapus slide' }, { status: 500 })
  }
}