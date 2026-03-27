// src/app/api/master/unit-organisasi/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { namaUnit, opdId, eselonId } = await request.json();

    if (!namaUnit?.trim() || !opdId || !eselonId) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const data = await prisma.unitOrganisasi.update({
      where: { id: params.id },
      data: { namaUnit: namaUnit.trim(), opdId, eselonId },
      include: {
        opd: true,
        eselon: true,
        _count: { select: { jabatan: true } },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[unit-organisasi/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await prisma.jabatan.count({ where: { unitOrganisasiId: params.id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} jabatan terhubung.` },
        { status: 400 }
      );
    }

    await prisma.unitOrganisasi.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[unit-organisasi/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}