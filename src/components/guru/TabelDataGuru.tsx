"use client";
// src/components/guru/TabelDataGuru.tsx

import { useState, useEffect, useCallback } from "react";
import { Table, Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormDataGuru } from "./FormDataGuru";
import { toast } from "@/components/ui/Toast";

interface Guru {
  id: string;
  nip?: string;
  nama: string;
  statusPegawai: "PNS" | "PPPK";
  jenisKelamin?: string;
  pangkatGolongan?: string;
  pendidikanTerakhir?: string;
  bidangStudi?: string;
  mataPelajaran?: string;
  statusSertifikasi?: boolean;
  tmtMasuk?: string;
  telepon?: string;
  aktif: boolean;
}

interface TabelDataGuruProps {
  sekolahId: string;
  showActions?: boolean;
}

export function TabelDataGuru({ sekolahId, showActions = true }: TabelDataGuruProps) {
  const [data, setData]       = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const PAGE_SIZE             = 12;

  const [addOpen, setAddOpen]           = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sekolahId,
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(search && { search }),
        ...(filterStatus && { statusPegawai: filterStatus }),
      });
      const res  = await fetch(`/api/guru?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      toast.error("Gagal memuat data guru");
    } finally {
      setLoading(false);
    }
  }, [sekolahId, page, search, filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/guru/${deleteId}`, { method:"DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success("Data guru berhasil dihapus");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally { setDeleteLoading(false); }
  }

  const totalPNS  = data.filter((g) => g.statusPegawai === "PNS").length;
  const totalPPPK = data.filter((g) => g.statusPegawai === "PPPK").length;
  const totalSertif = data.filter((g) => g.statusSertifikasi).length;

  const columns: Column<Guru>[] = [
    { key:"no", header:"No", width:50, align:"center", render:(_,__,i)=>(page-1)*PAGE_SIZE+i+1 },
    {
      key:"nip", header:"NIP", width:160,
      render:(v) => <span style={{ fontFamily:"monospace", fontSize:11, color:"rgba(255,255,255,0.5)" }}>{String(v||"—")}</span>,
    },
    {
      key:"nama", header:"Nama Guru", sortable:true,
      render:(v) => <span style={{ fontWeight:600, color:"white" }}>{String(v)}</span>,
    },
    {
      key:"statusPegawai", header:"Status", width:90, align:"center",
      render:(v) => <StatusBadge status={String(v)} />,
    },
    {
      key:"pangkatGolongan", header:"Pangkat/Gol", width:160,
      render:(v) => <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{String(v||"—")}</span>,
    },
    {
      key:"mataPelajaran", header:"Mata Pelajaran",
      render:(v) => v ? <Badge variant="info">{String(v)}</Badge> : <span style={{ color:"rgba(255,255,255,0.3)" }}>—</span>,
    },
    {
      key:"pendidikanTerakhir", header:"Pend.", width:65, align:"center",
      render:(v) => v ? <Badge variant="default" size="sm">{String(v)}</Badge> : "—",
    },
    {
      key:"statusSertifikasi", header:"Sertif.", width:75, align:"center",
      render:(v) => v
        ? <Badge variant="success" dot size="sm">Ya</Badge>
        : <Badge variant="default" size="sm">Belum</Badge>,
    },
    ...(showActions ? [{
      key:"id" as keyof Guru, header:"Aksi", width:140, align:"center" as const,
      render:(_:unknown, row:Guru) => (
        <div style={{ display:"flex", gap:5, justifyContent:"center" }}>
          <Button size="xs" variant="secondary" onClick={() => setEditId(row.id)}
            leftIcon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
          >Edit</Button>
          <Button size="xs" variant="danger" onClick={() => setDeleteId(row.id)}
            leftIcon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>}
          >Hapus</Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:16 }}>
        {[
          { label:"Total Guru",  value:total,       color:"#3b82f6" },
          { label:"PNS",         value:totalPNS,    color:"#3b82f6" },
          { label:"PPPK",        value:totalPPPK,   color:"#8b5cf6" },
          { label:"Sertifikasi", value:totalSertif, color:"#10b981" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:"#0d1117", border:"1px solid rgba(255,255,255,0.07)", borderLeft:`3px solid ${color}`, borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
            <div style={{ fontSize:22, fontWeight:900, color, marginTop:3 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Input
            placeholder="Cari nama / NIP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
            style={{ minWidth:200 }}
          />
          <Select
            options={[{ value:"", label:"Semua Status" }, { value:"PNS", label:"PNS" }, { value:"PPPK", label:"PPPK" }]}
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setPage(1); }}
            placeholder="Filter status"
          />
        </div>
        {showActions && (
          <Button variant="primary" onClick={() => setAddOpen(true)}
            leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          >
            Tambah Guru
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        rowKey={(r) => r.id}
        emptyMessage="Belum ada data guru. Klik 'Tambah Guru' untuk memulai."
        pagination={{ page, pageSize:PAGE_SIZE, total, onChange:setPage }}
      />

      {/* Modal Tambah */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Data Guru" size="lg">
        <FormDataGuru sekolahId={sekolahId} onSuccess={() => { setAddOpen(false); load(); }} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Modal Edit */}
      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Data Guru" size="lg">
        {editId && (
          <FormDataGuru sekolahId={sekolahId} guruId={editId} onSuccess={() => { setEditId(null); load(); }} onCancel={() => setEditId(null)} />
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Data Guru"
        message="Data guru ini akan dihapus permanen. Tindakan tidak bisa dibatalkan."
        loading={deleteLoading}
      />
    </>
  );
}