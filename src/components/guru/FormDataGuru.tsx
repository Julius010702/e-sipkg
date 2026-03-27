"use client";
// src/components/guru/FormDataGuru.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";

interface GuruFormData {
  nip: string;
  nama: string;
  statusPegawai: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  pangkatGolongan: string;
  tmtGolongan: string;
  pendidikanTerakhir: string;
  bidangStudi: string;
  mataPelajaran: string;
  statusSertifikasi: string;
  nomorSertifikasi: string;
  tmtMasuk: string;
  alamat: string;
  telepon: string;
  email: string;
}

interface FormDataGuruProps {
  sekolahId: string;
  guruId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EMPTY: GuruFormData = {
  nip:"", nama:"", statusPegawai:"", jenisKelamin:"",
  tempatLahir:"", tanggalLahir:"", pangkatGolongan:"", tmtGolongan:"",
  pendidikanTerakhir:"", bidangStudi:"", mataPelajaran:"",
  statusSertifikasi:"false", nomorSertifikasi:"",
  tmtMasuk:"", alamat:"", telepon:"", email:"",
};

const STATUS_PEGAWAI_OPT = [{ value:"PNS", label:"PNS" }, { value:"PPPK", label:"PPPK" }];
const JK_OPT  = [{ value:"L", label:"Laki-laki" }, { value:"P", label:"Perempuan" }];
const SERTIF_OPT = [{ value:"true", label:"Sudah Sertifikasi" }, { value:"false", label:"Belum Sertifikasi" }];

const PANGKAT_OPT = [
  "Penata Muda / III-a","Penata Muda Tk.I / III-b","Penata / III-c","Penata Tk.I / III-d",
  "Pembina / IV-a","Pembina Tk.I / IV-b","Pembina Utama Muda / IV-c",
  "Pembina Utama Madya / IV-d","Pembina Utama / IV-e",
].map((v) => ({ value: v, label: v }));

const PENDIDIKAN_OPT = ["SMA","D1","D2","D3","D4","S1","S2","S3"].map((v) => ({ value: v, label: v }));

const MAPEL_OPT = [
  "Matematika","Fisika","Kimia","Biologi","Bahasa Indonesia","Bahasa Inggris",
  "Sejarah","Geografi","Ekonomi","Sosiologi","PKn","Pendidikan Agama","PJOK",
  "Seni Budaya","TIK","BK","Muatan Lokal","Produktif (SMK)","Lainnya",
].map((v) => ({ value: v, label: v }));

export function FormDataGuru({ sekolahId, guruId, onSuccess, onCancel }: FormDataGuruProps) {
  const isEdit = !!guruId;
  const [form, setForm]     = useState<GuruFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<GuruFormData>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/guru/${guruId}`);
        const data = await res.json();
        if (data.data) {
          const d = data.data;
          setForm({
            nip:               d.nip || "",
            nama:              d.nama || "",
            statusPegawai:     d.statusPegawai || "",
            jenisKelamin:      d.jenisKelamin || "",
            tempatLahir:       d.tempatLahir || "",
            tanggalLahir:      d.tanggalLahir ? d.tanggalLahir.split("T")[0] : "",
            pangkatGolongan:   d.pangkatGolongan || "",
            tmtGolongan:       d.tmtGolongan ? d.tmtGolongan.split("T")[0] : "",
            pendidikanTerakhir:d.pendidikanTerakhir || "",
            bidangStudi:       d.bidangStudi || "",
            mataPelajaran:     d.mataPelajaran || "",
            statusSertifikasi: d.statusSertifikasi ? "true" : "false",
            nomorSertifikasi:  d.nomorSertifikasi || "",
            tmtMasuk:          d.tmtMasuk ? d.tmtMasuk.split("T")[0] : "",
            alamat:            d.alamat || "",
            telepon:           d.telepon || "",
            email:             d.email || "",
          });
        }
      } catch { toast.error("Gagal memuat data guru"); }
      finally { setLoading(false); }
    }
    load();
  }, [guruId, isEdit]);

  function set(field: keyof GuruFormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<GuruFormData> = {};
    if (!form.nama.trim())         e.nama = "Nama wajib diisi";
    if (!form.statusPegawai)       e.statusPegawai = "Status pegawai wajib dipilih";
    if (!form.pendidikanTerakhir)  e.pendidikanTerakhir = "Pendidikan wajib dipilih";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const url    = isEdit ? `/api/guru/${guruId}` : "/api/guru";
      const method = isEdit ? "PUT" : "POST";
      const body   = {
        ...form,
        sekolahId,
        statusSertifikasi: form.statusSertifikasi === "true",
        tanggalLahir: form.tanggalLahir || null,
        tmtGolongan:  form.tmtGolongan  || null,
        tmtMasuk:     form.tmtMasuk     || null,
      };
      const res  = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(isEdit ? "Data guru berhasil diperbarui" : "Guru berhasil ditambahkan");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <div style={{ width:28, height:28, border:"3px solid rgba(255,255,255,0.05)", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const SectionTitle = ({ text }: { text: string }) => (
    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.4)", borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:8, marginBottom:14, marginTop:4 }}>{text}</div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

      <SectionTitle text="Data Pribadi" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="NIP" value={form.nip} onChange={(e) => set("nip", e.target.value)} placeholder="18 digit NIP (opsional)" hint="Kosongkan jika PPPK non-NIP" fullWidth />
        <Input label="Nama Lengkap" value={form.nama} onChange={(e) => set("nama", e.target.value)} error={errors.nama} required fullWidth />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <Select label="Status Pegawai" options={STATUS_PEGAWAI_OPT} value={form.statusPegawai} onChange={(v) => set("statusPegawai", v)} error={errors.statusPegawai} required fullWidth />
        <Select label="Jenis Kelamin" options={JK_OPT} value={form.jenisKelamin} onChange={(v) => set("jenisKelamin", v)} fullWidth />
        <Input label="Tempat Lahir" value={form.tempatLahir} onChange={(e) => set("tempatLahir", e.target.value)} fullWidth />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Tanggal Lahir" type="date" value={form.tanggalLahir} onChange={(e) => set("tanggalLahir", e.target.value)} fullWidth />
        <Input label="TMT Masuk" type="date" value={form.tmtMasuk} onChange={(e) => set("tmtMasuk", e.target.value)} hint="Tanggal mulai tugas" fullWidth />
      </div>

      <SectionTitle text="Kepangkatan" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Select label="Pangkat/Golongan" options={PANGKAT_OPT} value={form.pangkatGolongan} onChange={(v) => set("pangkatGolongan", v)} searchable fullWidth />
        <Input label="TMT Golongan" type="date" value={form.tmtGolongan} onChange={(e) => set("tmtGolongan", e.target.value)} fullWidth />
      </div>

      <SectionTitle text="Pendidikan & Mengajar" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <Select label="Pendidikan Terakhir" options={PENDIDIKAN_OPT} value={form.pendidikanTerakhir} onChange={(v) => set("pendidikanTerakhir", v)} error={errors.pendidikanTerakhir} required fullWidth />
        <Input label="Bidang Studi" value={form.bidangStudi} onChange={(e) => set("bidangStudi", e.target.value)} placeholder="cth: Pendidikan Matematika" fullWidth />
        <Select label="Mata Pelajaran" options={MAPEL_OPT} value={form.mataPelajaran} onChange={(v) => set("mataPelajaran", v)} searchable fullWidth />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Select label="Status Sertifikasi" options={SERTIF_OPT} value={form.statusSertifikasi} onChange={(v) => set("statusSertifikasi", v)} fullWidth />
        {form.statusSertifikasi === "true" && (
          <Input label="Nomor Sertifikasi" value={form.nomorSertifikasi} onChange={(e) => set("nomorSertifikasi", e.target.value)} placeholder="Nomor sertifikasi guru" fullWidth />
        )}
      </div>

      <SectionTitle text="Kontak" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Telepon" value={form.telepon} onChange={(e) => set("telepon", e.target.value)} placeholder="08xxxxxxxxxx" fullWidth />
        <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" fullWidth />
      </div>
      <Input label="Alamat" value={form.alamat} onChange={(e) => set("alamat", e.target.value)} placeholder="Alamat lengkap" fullWidth />

      {/* Actions */}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Batal</Button>
        <Button type="submit" variant="primary" loading={saving}>
          {isEdit ? "Simpan Perubahan" : "Tambah Guru"}
        </Button>
      </div>
    </form>
  );
}