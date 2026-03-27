"use client";
// src/components/cetak/CetakAnjabABK.tsx
// Export Word (.docx) & PDF untuk ANJAB + ABK

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface CetakAnjabABKProps {
  jabatanId: string;
  namaJabatan?: string;
  mode?: "anjab" | "abk" | "both";
  variant?: "button" | "dropdown";
}

export function CetakAnjabABK({ jabatanId, namaJabatan, mode = "both", variant = "dropdown" }: CetakAnjabABKProps) {
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCetak(type: "anjab-pdf" | "anjab-word" | "abk-pdf" | "abk-word") {
    setLoading(type);
    setOpen(false);
    try {
      const res = await fetch(`/api/cetak/${jabatanId}?type=${type}`, { method:"GET" });
      if (!res.ok) throw new Error("Gagal generate dokumen");

      const blob     = await res.blob();
      const isWord   = type.endsWith("word");
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      const filename = `${type}-${namaJabatan || jabatanId}.${isWord ? "docx" : "pdf"}`;
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${filename} berhasil diunduh`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunduh dokumen");
    } finally {
      setLoading(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  const MENU_ITEMS = [
    mode !== "abk" && { key:"anjab-word", icon:"📄", label:"ANJAB — Word (.docx)", color:"#3b82f6" },
    mode !== "abk" && { key:"anjab-pdf",  icon:"📋", label:"ANJAB — PDF",          color:"#ef4444" },
    mode !== "anjab" && { key:"abk-word", icon:"📊", label:"ABK — Word (.docx)",   color:"#10b981" },
    mode !== "anjab" && { key:"abk-pdf",  icon:"📊", label:"ABK — PDF",            color:"#f59e0b" },
  ].filter(Boolean) as { key: string; icon: string; label: string; color: string }[];

  if (variant === "button") {
    return (
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {MENU_ITEMS.map((item) => (
          <Button
            key={item.key}
            variant="secondary"
            size="sm"
            loading={loading === item.key}
            onClick={() => handleCetak(item.key as "anjab-pdf"|"anjab-word"|"abk-pdf"|"abk-word")}
            leftIcon={<span>{item.icon}</span>}
          >
            {item.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={handlePrint}
          leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}
        >
          Cetak Browser
        </Button>
      </div>
    );
  }

  return (
    <div style={{ position:"relative" }}>
      <style>{`@keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <Button
        variant="secondary"
        size="sm"
        loading={!!loading}
        onClick={() => setOpen((p) => !p)}
        rightIcon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition:"transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        }
        leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}
      >
        Cetak / Unduh
      </Button>

      {open && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:98 }} onClick={() => setOpen(false)} />
          <div style={{
            position:"absolute", top:"calc(100% + 6px)", right:0,
            minWidth:220, background:"#161b22",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:10, overflow:"hidden",
            boxShadow:"0 12px 36px rgba(0,0,0,0.5)",
            animation:"dropIn 0.15s ease",
            zIndex:99,
          }}>
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item.key}
                onClick={() => handleCetak(item.key as "anjab-pdf"|"anjab-word"|"abk-pdf"|"abk-word")}
                disabled={!!loading}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px",
                  background: loading === item.key ? "rgba(255,255,255,0.05)" : "transparent",
                  border:"none",
                  borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  color:"rgba(255,255,255,0.7)", fontSize:13,
                  cursor: loading ? "not-allowed" : "pointer",
                  textAlign:"left", transition:"background 0.15s",
                }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {loading === item.key && (
                  <span style={{ width:12, height:12, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.6s linear infinite", flexShrink:0 }} />
                )}
              </button>
            ))}
            <button
              onClick={() => { setOpen(false); handlePrint(); }}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", fontSize:13, cursor:"pointer", textAlign:"left", borderTop:"1px solid rgba(255,255,255,0.06)", transition:"background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Cetak Browser
            </button>
          </div>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}