// src/app/api/jabatan/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jabatan = await prisma.jabatan.findUnique({
      where: { id: params.id },
      include: {
        unitOrganisasi: true,
        urusan: true,
        anjab: {
          include: { abk: true },
        },
        bezeting: {
          orderBy: { createdAt: 'asc' },
        },
        pemangku: true,
      },
    });

    if (!jabatan) return NextResponse.json({ error: 'Jabatan tidak ditemukan' }, { status: 404 });

    return NextResponse.json(jabatan);
  } catch (error) {
    console.error('[jabatan/[id] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      namaJabatan,
      kodeJabatan,
      jenisJabatan,
      indukJabatanId,
      unitOrganisasiId,
      urusanId,
      // ❌ syaratJabatan tidak ada di schema Jabatan — dihapus
    } = body;

    const jabatan = await prisma.jabatan.update({
      where: { id: params.id },
      data: {
        namaJabatan,
        kodeJabatan,
        jenisJabatan,
        indukJabatanId: indukJabatanId || null,
        unitOrganisasiId: unitOrganisasiId || null,
        urusanId: urusanId || null,
        // ❌ syaratJabatan tidak ada di schema → simpan di ANJAB (syaratJabatan ada di ANJAB)
      },
      include: {
        unitOrganisasi: true,
        urusan: true,
      },
    });

    return NextResponse.json(jabatan);
  } catch (error) {
    console.error('[jabatan/[id] PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.jabatan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[jabatan/[id] DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}