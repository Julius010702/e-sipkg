// src/app/api/publik/sekolah-ntt/route.ts
//
// Mengambil data sekolah NTT (SMA/SMK/SLB) dari API Kemdikbud
// yang lebih stabil: referensi.data.kemdikbud.go.id
//
// Fallback chain:
//   1. referensi.data.kemdikbud.go.id  (API referensi Kemdikbud)
//   2. api.data.kemdikbud.go.id        (API data publik Kemdikbud)
//   3. dapo.dikdasmen.go.id            (Dapodik — cadangan)
//
// Endpoint yang diekspos:
//   GET /api/publik/sekolah-ntt             → SMA + SMK + SLB semua NTT
//   GET /api/publik/sekolah-ntt?bentuk=SMA  → hanya SMA
//   GET /api/publik/sekolah-ntt?q=kupang    → filter nama

import { NextResponse } from "next/server";

// ─── Kode wilayah NTT ────────────────────────────────────────────────────────
// referensi.data.kemdikbud: kode provinsi NTT = "53" (kode BPS)
const KODE_PROV_NTT = "53";

// Mapping jenis sekolah → kode bentuk di Kemdikbud
const BENTUK_KODE: Record<string, string> = {
  SMA: "13",
  SMK: "15",
  SLB: "16",
};

interface SekolahPublik {
  id:            string;
  npsn:          string;
  nama:          string;
  jenisSekolah:  "SMA" | "SMK" | "SLB";
  status:        string;
  kabupatenKota: string;
  kecamatan:     string;
  alamat:        string;
}

// ─── Cache in-memory (TTL 1 jam) ─────────────────────────────────────────────
const cache: { data: SekolahPublik[] | null; ts: number } = { data: null, ts: 0 };
const CACHE_TTL = 60 * 60 * 1000;

// ─── Strategi 1: referensi.data.kemdikbud.go.id ──────────────────────────────
async function fetchFromReferensi(bentuk: string): Promise<SekolahPublik[] | null> {
  const kodeBentuk = BENTUK_KODE[bentuk];
  if (!kodeBentuk) return null;

  const results: SekolahPublik[] = [];
  let start = 0;
  const length = 100;

  for (let page = 0; page < 30; page++) {
    // Endpoint: /api/sekolah dengan filter provinsi & bentuk
    const url =
      `https://referensi.data.kemdikbud.go.id/api/sekolah` +
      `?kode_wilayah=${KODE_PROV_NTT}` +
      `&bentuk_pendidikan_id=${kodeBentuk}` +
      `&start=${start}&length=${length}`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; E-SIPKG/1.0)",
        },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      break;
    }

    if (!res.ok) break;

    let json: any;
    try { json = await res.json(); } catch { break; }

    // Format referensi.data.kemdikbud: { data: [...], recordsTotal: N }
    const rows: any[] = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [];

    if (rows.length === 0) break;

    for (const s of rows) {
      results.push({
        id:            s.sekolah_id || s.npsn || String(Math.random()),
        npsn:          s.npsn        || "",
        nama:          s.nama        || s.sekolah || "",
        jenisSekolah:  bentuk as "SMA" | "SMK" | "SLB",
        status:
          s.status_sekolah === "N" || (s.status_sekolah || "").toLowerCase().includes("negeri")
            ? "Negeri"
            : "Swasta",
        kabupatenKota: s.nama_kabupaten_kota || s.kabupaten_kota || "",
        kecamatan:     s.nama_kecamatan      || s.kecamatan      || "",
        alamat:        s.alamat_jalan         || s.alamat          || "",
      });
    }

    if (rows.length < length) break;
    start += length;
  }

  return results.length > 0 ? results : null;
}

// ─── Strategi 2: api.data.kemdikbud.go.id ────────────────────────────────────
async function fetchFromApiKemdikbud(bentuk: string): Promise<SekolahPublik[] | null> {
  const results: SekolahPublik[] = [];
  let page = 1;

  for (let i = 0; i < 30; i++, page++) {
    const url =
      `https://api.data.kemdikbud.go.id/v1/sekolah/list` +
      `?provinsi=${KODE_PROV_NTT}&bentuk=${bentuk}&page=${page}&perpage=100`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "E-SIPKG/1.0" },
        signal: AbortSignal.timeout(10_000),
      });
    } catch { break; }

    if (!res.ok) break;

    let json: any;
    try { json = await res.json(); } catch { break; }

    const rows: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    if (rows.length === 0) break;

    for (const s of rows) {
      results.push({
        id:            s.sekolah_id || s.npsn || String(Math.random()),
        npsn:          s.npsn || "",
        nama:          s.nama || "",
        jenisSekolah:  bentuk as "SMA" | "SMK" | "SLB",
        status:        s.status === "N" ? "Negeri" : "Swasta",
        kabupatenKota: s.kabupaten_kota || "",
        kecamatan:     s.kecamatan || "",
        alamat:        s.alamat || "",
      });
    }

    if (rows.length < 100) break;
  }

  return results.length > 0 ? results : null;
}

// ─── Strategi 3: Dapodik (cadangan terakhir) ─────────────────────────────────
async function fetchFromDapodik(bentuk: string): Promise<SekolahPublik[]> {
  const KODE_NTT_DAPO = "240000";
  const results: SekolahPublik[] = [];
  let page = 1;

  for (let i = 0; i < 20; i++, page++) {
    const url =
      `https://dapo.dikdasmen.go.id/rekap/sp` +
      `?id=${bentuk}&id_level_wilayah=1&kode_wilayah=${KODE_NTT_DAPO}` +
      `&page=${page}&per_page=100`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; E-SIPKG/1.0)",
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch { break; }

    if (!res.ok) break;

    let json: any;
    try { json = await res.json(); } catch { break; }

    const rows: any[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
    if (rows.length === 0) break;

    for (const s of rows) {
      results.push({
        id:            s.sekolah_id || s.npsn,
        npsn:          s.npsn || "",
        nama:          s.nama || "",
        jenisSekolah:  bentuk as "SMA" | "SMK" | "SLB",
        status:
          s.status_sekolah === "N" || (s.status_sekolah || "").toLowerCase().includes("negeri")
            ? "Negeri"
            : "Swasta",
        kabupatenKota: s.nama_kabupaten_kota || "",
        kecamatan:     s.nama_kecamatan || "",
        alamat:        s.alamat_jalan || "",
      });
    }

    if (rows.length < 100) break;
  }

  return results;
}

// ─── Fetch satu bentuk dengan fallback ───────────────────────────────────────
async function fetchBentukWithFallback(bentuk: string): Promise<SekolahPublik[]> {
  // Coba strategi 1
  try {
    const r1 = await fetchFromReferensi(bentuk);
    if (r1 && r1.length > 0) {
      console.log(`[sekolah-ntt] ${bentuk}: ${r1.length} dari referensi.data.kemdikbud`);
      return r1;
    }
  } catch (e) {
    console.warn(`[sekolah-ntt] referensi.data.kemdikbud gagal untuk ${bentuk}:`, e);
  }

  // Coba strategi 2
  try {
    const r2 = await fetchFromApiKemdikbud(bentuk);
    if (r2 && r2.length > 0) {
      console.log(`[sekolah-ntt] ${bentuk}: ${r2.length} dari api.data.kemdikbud`);
      return r2;
    }
  } catch (e) {
    console.warn(`[sekolah-ntt] api.data.kemdikbud gagal untuk ${bentuk}:`, e);
  }

  // Coba strategi 3 (Dapodik)
  try {
    const r3 = await fetchFromDapodik(bentuk);
    if (r3.length > 0) {
      console.log(`[sekolah-ntt] ${bentuk}: ${r3.length} dari Dapodik`);
      return r3;
    }
  } catch (e) {
    console.warn(`[sekolah-ntt] Dapodik gagal untuk ${bentuk}:`, e);
  }

  console.warn(`[sekolah-ntt] Semua sumber gagal untuk ${bentuk}, return []`);
  return [];
}

// ─── Gabungkan semua bentuk ───────────────────────────────────────────────────
async function getAllSekolahNTT(): Promise<SekolahPublik[]> {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  const [sma, smk, slb] = await Promise.all([
    fetchBentukWithFallback("SMA"),
    fetchBentukWithFallback("SMK"),
    fetchBentukWithFallback("SLB"),
  ]);

  const all = [...sma, ...smk, ...slb].sort((a, b) =>
    a.nama.localeCompare(b.nama, "id")
  );

  console.log(`[sekolah-ntt] Total: ${all.length} sekolah (SMA:${sma.length} SMK:${smk.length} SLB:${slb.length})`);

  cache.data = all;
  cache.ts   = Date.now();

  return all;
}

// ─── GET handler ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bentuk = searchParams.get("bentuk")?.toUpperCase() || "";
    const q      = searchParams.get("q")?.toLowerCase()      || "";

    let data = await getAllSekolahNTT();

    if (bentuk && ["SMA", "SMK", "SLB"].includes(bentuk)) {
      data = data.filter((s) => s.jenisSekolah === bentuk);
    }

    if (q) {
      data = data.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.npsn.includes(q) ||
          s.kabupatenKota.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      {
        data,
        total:  data.length,
        source: "Kemdikbud (referensi + api + dapodik fallback)",
        cached: cache.ts > 0 && Date.now() - cache.ts < CACHE_TTL,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/publik/sekolah-ntt]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sekolah", data: [], total: 0 },
      { status: 500 }
    );
  }
}