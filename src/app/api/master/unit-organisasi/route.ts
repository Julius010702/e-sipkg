// src/app/api/master/unit-organisasi/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const opdId = searchParams.get('opdId') || '';

    const data = await prisma.unitOrganisasi.findMany({
      where: {
        ...(search ? { namaUnit: { contains: search, mode: 'insensitive' } } : {}),
        ...(opdId ? { opdId } : {}),
      },
      orderBy: { namaUnit: 'asc' },
      include: {
        opd: true,
        eselon: true,
        _count: { select: { jabatan: true } },
      },
    });

    // ✅ Wrap dengan { data }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[unit-organisasi GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { namaUnit, opdId, eselonId } = await request.json();
    if (!namaUnit?.trim() || !opdId || !eselonId) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const data = await prisma.unitOrganisasi.create({
      data: { namaUnit: namaUnit.trim(), opdId, eselonId },
      include: {
        opd: true,
        eselon: true,
        _count: { select: { jabatan: true } },
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[unit-organisasi POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, namaUnit, opdId, eselonId } = await request.json();
    if (!id || !namaUnit?.trim() || !opdId || !eselonId) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const data = await prisma.unitOrganisasi.update({
      where: { id },
      data: { namaUnit: namaUnit.trim(), opdId, eselonId },
      include: {
        opd: true,
        eselon: true,
        _count: { select: { jabatan: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[unit-organisasi PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id wajib disertakan' }, { status: 400 });

    const count = await prisma.jabatan.count({ where: { unitOrganisasiId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} jabatan terhubung.` },
        { status: 400 }
      );
    }

    await prisma.unitOrganisasi.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[unit-organisasi DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}