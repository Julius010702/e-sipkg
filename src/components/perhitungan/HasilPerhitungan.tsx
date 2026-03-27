"use client";
// src/components/perhitungan/HasilPerhitungan.tsx

import { Badge } from "@/components/ui/Badge";

interface HasilData {
  tahunAjaran: string;
  jumlahRombel: number;
  jumlahJamPelajaran: number;
  bebanMengajar: number;
  jumlahGuruTersedia: number;
  jumlahGuruPNS: number;
  jumlahGuruPPPK: number;
  kebutuhanGuru: number;
  kekuranganGuru: number;
  kelebihanGuru: number;
  statusKebutuhan: "KURANG" | "LEBIH" | "SESUAI";
  catatan?: string;
  sekolah?: { nama: string; jenisSekolah: string; kabupatenKota: string };
  updatedAt?: string;
}

interface HasilPerhitunganProps {
  data: HasilData;
  showSekolahInfo?: boolean;
}

const STATUS_STYLE = {
  KURANG: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  icon: "↓", label: "Kekurangan Guru" },
  LEBIH:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", icon: "↑", label: "Kelebihan Guru"   },
  SESUAI: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", icon: "✓", label: "Sudah Sesuai"     },
};

export function HasilPerhitungan({ data, showSekolahInfo = false }: HasilPerhitunganProps) {
  const s = STATUS_STYLE[data.statusKebutuhan] || STATUS_STYLE.SESUAI;
  const pctPNS  = data.jumlahGuruTersedia > 0 ? Math.round((data.jumlahGuruPNS / data.jumlahGuruTersedia) * 100) : 0;
  const pctPPPK = data.jumlahGuruTersedia > 0 ? Math.round((data.jumlahGuruPPPK / data.jumlahGuruTersedia) * 100) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Sekolah info */}
      {showSekolahInfo && data.sekolah && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"white" }}>{data.sekolah.nama}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>
              {data.sekolah.jenisSekolah} — {data.sekolah.kabupatenKota}
            </div>
          </div>
          <Badge variant="default">{data.tahunAjaran}</Badge>
        </div>
      )}

      {/* Status banner */}
      <div style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:"18px 20px", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:`${s.color}20`, border:`2px solid ${s.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:s.color, fontWeight:900, flexShrink:0 }}>
          {s.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:s.color, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>{s.label}</div>
          <div style={{ fontSize:24, fontWeight:900, color:"white", marginTop:2 }}>
            {data.statusKebutuhan === "KURANG" && `${data.kekuranganGuru} Guru Dibutuhkan`}
            {data.statusKebutuhan === "LEBIH"  && `${data.kelebihanGuru} Guru Berlebih`}
            {data.statusKebutuhan === "SESUAI" && "Jumlah Guru Sudah Sesuai"}
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4 }}>
            Kebutuhan: <strong style={{ color:"white" }}>{data.kebutuhanGuru.toFixed(1)}</strong> guru &nbsp;·&nbsp;
            Tersedia: <strong style={{ color:"white" }}>{data.jumlahGuruTersedia}</strong> guru &nbsp;·&nbsp;
            Tahun Ajaran <strong style={{ color:"white" }}>{data.tahunAjaran}</strong>
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        {[
          { label:"Kebutuhan Guru",  value:data.kebutuhanGuru.toFixed(1),  color:"#3b82f6", sub:"orang (kalkulasi)" },
          { label:"Guru Tersedia",   value:data.jumlahGuruTersedia,          color:"#8b5cf6", sub:"orang total" },
          { label:"Jumlah Rombel",   value:data.jumlahRombel,                color:"#06b6d4", sub:"rombel" },
          { label:"Jam Pelajaran",   value:data.jumlahJamPelajaran,          color:"#f59e0b", sub:"jam/minggu" },
          { label:"Beban Mengajar",  value:data.bebanMengajar,               color:"#10b981", sub:"jam/minggu/guru" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderLeft:`3px solid ${color}`, borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
            <div style={{ fontSize:22, fontWeight:900, color, marginTop:4 }}>{value}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Komposisi guru */}
      <div style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"14px 18px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:"white", marginBottom:12 }}>Komposisi Guru Tersedia</div>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {[
            { label:"PNS",  value:data.jumlahGuruPNS,  color:"#3b82f6", pct:pctPNS  },
            { label:"PPPK", value:data.jumlahGuruPPPK, color:"#8b5cf6", pct:pctPPPK },
          ].map(({ label, value, color, pct }) => (
            <div key={label} style={{ flex:1, minWidth:120 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:700, color }}>{value} <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>({pct}%)</span></span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catatan */}
      {data.catatan && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"10px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>Catatan</div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.7, margin:0 }}>{data.catatan}</p>
        </div>
      )}

      {/* Update info */}
      {data.updatedAt && (
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", textAlign:"right" }}>
          Diperbarui: {new Date(data.updatedAt).toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" })}
        </div>
      )}
    </div>
  );
}