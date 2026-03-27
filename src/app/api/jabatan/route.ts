// src/app/api/jabatan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const jenisJabatan = searchParams.get('jenisJabatan') || '';

    const where: any = {};

    if (session.role === 'ADMIN_SEKOLAH' && session.sekolahId) {
      where.sekolahId = session.sekolahId;
    }

    if (search) {
      where.OR = [
        { namaJabatan: { contains: search, mode: 'insensitive' } },
        { kodeJabatan: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (jenisJabatan) {
      where.jenisJabatan = jenisJabatan;
    }

    const jabatanList = await prisma.jabatan.findMany({
      where,
      include: {
        indukJabatan: { select: { id: true, namaJabatan: true } },
        unitOrganisasi: { select: { id: true, namaUnit: true } },
        urusan: { select: { id: true, nama: true } },
        anjab: {
          select: {
            progressPersen: true,
            abk: { select: { statusKebutuhan: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // ✅ Wrap dengan { data }
    return NextResponse.json({ data: jabatanList, total: jabatanList.length });
  } catch (error) {
    console.error('[jabatan GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      namaJabatan, kodeJabatan, jenisJabatan,
      indukJabatanId, unitOrganisasiId, urusanId,
    } = body;

    if (!namaJabatan || !jenisJabatan || !kodeJabatan) {
      return NextResponse.json({ error: 'namaJabatan, kodeJabatan, dan jenisJabatan wajib diisi' }, { status: 400 });
    }

    const jabatan = await prisma.jabatan.create({
      data: {
        namaJabatan,
        kodeJabatan,
        jenisJabatan,
        indukJabatanId: indukJabatanId || null,
        unitOrganisasiId: unitOrganisasiId || null,
        urusanId: urusanId || null,
        sekolahId: session.role === 'ADMIN_SEKOLAH' ? (session.sekolahId ?? null) : null,
      },
    });

    return NextResponse.json({ data: jabatan }, { status: 201 });
  } catch (error: any) {
    console.error('[jabatan POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode jabatan sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}