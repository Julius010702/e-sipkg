// src/app/api/master/jenis-jabatan/route.ts
// Mengembalikan enum JenisJabatan (STRUKTURAL | FUNGSIONAL | PELAKSANA)
// Tidak ada tabel di DB — hanya enum Prisma, jadi cukup return hardcoded list.

import { NextResponse } from "next/server";
import { getTokenPayload } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const payload = await getTokenPayload(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jenisJabatan = [
      { value: "STRUKTURAL", label: "Struktural" },
      { value: "FUNGSIONAL", label: "Fungsional" },
      { value: "PELAKSANA", label: "Pelaksana" },
    ];

    return NextResponse.json({ data: jenisJabatan });
  } catch (error) {
    console.error("[GET /api/master/jenis-jabatan]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}