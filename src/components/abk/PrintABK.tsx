"use client";
// src/components/abk/PrintABK.tsx

interface PrintABKProps {
  jabatan: { kodeJabatan: string; namaJabatan: string; unitOrganisasi?: { namaUnit: string }; anjab?: { ikhtisarJabatan?: string } };
  abk: {
    detailBebanKerja?: { no: number; uraianTugas: string; satuanHasil: string; volumeKerja: number; normaWaktu: number; bebanKerja: number }[];
    totalBebanKerja?: number;
    efektivitasNilai?: number;
    efektivitasJabatan?: string;
    kebutuhanPegawai?: number;
    statusKebutuhan?: string;
    jumlahKurangLebih?: number;
  };
  namaSekolah?: string;
  namaKepala?: string;
  tanggal?: string;
}

const EJ_LABEL: Record<string, string> = { A: "Sangat Baik", B: "Baik", C: "Cukup Baik", D: "Cukup", E: "Kurang" };

export function PrintABK({ jabatan, abk, namaSekolah, namaKepala, tanggal }: PrintABKProps) {
  const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: 12, fontSize: 11 };
  const td:  React.CSSProperties = { border: "1px solid #888", padding: "5px 8px", verticalAlign: "top" };
  const th:  React.CSSProperties = { ...td, background: "#f0f0f0", fontWeight: 700, textAlign: "center" };

  return (
    <div className="print-abk" style={{ fontFamily: "Arial, sans-serif", color: "#000", padding: "20px 32px", maxWidth: 900, margin: "0 auto" }}>
      <style>{`@media print { .no-print { display:none!important } body { background:white!important; color:black!important } .print-abk { padding:0!important } }`}</style>

      <div style={{ textAlign: "center", marginBottom: 20, borderBottom: "2px solid #000", paddingBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 14, textTransform: "uppercase" }}>FORMULIR ANALISIS BEBAN KERJA (ABK)</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12 }}>{namaSekolah || "Sekolah"}</p>
      </div>

      <table style={tbl}><tbody>
        <tr><td style={{ ...th, width: "30%", textAlign: "left" }}>Kode Jabatan</td><td style={td}>{jabatan.kodeJabatan}</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Nama Jabatan</td><td style={td}>{jabatan.namaJabatan}</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Unit Organisasi</td><td style={td}>{jabatan.unitOrganisasi?.namaUnit || "—"}</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Ikhtisar Jabatan</td><td style={td}>{jabatan.anjab?.ikhtisarJabatan || "—"}</td></tr>
      </tbody></table>

      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Tabel Beban Kerja</h4>
      <table style={tbl}>
        <thead>
          <tr>
            <th style={{ ...th, width: 35 }}>No</th>
            <th style={th}>Uraian Tugas</th>
            <th style={{ ...th, width: 90 }}>Satuan Hasil</th>
            <th style={{ ...th, width: 80 }}>Volume</th>
            <th style={{ ...th, width: 100 }}>Norma Waktu</th>
            <th style={{ ...th, width: 110 }}>Beban Kerja</th>
          </tr>
        </thead>
        <tbody>
          {(abk.detailBebanKerja || []).map((r, i) => (
            <tr key={i}>
              <td style={{ ...td, textAlign: "center" }}>{r.no}</td>
              <td style={td}>{r.uraianTugas}</td>
              <td style={{ ...td, textAlign: "center" }}>{r.satuanHasil}</td>
              <td style={{ ...td, textAlign: "right" }}>{r.volumeKerja}</td>
              <td style={{ ...td, textAlign: "right" }}>{r.normaWaktu} mnt</td>
              <td style={{ ...td, textAlign: "right" }}>{r.bebanKerja.toLocaleString()} mnt</td>
            </tr>
          ))}
          <tr style={{ background: "#f5f5f5", fontWeight: 700 }}>
            <td colSpan={5} style={{ ...td, textAlign: "right" }}>Total Beban Kerja</td>
            <td style={{ ...td, textAlign: "right" }}>{(abk.totalBebanKerja || 0).toLocaleString()} mnt</td>
          </tr>
        </tbody>
      </table>

      <h4 style={{ fontSize: 12, margin: "12px 0 6px" }}>Hasil Perhitungan</h4>
      <table style={tbl}><tbody>
        <tr><td style={{ ...th, width: "40%", textAlign: "left" }}>Total Beban Kerja</td><td style={td}>{(abk.totalBebanKerja || 0).toLocaleString()} menit</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Kebutuhan Pegawai</td><td style={td}>{abk.kebutuhanPegawai?.toFixed(2)} orang</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Efektivitas Jabatan (EJ)</td><td style={td}>{abk.efektivitasNilai?.toFixed(2)} (desimal)</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Penilaian Jabatan (PJ)</td><td style={td}>{abk.efektivitasJabatan} — {EJ_LABEL[abk.efektivitasJabatan || ""] || ""}</td></tr>
        <tr><td style={{ ...th, textAlign: "left" }}>Status Kebutuhan</td><td style={td}>{abk.statusKebutuhan} {abk.jumlahKurangLebih !== undefined ? `(${abk.jumlahKurangLebih > 0 ? "+" : ""}${abk.jumlahKurangLebih})` : ""}</td></tr>
      </tbody></table>

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