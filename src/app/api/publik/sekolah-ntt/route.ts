// src/app/api/publik/sekolah-ntt/route.ts
//
// Proxy server-side ke Dapodik (dapo.dikdasmen.go.id)
// → Menghindari CORS karena fetch dilakukan dari server Next.js, bukan browser
//
// Endpoint yang diekspos ke frontend:
//   GET /api/publik/sekolah-ntt?bentuk=SMA         → semua SMA di NTT
//   GET /api/publik/sekolah-ntt?bentuk=SMK         → semua SMK di NTT
//   GET /api/publik/sekolah-ntt?bentuk=SLB         → semua SLB di NTT
//   GET /api/publik/sekolah-ntt                    → SMA + SMK + SLB digabung
//   GET /api/publik/sekolah-ntt?q=kupang           → filter nama (opsional)

import { NextResponse } from "next/server";

// Kode wilayah NTT di Dapodik = "240000"
const KODE_NTT = "240000";

// Endpoint rekap sekolah per-jenjang dari Dapodik (tidak butuh auth)
// Format: /rekap/sp?id={BENTUK}&id_level_wilayah=1&kode_wilayah={KODE}
const DAPO_BASE = "https://dapo.dikdasmen.go.id";

interface DapoSekolah {
  sekolah_id: string;
  npsn: string;
  nama: string;
  bentuk_pendidikan: string;
  status_sekolah: string;
  kode_wilayah: string;
  nama_kabupaten_kota?: string;
  nama_kecamatan?: string;
  alamat_jalan?: string;
  lintang?: string;
  bujur?: string;
}

interface SekolahPublik {
  id: string;          // sekolah_id dari Dapodik
  npsn: string;
  nama: string;
  jenisSekolah: "SMA" | "SMK" | "SLB";
  status: string;      // "Negeri" | "Swasta"
  kabupatenKota: string;
  kecamatan: string;
  alamat: string;
}

// Cache sederhana in-memory agar tidak hammer Dapodik tiap request
// TTL 1 jam (data sekolah berubah sangat jarang)
const cache: { data: SekolahPublik[] | null; ts: number } = { data: null, ts: 0 };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam

async function fetchBentuk(bentuk: string): Promise<SekolahPublik[]> {
  // Dapodik mengembalikan data per-halaman, kita ambil semua halaman
  const results: SekolahPublik[] = [];
  let page = 1;
  const perPage = 100; // Dapodik default 100

  while (true) {
    const url = `${DAPO_BASE}/rekap/sp?id=${bentuk}&id_level_wilayah=1&kode_wilayah=${KODE_NTT}&page=${page}&per_page=${perPage}`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; E-SIPKG/1.0)",
        },
        next: { revalidate: 3600 }, // Next.js cache 1 jam
      });
    } catch (e) {
      console.error(`[sekolah-ntt] fetch gagal page ${page} bentuk ${bentuk}:`, e);
      break;
    }

    if (!res.ok) break;

    let json: any;
    try {
      json = await res.json();
    } catch {
      break;
    }

    // Dapodik bisa bungkus dalam { data: [...] } atau langsung array
    const rows: DapoSekolah[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
      ? json.data
      : [];

    if (rows.length === 0) break;

    for (const s of rows) {
      results.push({
        id: s.sekolah_id || s.npsn,
        npsn: s.npsn,
        nama: s.nama,
        jenisSekolah: bentuk as "SMA" | "SMK" | "SLB",
        status: s.status_sekolah === "N" || s.status_sekolah?.toLowerCase().includes("negeri")
          ? "Negeri"
          : "Swasta",
        kabupatenKota: s.nama_kabupaten_kota || "",
        kecamatan: s.nama_kecamatan || "",
        alamat: s.alamat_jalan || "",
      });
    }

    // Kalau halaman ini tidak penuh, sudah selesai
    if (rows.length < perPage) break;
    page++;

    // Safety: maksimal 20 halaman per bentuk (2000 sekolah)
    if (page > 20) break;
  }

  return results;
}

async function getAllSekolahNTT(): Promise<SekolahPublik[]> {
  // Cek cache
  if (cache.data && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  // Fetch paralel untuk SMA, SMK, SLB
  const [sma, smk, slb] = await Promise.all([
    fetchBentuk("SMA"),
    fetchBentuk("SMK"),
    fetchBentuk("SLB"),
  ]);

  const all = [...sma, ...smk, ...slb].sort((a, b) =>
    a.nama.localeCompare(b.nama, "id")
  );

  cache.data = all;
  cache.ts = Date.now();

  return all;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bentuk = searchParams.get("bentuk")?.toUpperCase() || "";
    const q = searchParams.get("q")?.toLowerCase() || "";

    let data = await getAllSekolahNTT();

    // Filter per bentuk jika diminta
    if (bentuk && ["SMA", "SMK", "SLB"].includes(bentuk)) {
      data = data.filter((s) => s.jenisSekolah === bentuk);
    }

    // Filter nama jika ada query pencarian
    if (q) {
      data = data.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.npsn.includes(q) ||
          s.kabupatenKota.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      { data, total: data.length, source: "Dapodik Kemdikbud" },
      {
        headers: {
          // Boleh di-cache browser/CDN 30 menit
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/publik/sekolah-ntt]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sekolah dari Dapodik" },
      { status: 500 }
    );
  }
}