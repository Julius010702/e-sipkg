// src/app/api/master/opd/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama, indukUnitKerja, kawil, typeUnitKerjaId } = await request.json();

    if (!nama?.trim() || !typeUnitKerjaId) {
      return NextResponse.json({ error: 'Nama dan Type Unit Kerja wajib diisi' }, { status: 400 });
    }

    const data = await prisma.oPD.update({
      where: { id: params.id },
      data: {
        nama: nama.trim(),
        indukUnitKerja: indukUnitKerja?.trim() || null,
        kawil: kawil?.trim() || null,
        typeUnitKerjaId,
      },
      include: {
        typeUnitKerja: true,
        _count: { select: { unitOrganisasi: true } },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[opd/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await prisma.unitOrganisasi.count({ where: { opdId: params.id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} unit organisasi terhubung.` },
        { status: 400 }
      );
    }

    await prisma.oPD.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[opd/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}