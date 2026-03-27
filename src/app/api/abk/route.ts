// src/app/api/abk/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rekap = searchParams.get('rekap');
    const anjabId = searchParams.get('anjabId');

    if (rekap === 'true') {
      const abkList = await prisma.aBK.findMany({
        include: {
          anjab: {
            include: {
              jabatan: {
                include: {
                  unitOrganisasi: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = abkList.map((a) => ({
        id: a.id,
        jabatan: {
          id: a.anjab.jabatan.id,
          kodeJabatan: a.anjab.jabatan.kodeJabatan,
          namaJabatan: a.anjab.jabatan.namaJabatan,
          jenisJabatan: a.anjab.jabatan.jenisJabatan,
          unitOrganisasi: a.anjab.jabatan.unitOrganisasi
            ? { namaUnit: a.anjab.jabatan.unitOrganisasi.namaUnit }
            : null,
        },
        totalBebanKerja: a.totalBebanKerja ?? 0,
        efektivitasNilai: a.efektivitasNilai ?? 0,
        efektivitasJabatan: a.efektivitasJabatan ?? null,
        kebutuhanPegawai: a.kebutuhanPegawai ?? 0,
        statusKebutuhan: a.statusKebutuhan ?? null,
      }));

      return NextResponse.json({ data });
    }

    if (anjabId) {
      const abk = await prisma.aBK.findUnique({ where: { anjabId } });
      return NextResponse.json({ data: abk });
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('[abk GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      anjabId, detailBebanKerja, totalBebanKerja,
      efektivitasNilai, efektivitasJabatan,
      kebutuhanPegawai, statusKebutuhan, jumlahKurangLebih,
    } = body;

    if (!anjabId) return NextResponse.json({ error: 'anjabId wajib diisi' }, { status: 400 });

    const anjab = await prisma.anjab.findUnique({ where: { id: anjabId } });
    if (!anjab) return NextResponse.json({ error: 'ANJAB tidak ditemukan' }, { status: 404 });

    const existing = await prisma.aBK.findUnique({ where: { anjabId } });
    if (existing) {
      const updated = await prisma.aBK.update({
        where: { anjabId },
        data: {
          detailBebanKerja: detailBebanKerja ?? [],
          totalBebanKerja: totalBebanKerja ?? 0,
          efektivitasNilai: efektivitasNilai ?? 0,
          efektivitasJabatan: efektivitasJabatan ?? null,
          kebutuhanPegawai: kebutuhanPegawai ?? 0,
          statusKebutuhan: statusKebutuhan ?? null,
          jumlahKurangLebih: jumlahKurangLebih ?? 0,
        },
      });
      return NextResponse.json(updated);
    }

    const abk = await prisma.aBK.create({
      data: {
        anjabId,
        detailBebanKerja: detailBebanKerja ?? [],
        totalBebanKerja: totalBebanKerja ?? 0,
        efektivitasNilai: efektivitasNilai ?? 0,
        efektivitasJabatan: efektivitasJabatan ?? null,
        kebutuhanPegawai: kebutuhanPegawai ?? 0,
        statusKebutuhan: statusKebutuhan ?? null,
        jumlahKurangLebih: jumlahKurangLebih ?? 0,
      },
    });

    return NextResponse.json(abk, { status: 201 });
  } catch (error) {
    console.error('[abk POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}