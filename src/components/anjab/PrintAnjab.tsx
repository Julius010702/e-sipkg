"use client";
// src/components/anjab/PrintAnjab.tsx
// Template cetak ANJAB — trigger window.print()

interface PrintAnjabProps {
  jabatan: {
    kodeJabatan: string;
    namaJabatan: string;
    jenisJabatan: string;
    unitOrganisasi?: { namaUnit: string };
    indukJabatan?: { namaJabatan: string };
  };
  anjab: {
    ikhtisarJabatan?: string;
    uraianTugas?: string;
    bahanKerja?: { no: number; bahan: string; penggunaan: string }[];
    perangkatKerja?: { no: number; perangkat: string; penggunaan: string }[];
    hasilKerja?: { no: number; hasil: string; satuan: string; jumlah: number }[];
    tanggungjawab?: string[];
    pangkatGolonganTerendah?: string;
    pangkatGolonganTertinggi?: string;
    pendidikanTerendah?: string;
    bidangPendidikanTerendah?: string;
    pendidikanTertinggi?: string;
    bidangPendidikanTertinggi?: string;
    kursusPelatihanPemimpin?: string[];
    pengalamanKerja?: string[];
    pengetahuan?: string[];
    keterampilan?: string[];
  };
  namaSekolah?: string;
  namaKepala?: string;
  tanggal?: string;
}

export function PrintAnjab({ jabatan, anjab, namaSekolah, namaKepala, tanggal }: PrintAnjabProps) {
  const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: 12, fontSize: 11 };
  const td:  React.CSSProperties = { border: "1px solid #888", padding: "5px 8px", verticalAlign: "top" };
  const th:  React.CSSProperties = { ...td, background: "#f0f0f0", fontWeight: 700 };

  return (
    <div className="print-anjab" style={{ fontFamily: "Arial, sans-serif", color: "#000", padding: "20px 32px", maxWidth: 800, margin: "0 auto" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-anjab { padding: 0 !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, borderBottom: "2px solid #000", paddingBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 14, textTransform: "uppercase" }}>FORMULIR ANALISIS JABATAN</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12 }}>{namaSekolah || "Sekolah"}</p>
      </div>

      {/* Identitas Jabatan */}
      <table style={tbl}>
        <tbody>
          {[
            ["Induk Jabatan",    jabatan.indukJabatan?.namaJabatan || "—"],
            ["Kode Jabatan",     jabatan.kodeJabatan],
            ["Jenis Jabatan",    jabatan.jenisJabatan],
            ["Nama Jabatan",     jabatan.namaJabatan],
            ["Unit Organisasi",  jabatan.unitOrganisasi?.namaUnit || "—"],
            ["Ikhtisar Jabatan", anjab.ikhtisarJabatan || "—"],
          ].map(([label, value]) => (
            <tr key={label}>
              <td style={{ ...th, width: "35%" }}>{label}</td>
              <td style={td}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Uraian Tugas */}
      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Uraian Tugas</h4>
      <p style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 12 }}>{anjab.uraianTugas || "—"}</p>

      {/* Bahan Kerja */}
      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Bahan Kerja</h4>
      <table style={tbl}>
        <thead><tr><th style={th}>No</th><th style={th}>Bahan Kerja</th><th style={th}>Penggunaan</th></tr></thead>
        <tbody>
          {(anjab.bahanKerja || []).map((r, i) => (
            <tr key={i}><td style={{ ...td, textAlign: "center", width: 40 }}>{r.no}</td><td style={td}>{r.bahan}</td><td style={td}>{r.penggunaan}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Perangkat Kerja */}
      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Perangkat Kerja</h4>
      <table style={tbl}>
        <thead><tr><th style={th}>No</th><th style={th}>Perangkat</th><th style={th}>Penggunaan</th></tr></thead>
        <tbody>
          {(anjab.perangkatKerja || []).map((r, i) => (
            <tr key={i}><td style={{ ...td, textAlign: "center", width: 40 }}>{r.no}</td><td style={td}>{r.perangkat}</td><td style={td}>{r.penggunaan}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Hasil Kerja */}
      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Hasil Kerja</h4>
      <table style={tbl}>
        <thead><tr><th style={th}>No</th><th style={th}>Hasil Kerja</th><th style={th}>Satuan</th><th style={th}>Jumlah</th></tr></thead>
        <tbody>
          {(anjab.hasilKerja || []).map((r, i) => (
            <tr key={i}><td style={{ ...td, textAlign: "center", width: 40 }}>{r.no}</td><td style={td}>{r.hasil}</td><td style={td}>{r.satuan}</td><td style={{ ...td, textAlign: "center" }}>{r.jumlah}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Tanggung Jawab */}
      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Tanggung Jawab</h4>
      <ol style={{ fontSize: 11, paddingLeft: 20, marginBottom: 12 }}>
        {(anjab.tanggungjawab || []).map((t, i) => <li key={i} style={{ marginBottom: 3 }}>{t}</li>)}
      </ol>

      {/* Syarat Jabatan */}
      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Syarat Jabatan</h4>
      <table style={tbl}>
        <tbody>
          <tr><td style={{ ...th, width: "40%" }}>Pangkat/Gol Terendah</td><td style={td}>{anjab.pangkatGolonganTerendah || "—"}</td></tr>
          <tr><td style={th}>Pangkat/Gol Tertinggi</td><td style={td}>{anjab.pangkatGolonganTertinggi || "—"}</td></tr>
          <tr><td style={th}>Pendidikan Terendah</td><td style={td}>{anjab.pendidikanTerendah} — {anjab.bidangPendidikanTerendah}</td></tr>
          <tr><td style={th}>Pendidikan Tertinggi</td><td style={td}>{anjab.pendidikanTertinggi} — {anjab.bidangPendidikanTertinggi}</td></tr>
        </tbody>
      </table>

      {/* Kursus, Pengalaman, Pengetahuan, Keterampilan */}
      {[
        ["Kursus/Pelatihan", anjab.kursusPelatihanPemimpin],
        ["Pengalaman Kerja", anjab.pengalamanKerja],
        ["Pengetahuan",      anjab.pengetahuan],
        ["Keterampilan",     anjab.keterampilan],
      ].map(([label, items]) => (
        <div key={String(label)}>
          <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>{String(label)}</h4>
          <ol style={{ fontSize: 11, paddingLeft: 20, marginBottom: 12 }}>
            {((items as string[]) || []).map((item, i) => <li key={i} style={{ marginBottom: 3 }}>{item}</li>)}
          </ol>
        </div>
      ))}

      {/* TTD */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
        <div style={{ textAlign: "center", minWidth: 200 }}>
          <p style={{ fontSize: 11, margin: "0 0 60px" }}>{namaSekolah || "_______________"}, {tanggal || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
          <p style={{ fontSize: 11, margin: 0 }}>Kepala Sekolah,</p>
          <div style={{ borderBottom: "1px solid #000", width: 180, margin: "48px auto 4px" }} />
          <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{namaKepala || "(_____________________)"}</p>
        </div>
      </div>
    </div>
  );
}