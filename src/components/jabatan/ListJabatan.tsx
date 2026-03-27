"use client";
// src/components/jabatan/ListJabatan.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { FormTambahJabatan } from "./FormTambahJabatan";
import { toast } from "@/components/ui/Toast";

interface Jabatan {
  id: string;
  kodeJabatan: string;
  namaJabatan: string;
  jenisJabatan: "STRUKTURAL" | "FUNGSIONAL" | "PELAKSANA";
  unitOrganisasi?: { namaUnit: string };
  urusan?: { nama: string };
  anjab?: { progressPersen: number };
  _count?: { pemangku: number };
}

interface ListJabatanProps {
  sekolahId?: string;
  opdId?: string;
  showActions?: boolean;
}

const JENIS_COLOR: Record<string, "primary" | "success" | "warning"> = {
  STRUKTURAL: "primary",
  FUNGSIONAL: "success",
  PELAKSANA:  "warning",
};

export function ListJabatan({ sekolahId, opdId, showActions = true }: ListJabatanProps) {
  const router = useRouter();

  const [data, setData]         = useState<Jabatan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const PAGE_SIZE               = 10;

  // Modal states
  const [addOpen, setAddOpen]       = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(search && { search }),
        ...(sekolahId && { sekolahId }),
        ...(opdId && { opdId }),
      });
      const res  = await fetch(`/api/jabatan?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      toast.error("Gagal memuat data jabatan");
    } finally {
      setLoading(false);
    }
  }, [page, search, sekolahId, opdId]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/jabatan/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast.success("Jabatan berhasil dihapus");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Jabatan>[] = [
    {
      key: "no", header: "No", width: 50, align: "center",
      render: (_, __, i) => (page - 1) * PAGE_SIZE + i + 1,
    },
    {
      key: "kodeJabatan", header: "Kode", width: 120, sortable: true,
      render: (v) => (
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa" }}>{String(v)}</span>
      ),
    },
    {
      key: "namaJabatan", header: "Nama Jabatan", sortable: true,
      render: (v) => <span style={{ fontWeight: 600, color: "white" }}>{String(v)}</span>,
    },
    {
      key: "jenisJabatan", header: "Jenis", width: 120, align: "center",
      render: (v) => <Badge variant={JENIS_COLOR[String(v)] || "default"}>{String(v)}</Badge>,
    },
    {
      key: "unitOrganisasi", header: "Unit Organisasi",
      render: (v) => {
        const unit = v as { namaUnit: string } | undefined;
        return <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{unit?.namaUnit || "—"}</span>;
      },
    },
    {
      key: "anjab", header: "ANJAB", width: 110, align: "center",
      render: (v) => {
        const anjab = v as { progressPersen: number } | undefined;
        const pct   = anjab?.progressPersen ?? 0;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>
              {pct}%
            </span>
            <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          </div>
        );
      },
    },
    ...(showActions ? [{
      key: "id" as keyof Jabatan,
      header: "Aksi",
      width: 180,
      align: "center" as const,
      render: (_: unknown, row: Jabatan) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <Button size="xs" variant="primary"
            onClick={() => router.push(`/sekolah/jabatan/${row.id}/anjab`)}
            leftIcon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
          >
            ANJAB
          </Button>
          <Button size="xs" variant="secondary"
            onClick={() => setEditId(row.id)}
            leftIcon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
          >
            Edit
          </Button>
          <Button size="xs" variant="danger"
            onClick={() => setDeleteId(row.id)}
            leftIcon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>}
          >
            Hapus
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Input
          placeholder="Cari jabatan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
          style={{ minWidth: 220 }}
        />
        {showActions && (
          <Button variant="primary" onClick={() => setAddOpen(true)}
            leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          >
            Tambah Jabatan
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        rowKey={(r) => r.id}
        emptyMessage="Belum ada jabatan. Klik 'Tambah Jabatan' untuk memulai."
        pagination={{ page, pageSize: PAGE_SIZE, total, onChange: setPage }}
      />

      {/* Modal Tambah */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Jabatan Baru" size="lg">
        <FormTambahJabatan
          sekolahId={sekolahId}
          onSuccess={() => { setAddOpen(false); load(); }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Jabatan" size="lg">
        {editId && (
          <FormTambahJabatan
            jabatanId={editId}
            sekolahId={sekolahId}
            onSuccess={() => { setEditId(null); load(); }}
            onCancel={() => setEditId(null)}
          />
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Jabatan"
        message="Jabatan beserta ANJAB, ABK, dan Bezeting-nya akan terhapus permanen. Lanjutkan?"
        loading={deleteLoading}
      />
    </>
  );
}