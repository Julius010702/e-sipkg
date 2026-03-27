// src/app/api/master/type-unit-kerja/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await prisma.typeUnitKerja.findMany({
      orderBy: { nama: 'asc' },
      include: { _count: { select: { opd: true } } },
    });

    // ✅ Wrap dengan { data }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[type-unit-kerja GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama } = await request.json();
    if (!nama?.trim()) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
    }

    const existing = await prisma.typeUnitKerja.findUnique({ where: { nama: nama.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Type Unit Kerja sudah ada' }, { status: 409 });
    }

    const data = await prisma.typeUnitKerja.create({
      data: { nama: nama.trim() },
      include: { _count: { select: { opd: true } } },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[type-unit-kerja POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, nama } = await request.json();
    if (!id || !nama?.trim()) {
      return NextResponse.json({ error: 'id dan nama wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.typeUnitKerja.findFirst({
      where: { nama: nama.trim(), NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Nama sudah digunakan' }, { status: 409 });
    }

    const data = await prisma.typeUnitKerja.update({
      where: { id },
      data: { nama: nama.trim() },
      include: { _count: { select: { opd: true } } },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[type-unit-kerja PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id wajib disertakan' }, { status: 400 });

    const count = await prisma.oPD.count({ where: { typeUnitKerjaId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} OPD yang menggunakan type ini.` },
        { status: 400 }
      );
    }

    await prisma.typeUnitKerja.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[type-unit-kerja DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}