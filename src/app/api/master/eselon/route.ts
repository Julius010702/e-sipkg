// src/app/api/master/eselon/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await prisma.eselon.findMany({
      orderBy: { kode: 'asc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[eselon GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kode, nama } = await request.json();
    if (!kode?.trim() || !nama?.trim()) {
      return NextResponse.json({ error: 'Kode dan nama wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.eselon.findUnique({ where: { kode: kode.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Kode eselon sudah ada' }, { status: 409 });
    }

    const data = await prisma.eselon.create({
      data: { kode: kode.trim(), nama: nama.trim() },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[eselon POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN_PUSAT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, kode, nama } = await request.json();
    if (!id || !kode?.trim() || !nama?.trim()) {
      return NextResponse.json({ error: 'id, kode, dan nama wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.eselon.findFirst({
      where: { kode: kode.trim(), NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Kode sudah digunakan' }, { status: 409 });
    }

    const data = await prisma.eselon.update({
      where: { id },
      data: { kode: kode.trim(), nama: nama.trim() },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[eselon PUT]', error);
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

    const count = await prisma.unitOrganisasi.count({ where: { eselonId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Tidak dapat dihapus. Masih ada ${count} unit organisasi menggunakan eselon ini.` },
        { status: 400 }
      );
    }

    await prisma.eselon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[eselon DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}