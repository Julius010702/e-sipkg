// src/app/api/bezeting/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const jabatanId = searchParams.get('jabatanId');
    const rekap = searchParams.get('rekap');

    if (rekap === 'true') {
      // Rekap semua bezeting untuk Admin Pusat
      const bezetingList = await prisma.bezeting.findMany({
        include: {
          jabatan: {
            include: {
              unitOrganisasi: true,
              anjab: {
                include: { abk: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = bezetingList.map((b) => ({
        id: b.id,
        jabatanId: b.jabatanId,
        namaJabatan: b.namaJabatan,
        kodeJabatan: b.jabatan.kodeJabatan,
        jenisJabatan: b.jabatan.jenisJabatan,
        unitOrganisasi: b.jabatan.unitOrganisasi?.namaUnit || null,
        golonganSaranRendah: b.golonganSaranRendah,
        golonganSaranTinggi: b.golonganSaranTinggi,
        jumlahPNS: b.jumlahPNS,
        jumlahPPPK: b.jumlahPPPK,
        kebutuhanPegawai: b.jabatan.anjab?.abk?.kebutuhanPegawai || null,
        statusKebutuhan: b.jabatan.anjab?.abk?.statusKebutuhan || null,
      }));

      return NextResponse.json({ data });
    }

    // Get by jabatanId
    const data = await prisma.bezeting.findMany({
      where: jabatanId ? { jabatanId } : {},
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[bezeting GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { jabatanId, rows } = body;

    if (!jabatanId || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'jabatanId dan rows wajib diisi' }, { status: 400 });
    }

    const jabatan = await prisma.jabatan.findUnique({ where: { id: jabatanId } });
    if (!jabatan) return NextResponse.json({ error: 'Jabatan tidak ditemukan' }, { status: 404 });

    await prisma.bezeting.deleteMany({ where: { jabatanId } });

    await prisma.bezeting.createMany({
      data: rows.map((r: any) => ({
        jabatanId,
        namaJabatan: r.namaJabatan,
        golonganSaranRendah: r.golonganSaranRendah || null,
        golonganSaranTinggi: r.golonganSaranTinggi || null,
        jumlahPNS: r.jumlahPNS ?? 0,
        jumlahPPPK: r.jumlahPPPK ?? 0,
      })),
    });

    const result = await prisma.bezeting.findMany({ where: { jabatanId } });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('[bezeting POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}