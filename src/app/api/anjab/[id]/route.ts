// src/app/api/anjab/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Coba cari berdasarkan jabatanId dulu
    let anjab = await prisma.anjab.findUnique({
      where: { jabatanId: params.id },
      include: { abk: true },
    });

    // Fallback: cari berdasarkan anjabId
    if (!anjab) {
      anjab = await prisma.anjab.findUnique({
        where: { id: params.id },
        include: { abk: true },
      });
    }

    if (!anjab) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(anjab);
  } catch (error) {
    console.error('[anjab GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { progressPersen = 0, jabatanId: _j, ...fields } = body;

    const anjab = await prisma.anjab.update({
      where: { id: params.id },
      data: {
        ikhtisarJabatan: fields.ikhtisarJabatan ?? null,
        uraianTugas: fields.uraianTugas ?? null,
        bahanKerja: fields.bahanKerja ?? [],
        perangkatKerja: fields.perangkatKerja ?? [],
        hasilKerja: fields.hasilKerja ?? [],
        tanggungjawab: fields.tanggungjawab ?? [],
        pangkatGolonganTerendah: fields.pangkatGolonganTerendah ?? null,
        pangkatGolonganTertinggi: fields.pangkatGolonganTertinggi ?? null,
        pendidikanTerendah: fields.pendidikanTerendah ?? null,
        bidangPendidikanTerendah: fields.bidangPendidikanTerendah ?? null,
        pendidikanTertinggi: fields.pendidikanTertinggi ?? null,
        bidangPendidikanTertinggi: fields.bidangPendidikanTertinggi ?? null,
        kursusPelatihanPemimpin: fields.kursusPelatihanPemimpin ?? [],
        pengalamanKerja: fields.pengalamanKerja ?? [],
        pengetahuan: fields.pengetahuan ?? [],
        keterampilan: fields.keterampilan ?? [],
        progressPersen,
      },
    });

    return NextResponse.json(anjab);
  } catch (error) {
    console.error('[anjab PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.anjab.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[anjab DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}