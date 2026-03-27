// src/app/api/master/opd/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const typeUnitKerjaId = searchParams.get('typeUnitKerjaId') || '';

    const data = await prisma.oPD.findMany({
      where: {
        ...(search ? { nama: { contains: search, mode: 'insensitive' } } : {}),
        ...(typeUnitKerjaId ? { typeUnitKerjaId } : {}),
      },
      orderBy: [{ kawil: 'asc' }, { nama: 'asc' }],
      include: {
        typeUnitKerja: true,
        _count: { select: { sekolah: true, jabatan: true } },
      },
    });

    // ✅ Wrap dengan { data }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[opd GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama, indukUnitKerja, kawil, typeUnitKerjaId } = await request.json();
    if (!nama?.trim() || !typeUnitKerjaId) {
      return NextResponse.json({ error: 'Nama dan Type Unit Kerja wajib diisi' }, { status: 400 });
    }

    const data = await prisma.oPD.create({
      data: {
        nama: nama.trim(),
        indukUnitKerja: indukUnitKerja?.trim() || null,
        kawil: kawil?.trim() || null,
        typeUnitKerjaId,
      },
      include: {
        typeUnitKerja: true,
        _count: { select: { sekolah: true, jabatan: true } },
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[opd POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, nama, indukUnitKerja, kawil, typeUnitKerjaId } = await request.json();
    if (!id || !nama?.trim() || !typeUnitKerjaId) {
      return NextResponse.json({ error: 'id, nama, dan type wajib diisi' }, { status: 400 });
    }

    const data = await prisma.oPD.update({
      where: { id },
      data: {
        nama: nama.trim(),
        indukUnitKerja: indukUnitKerja?.trim() || null,
        kawil: kawil?.trim() || null,
        typeUnitKerjaId,
      },
      include: {
        typeUnitKerja: true,
        _count: { select: { sekolah: true, jabatan: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[opd PUT]', error);
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

    const count = await prisma.unitOrganisasi.count({ where: { opdId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} unit organisasi terhubung.` },
        { status: 400 }
      );
    }

    await prisma.oPD.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[opd DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}