// src/app/api/anjab/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rekap = searchParams.get('rekap');
    const jabatanId = searchParams.get('jabatanId');

    if (rekap === 'true') {
      // Rekap semua ANJAB untuk Admin Pusat
      const anjabList = await prisma.anjab.findMany({
        include: {
          jabatan: {
            include: {
              unitOrganisasi: true,
              sekolah: { select: { id: true, nama: true } },
              opd: { select: { id: true, nama: true } },
            },
          },
          abk: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = anjabList.map((a) => ({
        id: a.jabatan.id,
        namaJabatan: a.jabatan.namaJabatan,
        kodeJabatan: a.jabatan.kodeJabatan,
        jenisJabatan: a.jabatan.jenisJabatan,
        namaSekolah: a.jabatan.sekolah?.nama || null,
        namaOPD: a.jabatan.opd?.nama || null,
        progressAnjab: a.progressPersen,
        statusABK: a.abk?.statusKebutuhan || null,
        efektivitasJabatan: a.abk?.efektivitasJabatan || null,
        kebutuhanPegawai: a.abk?.kebutuhanPegawai || null,
      }));

      return NextResponse.json({ data });
    }

    if (jabatanId) {
      const anjab = await prisma.anjab.findUnique({
        where: { jabatanId },
        include: { abk: true },
      });
      return NextResponse.json({ data: anjab });
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('[anjab GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { jabatanId, progressPersen = 0, ...fields } = body;

    if (!jabatanId) return NextResponse.json({ error: 'jabatanId wajib diisi' }, { status: 400 });

    const jabatan = await prisma.jabatan.findUnique({ where: { id: jabatanId } });
    if (!jabatan) return NextResponse.json({ error: 'Jabatan tidak ditemukan' }, { status: 404 });

    const existing = await prisma.anjab.findUnique({ where: { jabatanId } });
    if (existing) {
      return NextResponse.json({ error: 'ANJAB sudah ada. Gunakan PUT.' }, { status: 409 });
    }

    const anjab = await prisma.anjab.create({
      data: {
        jabatanId,
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

    return NextResponse.json(anjab, { status: 201 });
  } catch (error) {
    console.error('[anjab POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}