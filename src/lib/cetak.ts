// src/lib/cetak.ts
// REPLACE SELURUH ISI FILE INI
// Fix: hapus PageNumber constructor, insideH/insideV tidak ada di docx

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageOrientation,
} from "docx";

export interface DataAnjab {
  jabatan: {
    kodeJabatan: string; namaJabatan: string; jenisJabatan: string;
    unitOrganisasi?: { namaUnit: string }; indukJabatan?: { namaJabatan: string };
  };
  anjab: {
    ikhtisarJabatan?: string; uraianTugas?: string;
    bahanKerja?: { no: number; bahan: string; penggunaan: string }[];
    perangkatKerja?: { no: number; perangkat: string; penggunaan: string }[];
    hasilKerja?: { no: number; hasil: string; satuan: string; jumlah: number }[];
    tanggungjawab?: string[];
    pangkatGolonganTerendah?: string; pangkatGolonganTertinggi?: string;
    pendidikanTerendah?: string; bidangPendidikanTerendah?: string;
    pendidikanTertinggi?: string; bidangPendidikanTertinggi?: string;
    kursusPelatihanPemimpin?: string[]; pengalamanKerja?: string[];
    pengetahuan?: string[]; keterampilan?: string[];
  };
  sekolah?: { nama: string; kepalaSekolah?: string; alamat?: string };
  tanggal?: string;
}

export interface DataABK {
  jabatan: {
    kodeJabatan: string; namaJabatan: string;
    unitOrganisasi?: { namaUnit: string };
    anjab?: { ikhtisarJabatan?: string };
  };
  abk: {
    detailBebanKerja?: { no: number; uraianTugas: string; satuanHasil: string; volumeKerja: number; normaWaktu: number; bebanKerja: number }[];
    totalBebanKerja?: number; efektivitasNilai?: number; efektivitasJabatan?: string;
    kebutuhanPegawai?: number; statusKebutuhan?: string; jumlahKurangLebih?: number;
  };
  sekolah?: { nama: string; kepalaSekolah?: string; alamat?: string };
  tanggal?: string;
}

export interface DataRekap {
  tahun: string; namaInstansi: string;
  rows: {
    namaSekolah: string; jenisSekolah: string; kabupatenKota: string;
    guruPNS: number; guruPPPK: number; total: number;
    kebutuhan: number; kekurangan: number; kelebihan: number; status: string;
  }[];
  summary: {
    totalSekolah: number; totalGuruPNS: number; totalGuruPPPK: number;
    totalKebutuhan: number; totalKekurangan: number; totalKelebihan: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────
const B = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const BA = { top: B, bottom: B, left: B, right: B };
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NBA = { top: NB, bottom: NB, left: NB, right: NB };
const CM = { top: 80, bottom: 80, left: 120, right: 120 };

function hCell(text: string, w: number): TableCell {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: BA, margins: CM,
    shading: { fill: "1A3F6F", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF", font: "Arial" })], alignment: AlignmentType.CENTER })] });
}
function dCell(text: string, w: number, center = false): TableCell {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: BA, margins: CM,
    children: [new Paragraph({ children: [new TextRun({ text: text || "—", size: 20, font: "Arial" })], alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT })] });
}
function lCell(text: string): TableCell {
  return new TableCell({ width: { size: 3200, type: WidthType.DXA }, borders: BA, margins: CM,
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Arial" })] })] });
}
function vCell(text: string): TableCell {
  return new TableCell({ width: { size: 6160, type: WidthType.DXA }, borders: BA, margins: CM,
    children: [new Paragraph({ children: [new TextRun({ text: text || "—", size: 20, font: "Arial" })] })] });
}
function secTitle(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: "1A3F6F" })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1A3F6F", space: 2 } } });
}
function ttdTable(kota: string, tanggal: string, nama: string, totalW: number, leftW: number): Table {
  const rightW = totalW - leftW;
  return new Table({
    width: { size: totalW, type: WidthType.DXA }, columnWidths: [leftW, rightW],
    borders: NBA,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: leftW, type: WidthType.DXA }, borders: NBA, children: [new Paragraph({ children: [] })] }),
      new TableCell({ width: { size: rightW, type: WidthType.DXA }, borders: NBA, children: [
        new Paragraph({ children: [new TextRun({ text: `${kota}, ${tanggal}`, size: 20, font: "Arial" })], alignment: AlignmentType.CENTER }),
        new Paragraph({ children: [new TextRun({ text: "Kepala Sekolah,", size: 20, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 900 } }),
        new Paragraph({ children: [new TextRun({ text: nama, bold: true, size: 20, font: "Arial" })], alignment: AlignmentType.CENTER }),
      ] }),
    ] })],
  });
}

// ── 1. WORD ANJAB ─────────────────────────────────────────────
export async function generateWordAnjab(data: DataAnjab): Promise<Buffer> {
  const { jabatan, anjab, sekolah, tanggal } = data;
  const tgl = tanggal || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const kota = sekolah?.alamat?.split(",")[0] || "___";

  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1080, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "FORMULIR ANALISIS JABATAN (ANJAB)", bold: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: sekolah?.nama || "", size: 22, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 320 } }),

        secTitle("A. IDENTITAS JABATAN"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3200, 6160], rows: [
          new TableRow({ children: [lCell("1. Induk Jabatan"),    vCell(jabatan.indukJabatan?.namaJabatan || "—")] }),
          new TableRow({ children: [lCell("2. Kode Jabatan"),     vCell(jabatan.kodeJabatan)] }),
          new TableRow({ children: [lCell("3. Jenis Jabatan"),    vCell(jabatan.jenisJabatan)] }),
          new TableRow({ children: [lCell("4. Nama Jabatan"),     vCell(jabatan.namaJabatan)] }),
          new TableRow({ children: [lCell("5. Unit Organisasi"),  vCell(jabatan.unitOrganisasi?.namaUnit || "—")] }),
          new TableRow({ children: [lCell("6. Ikhtisar Jabatan"), vCell(anjab.ikhtisarJabatan || "—")] }),
        ]}),

        secTitle("B. URAIAN TUGAS"),
        new Paragraph({ children: [new TextRun({ text: anjab.uraianTugas || "—", size: 22, font: "Arial" })], spacing: { after: 200 } }),

        secTitle("C. BAHAN KERJA"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [600, 4380, 4380], rows: [
          new TableRow({ children: [hCell("No", 600), hCell("Bahan Kerja", 4380), hCell("Penggunaan", 4380)] }),
          ...(anjab.bahanKerja || []).map((r) => new TableRow({ children: [dCell(String(r.no), 600, true), dCell(r.bahan, 4380), dCell(r.penggunaan, 4380)] })),
        ]}),

        secTitle("D. PERANGKAT KERJA"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [600, 4380, 4380], rows: [
          new TableRow({ children: [hCell("No", 600), hCell("Perangkat", 4380), hCell("Penggunaan", 4380)] }),
          ...(anjab.perangkatKerja || []).map((r) => new TableRow({ children: [dCell(String(r.no), 600, true), dCell(r.perangkat, 4380), dCell(r.penggunaan, 4380)] })),
        ]}),

        secTitle("E. HASIL KERJA"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [600, 4000, 2360, 2400], rows: [
          new TableRow({ children: [hCell("No", 600), hCell("Hasil Kerja", 4000), hCell("Satuan", 2360), hCell("Jumlah", 2400)] }),
          ...(anjab.hasilKerja || []).map((r) => new TableRow({ children: [dCell(String(r.no), 600, true), dCell(r.hasil, 4000), dCell(r.satuan, 2360, true), dCell(String(r.jumlah), 2400, true)] })),
        ]}),

        secTitle("F. TANGGUNG JAWAB"),
        ...(anjab.tanggungjawab || []).map((t, i) => new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${t}`, size: 22, font: "Arial" })], spacing: { after: 60 } })),

        secTitle("G. SYARAT JABATAN"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3200, 6160], rows: [
          new TableRow({ children: [lCell("Pangkat/Gol Terendah"),  vCell(anjab.pangkatGolonganTerendah  || "—")] }),
          new TableRow({ children: [lCell("Pangkat/Gol Tertinggi"), vCell(anjab.pangkatGolonganTertinggi || "—")] }),
          new TableRow({ children: [lCell("Pendidikan Terendah"),   vCell(`${anjab.pendidikanTerendah || "—"} — ${anjab.bidangPendidikanTerendah || "—"}`)] }),
          new TableRow({ children: [lCell("Pendidikan Tertinggi"),  vCell(`${anjab.pendidikanTertinggi || "—"} — ${anjab.bidangPendidikanTertinggi || "—"}`)] }),
          new TableRow({ children: [lCell("Kursus/Pelatihan"),      vCell((anjab.kursusPelatihanPemimpin || []).join(", ") || "—")] }),
          new TableRow({ children: [lCell("Pengalaman Kerja"),      vCell((anjab.pengalamanKerja || []).join("; ") || "—")] }),
          new TableRow({ children: [lCell("Pengetahuan"),           vCell((anjab.pengetahuan || []).join("; ") || "—")] }),
          new TableRow({ children: [lCell("Keterampilan"),          vCell((anjab.keterampilan || []).join("; ") || "—")] }),
        ]}),

        new Paragraph({ spacing: { before: 600 }, children: [] }),
        ttdTable(kota, tgl, sekolah?.kepalaSekolah || "(________________________________)", 9360, 6000),
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

// ── 2. WORD ABK ───────────────────────────────────────────────
export async function generateWordABK(data: DataABK): Promise<Buffer> {
  const { jabatan, abk, sekolah, tanggal } = data;
  const tgl  = tanggal || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const kota = sekolah?.alamat?.split(",")[0] || "___";
  const EJ: Record<string, string> = { A: "Sangat Baik", B: "Baik", C: "Cukup Baik", D: "Cukup", E: "Kurang" };

  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 15840, height: 12240, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1440 } } },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "FORMULIR ANALISIS BEBAN KERJA (ABK)", bold: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: sekolah?.nama || "", size: 22, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),

        secTitle("A. IDENTITAS JABATAN"),
        new Table({ width: { size: 13200, type: WidthType.DXA }, columnWidths: [3200, 10000], rows: [
          new TableRow({ children: [lCell("Kode Jabatan"),    vCell(jabatan.kodeJabatan)] }),
          new TableRow({ children: [lCell("Nama Jabatan"),    vCell(jabatan.namaJabatan)] }),
          new TableRow({ children: [lCell("Unit Organisasi"), vCell(jabatan.unitOrganisasi?.namaUnit || "—")] }),
          new TableRow({ children: [lCell("Ikhtisar"),        vCell(jabatan.anjab?.ikhtisarJabatan || "—")] }),
        ]}),

        secTitle("B. TABEL ANALISIS BEBAN KERJA"),
        new Table({ width: { size: 13200, type: WidthType.DXA }, columnWidths: [500, 4500, 1500, 1200, 1800, 1800, 1900], rows: [
          new TableRow({ children: [hCell("No",500), hCell("Uraian Tugas",4500), hCell("Satuan",1500), hCell("Volume",1200), hCell("Norma Waktu",1800), hCell("Beban Kerja",1800), hCell("Ket.",1900)] }),
          ...(abk.detailBebanKerja || []).map((r) => new TableRow({ children: [dCell(String(r.no),500,true), dCell(r.uraianTugas,4500), dCell(r.satuanHasil,1500,true), dCell(String(r.volumeKerja),1200,true), dCell(String(r.normaWaktu),1800,true), dCell(r.bebanKerja.toLocaleString(),1800,true), dCell("",1900)] })),
          new TableRow({ children: [
            new TableCell({ columnSpan: 5, width: { size: 9300, type: WidthType.DXA }, borders: BA, margins: CM, shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Total Beban Kerja", bold: true, size: 20, font: "Arial" })], alignment: AlignmentType.RIGHT })] }),
            dCell(`${(abk.totalBebanKerja||0).toLocaleString()} mnt`, 1800, true),
            dCell("", 1900),
          ]}),
        ]}),

        secTitle("C. HASIL PERHITUNGAN"),
        new Table({ width: { size: 13200, type: WidthType.DXA }, columnWidths: [3200, 10000], rows: [
          new TableRow({ children: [lCell("Kebutuhan Pegawai"),       vCell(`${abk.kebutuhanPegawai?.toFixed(2)} orang`)] }),
          new TableRow({ children: [lCell("Efektivitas Jabatan (EJ)"),vCell(`${abk.efektivitasNilai?.toFixed(2)} (desimal)`)] }),
          new TableRow({ children: [lCell("Penilaian Jabatan (PJ)"),  vCell(`${abk.efektivitasJabatan} — ${EJ[abk.efektivitasJabatan||""]||""}`)] }),
          new TableRow({ children: [lCell("Status Kebutuhan"),        vCell(`${abk.statusKebutuhan}`)] }),
        ]}),

        new Paragraph({ spacing: { before: 400 }, children: [] }),
        ttdTable(kota, tgl, sekolah?.kepalaSekolah || "(________________________________)", 13200, 9000),
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

// ── 3. WORD REKAP ─────────────────────────────────────────────
export async function generateWordRekap(data: DataRekap): Promise<Buffer> {
  const { tahun, namaInstansi, rows, summary } = data;
  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 15840, height: 12240, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1080, right: 720, bottom: 1080, left: 1440 } } },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "REKAP PERHITUNGAN KEBUTUHAN GURU", bold: true, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: `${namaInstansi} — Tahun Ajaran ${tahun}`, size: 22, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
        new Table({ width: { size: 14400, type: WidthType.DXA }, columnWidths: [500, 3000, 1000, 2000, 1200, 1200, 1200, 1400, 1300, 1300, 1300], rows: [
          new TableRow({ children: [hCell("No",500),hCell("Nama Sekolah",3000),hCell("Jenis",1000),hCell("Kab/Kota",2000),hCell("PNS",1200),hCell("PPPK",1200),hCell("Total",1200),hCell("Kebutuhan",1400),hCell("Kekurangan",1300),hCell("Kelebihan",1300),hCell("Status",1300)] }),
          ...rows.map((r, i) => new TableRow({ children: [dCell(String(i+1),500,true),dCell(r.namaSekolah,3000),dCell(r.jenisSekolah,1000,true),dCell(r.kabupatenKota,2000),dCell(String(r.guruPNS),1200,true),dCell(String(r.guruPPPK),1200,true),dCell(String(r.total),1200,true),dCell(r.kebutuhan.toFixed(1),1400,true),dCell(String(r.kekurangan),1300,true),dCell(String(r.kelebihan),1300,true),dCell(r.status,1300,true)] })),
          new TableRow({ children: [
            new TableCell({ columnSpan: 4, width: { size: 6500, type: WidthType.DXA }, borders: BA, margins: CM, shading: { fill: "1A3F6F", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, color: "FFFFFF", size: 20, font: "Arial" })], alignment: AlignmentType.CENTER })] }),
            dCell(String(summary.totalGuruPNS),1200,true),dCell(String(summary.totalGuruPPPK),1200,true),
            dCell(String(summary.totalGuruPNS+summary.totalGuruPPPK),1200,true),
            dCell(String(summary.totalKebutuhan),1400,true),dCell(String(summary.totalKekurangan),1300,true),
            dCell(String(summary.totalKelebihan),1300,true),dCell(`${summary.totalSekolah} Sekolah`,1300,true),
          ]}),
        ]}),
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

// ── 4. PDF ANJAB ──────────────────────────────────────────────
export async function generatePDFAnjab(data: DataAnjab): Promise<Buffer> {
  const { jsPDF }  = await import("jspdf");
  const autoTable  = (await import("jspdf-autotable")).default;
  const { anjab, jabatan, sekolah } = data;
  const doc     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW   = doc.internal.pageSize.getWidth();
  const margin  = 20;
  const cW      = pageW - margin * 2;
  let y         = 20;
  type LastTable = { lastAutoTable: { finalY: number } };

  doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text("FORMULIR ANALISIS JABATAN (ANJAB)", pageW/2, y, { align:"center" });
  y += 6;
  doc.setFontSize(10).setFont("helvetica","normal");
  doc.text(sekolah?.nama||"", pageW/2, y, { align:"center" });
  y += 10;

  autoTable(doc, { startY:y, margin:{ left:margin, right:margin }, head:[],
    body:[["1. Kode Jabatan",jabatan.kodeJabatan],["2. Jenis Jabatan",jabatan.jenisJabatan],["3. Nama Jabatan",jabatan.namaJabatan],["4. Unit Organisasi",jabatan.unitOrganisasi?.namaUnit||"—"],["5. Ikhtisar Jabatan",anjab.ikhtisarJabatan||"—"]],
    columnStyles:{ 0:{ cellWidth:55, fontStyle:"bold", fillColor:[245,245,245] as [number,number,number] }, 1:{ cellWidth:cW-55 } },
    styles:{ fontSize:9, cellPadding:3 }, theme:"grid" });
  y = (doc as unknown as LastTable).lastAutoTable.finalY + 6;

  for (const [title, rows, cols] of [
    ["C. BAHAN KERJA", anjab.bahanKerja||[], ["No","Bahan Kerja","Penggunaan"]],
    ["D. PERANGKAT KERJA", anjab.perangkatKerja||[], ["No","Perangkat","Penggunaan"]],
  ] as [string, {no:number;bahan?:string;perangkat?:string;penggunaan:string}[], string[]][]) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(10).setFont("helvetica","bold").text(title, margin, y); y += 4;
    autoTable(doc, { startY:y, margin:{ left:margin, right:margin }, head:[cols],
      body:rows.map((r) => [r.no, r.bahan||r.perangkat||"", r.penggunaan]),
      headStyles:{ fillColor:[26,63,111] as [number,number,number], textColor:255, fontSize:9 },
      styles:{ fontSize:9, cellPadding:3 }, theme:"grid" });
    y = (doc as unknown as LastTable).lastAutoTable.finalY + 6;
  }

  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(10).setFont("helvetica","bold").text("G. SYARAT JABATAN", margin, y); y += 4;
  autoTable(doc, { startY:y, margin:{ left:margin, right:margin },
    body:[
      ["Pangkat/Gol Terendah", anjab.pangkatGolonganTerendah||"—"],
      ["Pangkat/Gol Tertinggi",anjab.pangkatGolonganTertinggi||"—"],
      ["Pendidikan Terendah",  `${anjab.pendidikanTerendah||"—"} — ${anjab.bidangPendidikanTerendah||"—"}`],
      ["Pendidikan Tertinggi", `${anjab.pendidikanTertinggi||"—"} — ${anjab.bidangPendidikanTertinggi||"—"}`],
      ["Kursus/Pelatihan",     (anjab.kursusPelatihanPemimpin||[]).join(", ")||"—"],
      ["Keterampilan",         (anjab.keterampilan||[]).join("; ")||"—"],
    ],
    columnStyles:{ 0:{ cellWidth:55, fontStyle:"bold", fillColor:[245,245,245] as [number,number,number] }, 1:{ cellWidth:cW-55 } },
    styles:{ fontSize:9, cellPadding:3 }, theme:"grid" });

  return Buffer.from(doc.output("arraybuffer"));
}

// ── 5. PDF ABK ────────────────────────────────────────────────
export async function generatePDFABK(data: DataABK): Promise<Buffer> {
  const { jsPDF }  = await import("jspdf");
  const autoTable  = (await import("jspdf-autotable")).default;
  const doc   = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;
  type LastTable = { lastAutoTable: { finalY: number } };
  const EJ: Record<string,string> = { A:"Sangat Baik", B:"Baik", C:"Cukup Baik", D:"Cukup", E:"Kurang" };

  doc.setFontSize(13).setFont("helvetica","bold");
  doc.text("FORMULIR ANALISIS BEBAN KERJA (ABK)", pageW/2, y, { align:"center" });
  y += 6;
  doc.setFontSize(10).setFont("helvetica","normal");
  doc.text(data.sekolah?.nama||"", pageW/2, y, { align:"center" });
  y += 10;

  autoTable(doc, { startY:y, margin:{ left:margin, right:margin },
    head:[["No","Uraian Tugas","Satuan","Volume","Norma Waktu","Beban Kerja"]],
    body:[
      ...(data.abk.detailBebanKerja||[]).map((r) => [r.no, r.uraianTugas, r.satuanHasil, r.volumeKerja, r.normaWaktu, r.bebanKerja.toLocaleString()]),
      [{ content:"Total Beban Kerja", colSpan:5, styles:{ halign:"right", fontStyle:"bold", fillColor:[240,240,240] as [number,number,number] } }, { content:`${(data.abk.totalBebanKerja||0).toLocaleString()} mnt`, styles:{ halign:"center", fontStyle:"bold" } }],
    ],
    headStyles:{ fillColor:[26,63,111] as [number,number,number], textColor:255, fontSize:9 },
    styles:{ fontSize:9, cellPadding:3 }, theme:"grid" });
  y = (doc as unknown as LastTable).lastAutoTable.finalY + 8;

  autoTable(doc, { startY:y, margin:{ left:margin, right:margin },
    body:[
      ["Kebutuhan Pegawai",   `${data.abk.kebutuhanPegawai?.toFixed(2)} orang`],
      ["Efektivitas Jabatan", `${data.abk.efektivitasNilai?.toFixed(2)} (EJ)`],
      ["Penilaian Jabatan",   `${data.abk.efektivitasJabatan} — ${EJ[data.abk.efektivitasJabatan||""]||""}`],
      ["Status Kebutuhan",    `${data.abk.statusKebutuhan}`],
    ],
    columnStyles:{ 0:{ cellWidth:60, fontStyle:"bold", fillColor:[245,245,245] as [number,number,number] }, 1:{ cellWidth:100 } },
    styles:{ fontSize:9, cellPadding:3 }, theme:"grid" });

  return Buffer.from(doc.output("arraybuffer"));
}

// ── 6. PDF REKAP ──────────────────────────────────────────────
export async function generatePDFRekap(data: DataRekap): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc   = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(13).setFont("helvetica","bold");
  doc.text("REKAP PERHITUNGAN KEBUTUHAN GURU", pageW/2, y, { align:"center" });
  y += 6;
  doc.setFontSize(10).setFont("helvetica","normal");
  doc.text(`${data.namaInstansi} — Tahun Ajaran ${data.tahun}`, pageW/2, y, { align:"center" });
  y += 10;

  autoTable(doc, { startY:y, margin:{ left:15, right:15 },
    head:[["No","Nama Sekolah","Jenis","Kab/Kota","PNS","PPPK","Total","Kebutuhan","Kekurangan","Kelebihan","Status"]],
    body:[
      ...data.rows.map((r,i) => [i+1, r.namaSekolah, r.jenisSekolah, r.kabupatenKota, r.guruPNS, r.guruPPPK, r.total, r.kebutuhan.toFixed(1), r.kekurangan, r.kelebihan, r.status]),
      [{ content:"TOTAL", colSpan:4, styles:{ fontStyle:"bold", halign:"center", fillColor:[26,63,111] as [number,number,number], textColor:255 } },
        data.summary.totalGuruPNS, data.summary.totalGuruPPPK,
        data.summary.totalGuruPNS+data.summary.totalGuruPPPK,
        data.summary.totalKebutuhan, data.summary.totalKekurangan, data.summary.totalKelebihan,
        `${data.summary.totalSekolah} Sekolah`],
    ],
    headStyles:{ fillColor:[26,63,111] as [number,number,number], textColor:255, fontSize:8 },
    styles:{ fontSize:8, cellPadding:2 }, theme:"grid" });

  return Buffer.from(doc.output("arraybuffer"));
}