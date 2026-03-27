// src/app/api/abk/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const abk = await prisma.aBK.findUnique({ where: { id: params.id } });
    if (!abk) return NextResponse.json({ error: 'ABK tidak ditemukan' }, { status: 404 });

    return NextResponse.json(abk);
  } catch (error) {
    console.error('[abk GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const abk = await prisma.aBK.update({
      where: { id: params.id },
      data: {
        detailBebanKerja: body.detailBebanKerja ?? [],
        totalBebanKerja: body.totalBebanKerja ?? 0,
        efektivitasNilai: body.efektivitasNilai ?? 0,
        efektivitasJabatan: body.efektivitasJabatan ?? null,
        kebutuhanPegawai: body.kebutuhanPegawai ?? 0,
        statusKebutuhan: body.statusKebutuhan ?? null,
        jumlahKurangLebih: body.jumlahKurangLebih ?? 0,
      },
    });

    return NextResponse.json(abk);
  } catch (error) {
    console.error('[abk PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.aBK.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[abk DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}