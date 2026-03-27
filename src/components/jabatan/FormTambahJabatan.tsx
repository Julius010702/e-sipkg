"use client";
// src/components/jabatan/FormTambahJabatan.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";

interface FormJabatanData {
  indukJabatanId: string;
  unitOrganisasiId: string;
  jenisJabatan: string;
  namaJabatan: string;
  urusanId: string;
  kodeJabatan: string;
  syaratJabatan: string;
}

interface FormTambahJabatanProps {
  jabatanId?: string; // jika ada = mode edit
  sekolahId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JENIS_JABATAN_OPTIONS: SelectOption[] = [
  { value: "STRUKTURAL", label: "Struktural" },
  { value: "FUNGSIONAL", label: "Fungsional" },
  { value: "PELAKSANA",  label: "Pelaksana"  },
];

export function FormTambahJabatan({ jabatanId, sekolahId, onSuccess, onCancel }: FormTambahJabatanProps) {
  const isEdit = !!jabatanId;

  const [form, setForm] = useState<FormJabatanData>({
    indukJabatanId: "",
    unitOrganisasiId: "",
    jenisJabatan: "",
    namaJabatan: "",
    urusanId: "",
    kodeJabatan: "",
    syaratJabatan: "",
  });

  const [errors, setErrors] = useState<Partial<FormJabatanData>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Options dari API
  const [indukOptions, setIndukOptions]  = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions]    = useState<SelectOption[]>([]);
  const [urusanOptions, setUrusanOptions] = useState<SelectOption[]>([]);

  // Load options
  useEffect(() => {
    async function loadOptions() {
      setFetchLoading(true);
      try {
        const [jabatanRes, unitRes, urusanRes] = await Promise.all([
          fetch(`/api/jabatan?sekolahId=${sekolahId || ""}`),
          fetch(`/api/master/unit-organisasi`),
          fetch(`/api/master/urusan`),
        ]);
        const [jabatanData, unitData, urusanData] = await Promise.all([
          jabatanRes.json(), unitRes.json(), urusanRes.json(),
        ]);
        setIndukOptions([
          { value: "", label: "— Tidak ada (jabatan puncak) —" },
          ...(jabatanData.data || []).map((j: { id: string; namaJabatan: string; kodeJabatan: string }) => ({
            value: j.id, label: `${j.kodeJabatan} — ${j.namaJabatan}`,
          })),
        ]);
        setUnitOptions((unitData.data || []).map((u: { id: string; namaUnit: string }) => ({
          value: u.id, label: u.namaUnit,
        })));
        setUrusanOptions((urusanData.data || []).map((u: { id: string; nama: string }) => ({
          value: u.id, label: u.nama,
        })));
      } catch {
        toast.error("Gagal memuat data referensi");
      } finally {
        setFetchLoading(false);
      }
    }
    loadOptions();
  }, [sekolahId]);

  // Load data jika edit
  useEffect(() => {
    if (!isEdit) return;
    async function loadJabatan() {
      try {
        const res = await fetch(`/api/jabatan/${jabatanId}`);
        const data = await res.json();
        if (data.data) {
          setForm({
            indukJabatanId: data.data.indukJabatanId || "",
            unitOrganisasiId: data.data.unitOrganisasiId || "",
            jenisJabatan: data.data.jenisJabatan || "",
            namaJabatan: data.data.namaJabatan || "",
            urusanId: data.data.urusanId || "",
            kodeJabatan: data.data.kodeJabatan || "",
            syaratJabatan: data.data.syaratJabatan || "",
          });
        }
      } catch {
        toast.error("Gagal memuat data jabatan");
      }
    }
    loadJabatan();
  }, [jabatanId, isEdit]);

  function set(field: keyof FormJabatanData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormJabatanData> = {};
    if (!form.namaJabatan.trim()) e.namaJabatan = "Nama jabatan wajib diisi";
    if (!form.jenisJabatan)        e.jenisJabatan = "Jenis jabatan wajib dipilih";
    if (!form.kodeJabatan.trim())  e.kodeJabatan = "Kode jabatan wajib diisi";
    if (!form.unitOrganisasiId)    e.unitOrganisasiId = "Unit organisasi wajib dipilih";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const url    = isEdit ? `/api/jabatan/${jabatanId}` : "/api/jabatan";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sekolahId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(isEdit ? "Jabatan berhasil diperbarui" : "Jabatan berhasil ditambahkan");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan jabatan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Baris 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select
          label="Induk Jabatan"
          options={fetchLoading ? [{ value: "", label: "Memuat..." }] : indukOptions}
          value={form.indukJabatanId}
          onChange={(v) => set("indukJabatanId", v)}
          placeholder="Pilih induk jabatan"
          searchable
          fullWidth
        />
        <Select
          label="Unit Organisasi"
          options={fetchLoading ? [{ value: "", label: "Memuat..." }] : unitOptions}
          value={form.unitOrganisasiId}
          onChange={(v) => set("unitOrganisasiId", v)}
          placeholder="Pilih unit organisasi"
          error={errors.unitOrganisasiId}
          required
          searchable
          fullWidth
        />
      </div>

      {/* Baris 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Select
          label="Jenis Jabatan"
          options={JENIS_JABATAN_OPTIONS}
          value={form.jenisJabatan}
          onChange={(v) => set("jenisJabatan", v)}
          placeholder="Pilih jenis jabatan"
          error={errors.jenisJabatan}
          required
          fullWidth
        />
        <Select
          label="Urusan"
          options={fetchLoading ? [{ value: "", label: "Memuat..." }] : urusanOptions}
          value={form.urusanId}
          onChange={(v) => set("urusanId", v)}
          placeholder="Pilih urusan"
          searchable
          fullWidth
        />
      </div>

      {/* Baris 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Input
          label="Nama Jabatan"
          value={form.namaJabatan}
          onChange={(e) => set("namaJabatan", e.target.value)}
          placeholder="cth: Guru Mata Pelajaran"
          error={errors.namaJabatan}
          required fullWidth
        />
        <Input
          label="Kode Jabatan"
          value={form.kodeJabatan}
          onChange={(e) => set("kodeJabatan", e.target.value.toUpperCase())}
          placeholder="cth: F.001.GM"
          error={errors.kodeJabatan}
          required fullWidth
        />
      </div>

      {/* Syarat Jabatan */}
      <Input
        label="Syarat Jabatan"
        value={form.syaratJabatan}
        onChange={(e) => set("syaratJabatan", e.target.value)}
        placeholder="cth: S1 Kependidikan, Pangkat III/a minimum"
        hint="Opsional — syarat minimal untuk menduduki jabatan ini"
        fullWidth
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? "Simpan Perubahan" : "Tambah Jabatan"}
        </Button>
      </div>
    </form>
  );
}