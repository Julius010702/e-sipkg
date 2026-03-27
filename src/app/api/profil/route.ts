// src/app/api/profil/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenPayload } from "@/lib/auth";

// ─── GET /api/profil ──────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId =
      payload.role === "ADMIN_SEKOLAH"
        ? payload.sekolahId
        : new URL(req.url).searchParams.get("sekolahId");

    if (!sekolahId) {
      return NextResponse.json(
        { error: "sekolahId tidak ditemukan" },
        { status: 400 }
      );
    }

    const sekolah = await prisma.sekolah.findUnique({
      where: { id: sekolahId },
      select: {
        id: true,
        npsn: true,
        nama: true,
        jenisSekolah: true,
        alamat: true,
        kecamatan: true,
        kabupatenKota: true,
        provinsi: true,
        telepon: true,
        email: true,
        logoUrl: true,
        kepalaSekolah: true,
        wakilKepala: true,
        sekretaris: true,
        aktif: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!sekolah) {
      return NextResponse.json(
        { error: "Sekolah tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: sekolah });
  } catch (error) {
    console.error("[GET /api/profil]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT /api/profil ──────────────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId =
      payload.role === "ADMIN_SEKOLAH"
        ? payload.sekolahId
        : new URL(req.url).searchParams.get("sekolahId");

    if (!sekolahId) {
      return NextResponse.json(
        { error: "sekolahId tidak ditemukan" },
        { status: 400 }
      );
    }

    const existing = await prisma.sekolah.findUnique({
      where: { id: sekolahId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Sekolah tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      npsn,
      nama,
      jenisSekolah,
      alamat,
      kecamatan,
      kabupatenKota,
      provinsi,
      telepon,
      email,
      logoUrl,
      kepalaSekolah,
      wakilKepala,
      sekretaris,
    } = body;

    // Validasi jenisSekolah jika dikirim
    const VALID_JENIS = ["SMA", "SMK", "SLB"];
    if (jenisSekolah && !VALID_JENIS.includes(jenisSekolah)) {
      return NextResponse.json(
        { error: "jenisSekolah harus salah satu dari: SMA, SMK, SLB" },
        { status: 400 }
      );
    }

    // Validasi npsn unik jika diubah
    if (npsn && npsn !== existing.npsn) {
      const npsnExist = await prisma.sekolah.findUnique({ where: { npsn } });
      if (npsnExist) {
        return NextResponse.json(
          { error: "NPSN sudah digunakan sekolah lain" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.sekolah.update({
      where: { id: sekolahId },
      data: {
        ...(npsn          !== undefined && { npsn: npsn || null }),
        ...(nama          !== undefined && { nama }),
        ...(jenisSekolah  !== undefined && { jenisSekolah }),
        ...(alamat        !== undefined && { alamat: alamat || null }),
        ...(kecamatan     !== undefined && { kecamatan: kecamatan || null }),
        ...(kabupatenKota !== undefined && { kabupatenKota: kabupatenKota || null }),
        ...(provinsi      !== undefined && { provinsi }),
        ...(telepon       !== undefined && { telepon: telepon || null }),
        ...(email         !== undefined && { email: email || null }),
        ...(logoUrl       !== undefined && { logoUrl: logoUrl || null }),
        ...(kepalaSekolah !== undefined && { kepalaSekolah: kepalaSekolah || null }),
        ...(wakilKepala   !== undefined && { wakilKepala: wakilKepala || null }),
        ...(sekretaris    !== undefined && { sekretaris: sekretaris || null }),
      },
      select: {
        id: true,
        npsn: true,
        nama: true,
        jenisSekolah: true,
        alamat: true,
        kecamatan: true,
        kabupatenKota: true,
        provinsi: true,
        telepon: true,
        email: true,
        logoUrl: true,
        kepalaSekolah: true,
        wakilKepala: true,
        sekretaris: true,
        aktif: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PUT /api/profil]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}