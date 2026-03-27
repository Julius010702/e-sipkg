// src/lib/perhitungan.ts
// REPLACE SELURUH ISI FILE INI

export const JAM_KERJA_EFEKTIF_PER_TAHUN = 1250;
export const MENIT_KERJA_EFEKTIF_PER_TAHUN = JAM_KERJA_EFEKTIF_PER_TAHUN * 60;
export const BEBAN_MENGAJAR_STANDAR = 24;
export const THRESHOLD_SESUAI = 0.5;

export interface InputKebutuhanGuru {
  jumlahRombel: number;
  jumlahJamPelajaran: number;
  bebanMengajar: number;
  jumlahGuruTersedia: number;
  jumlahGuruPNS?: number;
  jumlahGuruPPPK?: number;
}

export interface HasilKebutuhanGuru {
  kebutuhanGuru: number;
  kekuranganGuru: number;
  kelebihanGuru: number;
  statusKebutuhan: "KURANG" | "LEBIH" | "SESUAI";
  persentasePemenuhan: number;
  detail: {
    totalJamPerMinggu: number;
    kebutuhanDesimal: number;
    selisih: number;
  };
}

export interface SekolahRekap {
  sekolahId: string;
  namaSekolah: string;
  kabupatenKota: string;
  jenisSekolah: string;
  kebutuhanGuru: number;
  guruTersedia: number;
  kekurangan: number;
  kelebihan: number;
  statusKebutuhan: "KURANG" | "LEBIH" | "SESUAI";
}

export interface RekomendasiPemerataan {
  dari: string;
  ke: string;
  namaSekolahDari: string;
  namaSekolahTujuan: string;
  jumlahGuru: number;
}

export function hitungKebutuhanGuru(input: InputKebutuhanGuru): HasilKebutuhanGuru {
  const { jumlahRombel, jumlahJamPelajaran, bebanMengajar = BEBAN_MENGAJAR_STANDAR, jumlahGuruTersedia } = input;
  const totalJamPerMinggu = jumlahRombel * jumlahJamPelajaran;
  const kebutuhanDesimal  = totalJamPerMinggu / bebanMengajar;
  const kebutuhanGuru     = parseFloat(kebutuhanDesimal.toFixed(2));
  const selisih           = kebutuhanDesimal - jumlahGuruTersedia;

  let statusKebutuhan: "KURANG" | "LEBIH" | "SESUAI";
  let kekuranganGuru = 0;
  let kelebihanGuru  = 0;

  if (selisih > THRESHOLD_SESUAI)       { statusKebutuhan = "KURANG"; kekuranganGuru = Math.ceil(selisih); }
  else if (selisih < -THRESHOLD_SESUAI) { statusKebutuhan = "LEBIH";  kelebihanGuru  = Math.ceil(Math.abs(selisih)); }
  else                                  { statusKebutuhan = "SESUAI"; }

  const persentasePemenuhan = kebutuhanGuru > 0
    ? parseFloat(((jumlahGuruTersedia / kebutuhanGuru) * 100).toFixed(1)) : 0;

  return { kebutuhanGuru, kekuranganGuru, kelebihanGuru, statusKebutuhan, persentasePemenuhan,
    detail: { totalJamPerMinggu, kebutuhanDesimal, selisih: parseFloat(selisih.toFixed(2)) } };
}

export function hitungBebanKerja(volume: number, normaWaktu: number): number {
  return volume * normaWaktu;
}

export function hitungEfektivitasJabatan(totalBebanKerja: number): {
  nilai: number; kategori: "A"|"B"|"C"|"D"|"E"; label: string;
} {
  const ej    = totalBebanKerja / MENIT_KERJA_EFEKTIF_PER_TAHUN;
  const nilai = parseFloat(ej.toFixed(2));
  let kategori: "A"|"B"|"C"|"D"|"E";
  let label: string;
  if (ej >= 0.91)      { kategori = "A"; label = "Sangat Baik"; }
  else if (ej >= 0.76) { kategori = "B"; label = "Baik"; }
  else if (ej >= 0.61) { kategori = "C"; label = "Cukup Baik"; }
  else if (ej >= 0.51) { kategori = "D"; label = "Cukup"; }
  else                  { kategori = "E"; label = "Kurang"; }
  return { nilai, kategori, label };
}

export function hitungKebutuhanPegawaiABK(
  totalBebanKerja: number,
  jumlahPegawaiTersedia: number
): { kebutuhanPegawai: number; statusKebutuhan: "KURANG"|"LEBIH"|"SESUAI"; jumlahKurangLebih: number } {
  const kebutuhanPegawai  = parseFloat((totalBebanKerja / MENIT_KERJA_EFEKTIF_PER_TAHUN).toFixed(2));
  const selisih           = kebutuhanPegawai - jumlahPegawaiTersedia;
  const jumlahKurangLebih = Math.round(selisih);
  let statusKebutuhan: "KURANG"|"LEBIH"|"SESUAI";
  if (selisih > 0.5)       statusKebutuhan = "KURANG";
  else if (selisih < -0.5) statusKebutuhan = "LEBIH";
  else                      statusKebutuhan = "SESUAI";
  return { kebutuhanPegawai, statusKebutuhan, jumlahKurangLebih };
}

export function hitungABKLengkap(
  detailRows: { volumeKerja: number; normaWaktu: number }[],
  jumlahPegawaiTersedia = 0
) {
  const rowsWithBeban   = detailRows.map((r) => ({ ...r, bebanKerja: hitungBebanKerja(r.volumeKerja, r.normaWaktu) }));
  const totalBebanKerja = rowsWithBeban.reduce((s, r) => s + r.bebanKerja, 0);
  const efektivitas     = hitungEfektivitasJabatan(totalBebanKerja);
  const kebutuhan       = hitungKebutuhanPegawaiABK(totalBebanKerja, jumlahPegawaiTersedia);
  return { rowsWithBeban, totalBebanKerja, efektivitas, kebutuhan };
}

export function hitungPemerataan(data: SekolahRekap[]): {
  rekomendasiList: RekomendasiPemerataan[];
  summary: { totalSekolah:number; sekolahKurang:number; sekolahLebih:number; sekolahSesuai:number; totalKekurangan:number; totalKelebihan:number };
} {
  const kurang = data.filter((s) => s.statusKebutuhan === "KURANG");
  const lebih  = data.filter((s) => s.statusKebutuhan === "LEBIH");
  const rekomendasiList: RekomendasiPemerataan[] = [];
  const sumber = lebih.map((s) => ({ ...s, sisa: s.kelebihan }));
  for (const tujuan of kurang) {
    let butuh = tujuan.kekurangan;
    for (const s of sumber) {
      if (butuh <= 0 || s.sisa <= 0) continue;
      const transfer = Math.min(butuh, s.sisa);
      rekomendasiList.push({ dari: s.sekolahId, ke: tujuan.sekolahId, namaSekolahDari: s.namaSekolah, namaSekolahTujuan: tujuan.namaSekolah, jumlahGuru: transfer });
      s.sisa -= transfer; butuh -= transfer;
    }
  }
  return {
    rekomendasiList,
    summary: {
      totalSekolah:    data.length,
      sekolahKurang:   kurang.length,
      sekolahLebih:    lebih.length,
      sekolahSesuai:   data.filter((s) => s.statusKebutuhan === "SESUAI").length,
      totalKekurangan: kurang.reduce((s, d) => s + d.kekurangan, 0),
      totalKelebihan:  lebih.reduce((s, d) => s + d.kelebihan, 0),
    },
  };
}

export function formatStatusKebutuhan(status: "KURANG"|"LEBIH"|"SESUAI"): string {
  return { KURANG: "Kekurangan Guru", LEBIH: "Kelebihan Guru", SESUAI: "Sudah Sesuai" }[status];
}

export function formatPersenPemenuhan(pct: number): string {
  if (pct >= 100) return "Terpenuhi";
  if (pct >= 80)  return "Hampir Terpenuhi";
  if (pct >= 50)  return "Setengah Terpenuhi";
  return "Belum Terpenuhi";
}