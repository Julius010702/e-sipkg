// src/app/api/master/type-unit-kerja/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama } = await request.json();
    if (!nama?.trim()) {
      return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
    }

    // Cek duplikat nama (kecuali dirinya sendiri)
    const existing = await prisma.typeUnitKerja.findFirst({
      where: { nama: nama.trim(), NOT: { id: params.id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Nama sudah digunakan' }, { status: 409 });
    }

    const data = await prisma.typeUnitKerja.update({
      where: { id: params.id },
      data: { nama: nama.trim() },
      include: { _count: { select: { opd: true } } },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[type-unit-kerja PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cek apakah masih ada OPD terhubung
    const count = await prisma.oPD.count({ where: { typeUnitKerjaId: params.id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} OPD yang menggunakan type ini.` },
        { status: 400 }
      );
    }

    await prisma.typeUnitKerja.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[type-unit-kerja DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}