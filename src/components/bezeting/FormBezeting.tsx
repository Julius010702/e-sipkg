"use client";
// src/components/bezeting/FormBezeting.tsx
// Fix: updateRow menggunakan type assertion yang benar

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface BezetingRow {
  id?: string;
  jabatanId: string;
  namaJabatan: string;
  golonganSaranRendah: string;
  golonganSaranTinggi: string;
  jumlahPNS: number;
  jumlahPPPK: number;
}

interface FormBezetingProps {
  jabatanId: string;
  onSuccess?: () => void;
}

const GOLONGAN_OPTIONS = [
  "I-a","I-b","I-c","I-d","II-a","II-b","II-c","II-d",
  "III-a","III-b","III-c","III-d","IV-a","IV-b","IV-c","IV-d","IV-e",
].map((v) => ({ value: v, label: v }));

type JabatanData = { namaJabatan: string; kodeJabatan: string; children?: { id: string; namaJabatan: string }[] };

export function FormBezeting({ jabatanId, onSuccess }: FormBezetingProps) {
  const router = useRouter();
  const [jabatan, setJabatan] = useState<JabatanData | null>(null);
  const [rows, setRows]       = useState<BezetingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/jabatan/${jabatanId}`);
        const data = await res.json();
        if (!data.data) return;
        const jab: JabatanData = data.data;
        setJabatan(jab);

        const bRes  = await fetch(`/api/bezeting?jabatanId=${jabatanId}`);
        const bData = await bRes.json();

        if (bData.data?.length > 0) {
          setRows(bData.data);
        } else {
          const allJab = [{ id: jabatanId, namaJabatan: jab.namaJabatan }, ...(jab.children || [])];
          setRows(allJab.map((j) => ({
            jabatanId: j.id,
            namaJabatan: j.namaJabatan,
            golonganSaranRendah: "",
            golonganSaranTinggi: "",
            jumlahPNS: 0,
            jumlahPPPK: 0,
          })));
        }
      } catch { toast.error("Gagal memuat data Bezeting"); }
      finally { setLoading(false); }
    }
    if (jabatanId) load();
  }, [jabatanId]);

  // Fix: update dengan cara yang type-safe
  function updateRow(i: number, field: keyof BezetingRow, value: string | number) {
    setRows((prev) => prev.map((row, idx) =>
      idx === i ? { ...row, [field]: value } : row
    ));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res  = await fetch("/api/bezeting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Bezeting berhasil disimpan");
      onSuccess?.();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Gagal menyimpan"); }
    finally { setSaving(false); }
  }

  const numInput = (val: number, onChange: (v: number) => void) => (
    <input type="number" min={0} value={val || ""} onChange={(e) => onChange(Number(e.target.value))}
      style={{ width:70, height:34, textAlign:"center", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"white", fontSize:13, fontFamily:"'Lato',sans-serif", outline:"none" }}
      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = "#3b82f6"}
      onBlur={(e)  => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
    />
  );

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
      <div style={{ width:32, height:32, border:"3px solid rgba(255,255,255,0.05)", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const totalPNS  = rows.reduce((s, r) => s + r.jumlahPNS,  0);
  const totalPPPK = rows.reduce((s, r) => s + r.jumlahPPPK, 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {jabatan && (
        <div style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"12px 16px" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Jabatan</div>
          <div style={{ fontSize:14, fontWeight:700, color:"white" }}>{jabatan.namaJabatan}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{jabatan.kodeJabatan}</div>
        </div>
      )}

      <div style={{ overflowX:"auto", background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.03)" }}>
              {["No","Nama Jabatan","Gol. Sarankan (Rendah)","Gol. Sarankan (Tinggi)","PNS","PPPK","Total"].map((h) => (
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.4)", borderBottom:"1px solid rgba(255,255,255,0.07)", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding:"10px 12px", textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.4)" }}>{i+1}</td>
                <td style={{ padding:"10px 12px" }}><span style={{ fontSize:13, fontWeight:600, color:"white" }}>{row.namaJabatan}</span></td>
                <td style={{ padding:"8px 10px", width:150 }}><Select options={GOLONGAN_OPTIONS} value={row.golonganSaranRendah} onChange={(v) => updateRow(i,"golonganSaranRendah",v)} placeholder="Pilih" fullWidth /></td>
                <td style={{ padding:"8px 10px", width:150 }}><Select options={GOLONGAN_OPTIONS} value={row.golonganSaranTinggi} onChange={(v) => updateRow(i,"golonganSaranTinggi",v)} placeholder="Pilih" fullWidth /></td>
                <td style={{ padding:"8px 10px", textAlign:"center" }}>{numInput(row.jumlahPNS,  (v) => updateRow(i,"jumlahPNS",v))}</td>
                <td style={{ padding:"8px 10px", textAlign:"center" }}>{numInput(row.jumlahPPPK, (v) => updateRow(i,"jumlahPPPK",v))}</td>
                <td style={{ padding:"8px 12px", textAlign:"center" }}><span style={{ fontSize:14, fontWeight:700, color: (row.jumlahPNS+row.jumlahPPPK)>0 ? "white" : "rgba(255,255,255,0.25)" }}>{row.jumlahPNS+row.jumlahPPPK}</span></td>
              </tr>
            ))}
            <tr style={{ background:"rgba(255,255,255,0.03)", borderTop:"2px solid rgba(255,255,255,0.1)" }}>
              <td colSpan={4} style={{ padding:"10px 12px", textAlign:"right", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.6)" }}>Total</td>
              <td style={{ padding:"10px 12px", textAlign:"center" }}><span style={{ fontSize:14, fontWeight:900, color:"#3b82f6" }}>{totalPNS}</span></td>
              <td style={{ padding:"10px 12px", textAlign:"center" }}><span style={{ fontSize:14, fontWeight:900, color:"#8b5cf6" }}>{totalPPPK}</span></td>
              <td style={{ padding:"10px 12px", textAlign:"center" }}><span style={{ fontSize:16, fontWeight:900, color:"white" }}>{totalPNS+totalPPPK}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.07)", flexWrap:"wrap" }}>
        <Button variant="secondary" onClick={() => router.push(`/sekolah/jabatan/${jabatanId}/abk`)} disabled={saving}>← Halaman ABK</Button>
        <Button variant="secondary" onClick={() => router.push(`/sekolah/jabatan/${jabatanId}/anjab`)} disabled={saving}>Halaman ANJAB</Button>
        <Button variant="ghost" onClick={() => window.print()} disabled={saving}
          leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}>Cetak</Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>Simpan Bezeting</Button>
      </div>
    </div>
  );
}