"use client";
// src/components/cetak/CetakRekap.tsx
// Export rekap perhitungan ke Excel / PDF

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface CetakRekapProps {
  tahun: string;
  opdId?: string;
  variant?: "button" | "dropdown";
}

export function CetakRekap({ tahun, opdId, variant = "dropdown" }: CetakRekapProps) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCetak(type: "excel" | "pdf" | "word") {
    setLoading(type);
    setOpen(false);
    try {
      const params = new URLSearchParams({ type, tahun, ...(opdId && { opdId }) });
      const res    = await fetch(`/api/cetak/rekap?${params}`);
      if (!res.ok) throw new Error("Gagal generate rekap");

      const blob     = await res.blob();
      const ext      = type === "excel" ? "xlsx" : type === "word" ? "docx" : "pdf";
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = `rekap-kebutuhan-guru-${tahun}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Rekap ${tahun} berhasil diunduh`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunduh");
    } finally {
      setLoading(null); }
  }

  const ITEMS = [
    { key:"excel", icon:"📊", label:"Excel (.xlsx)", color:"#10b981", desc:"Untuk analisis lebih lanjut" },
    { key:"pdf",   icon:"📋", label:"PDF",           color:"#ef4444", desc:"Untuk arsip & laporan" },
    { key:"word",  icon:"📄", label:"Word (.docx)",  color:"#3b82f6", desc:"Untuk dokumen resmi" },
  ];

  if (variant === "button") {
    return (
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {ITEMS.map((item) => (
          <Button key={item.key} variant="secondary" size="sm" loading={loading === item.key}
            onClick={() => handleCetak(item.key as "excel"|"pdf"|"word")}
            leftIcon={<span>{item.icon}</span>}
          >
            {item.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ position:"relative" }}>
      <style>{`@keyframes dropIn2{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <Button variant="success" size="sm" loading={!!loading} onClick={() => setOpen((p) => !p)}
        leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
        rightIcon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>}
      >
        Unduh Rekap
      </Button>

      {open && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:98 }} onClick={() => setOpen(false)} />
          <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, minWidth:240, background:"#161b22", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, overflow:"hidden", boxShadow:"0 12px 36px rgba(0,0,0,0.5)", animation:"dropIn2 0.15s ease", zIndex:99 }}>
            <div style={{ padding:"10px 14px 6px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                Rekap Tahun {tahun}
              </div>
            </div>
            {ITEMS.map((item) => (
              <button key={item.key}
                onClick={() => handleCetak(item.key as "excel"|"pdf"|"word")}
                disabled={!!loading}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:13, cursor:loading?"not-allowed":"pointer", textAlign:"left", transition:"background 0.15s" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ width:32, height:32, borderRadius:8, background:`${item.color}14`, border:`1px solid ${item.color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight:600, color:"white", fontSize:13 }}>{item.label}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:1 }}>{item.desc}</div>
                </div>
                {loading === item.key && (
                  <span style={{ marginLeft:"auto", width:14, height:14, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}