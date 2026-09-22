'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'

interface FormProfilSekolahProps {
  onSaved?: () => void
}

const jenisOptions = [
  { value: 'SMA', label: 'SMA - Sekolah Menengah Atas' },
  { value: 'SMK', label: 'SMK - Sekolah Menengah Kejuruan' },
  { value: 'SLB', label: 'SLB - Sekolah Luar Biasa' },
]

export default function FormProfilSekolah({ onSaved }: FormProfilSekolahProps) {
  const [form, setForm] = useState({
    nama: '', jenisSekolah: 'SMA', npsn: '',
    alamat: '', wilayahId: '', jumlahSiswa: 0, jumlahRombel: 0,
  })
  const [wilayahList, setWilayahList] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [alert, setAlert] = useState<{ variant: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/wilayah').then(r => r.json()),
      fetch('/api/sekolah/me').then(r => r.json()),
    ]).then(([wilRes, sekolahRes]) => {
      setWilayahList((wilRes.data || []).map((w: { id: string; nama: string }) => ({ value: w.id, label: w.nama })))
      if (sekolahRes.data) {
        const d = sekolahRes.data
        setForm({
          nama: d.nama || '', jenisSekolah: d.jenisSekolah || 'SMA',
          npsn: d.npsn || '', alamat: d.alamat || '',
          wilayahId: d.wilayahId || '',
          jumlahSiswa: d.jumlahSiswa || 0,
          jumlahRombel: d.jumlahRombel || 0,
        })
      }
    }).finally(() => setFetching(false))
  }, [])

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setAlert(null)
    try {
      const res = await fetch('/api/sekolah/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jumlahSiswa: Number(form.jumlahSiswa), jumlahRombel: Number(form.jumlahRombel) }),
      })
      const data = await res.json()
      if (!res.ok) { setAlert({ variant: 'error', msg: data.error }); return }
      setAlert({ variant: 'success', msg: 'Data profil berhasil disimpan!' })
      onSaved?.()
    } catch {
      setAlert({ variant: 'error', msg: 'Terjadi kesalahan. Coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-6 text-center text-gray-400 text-sm">Memuat data...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && (
        <Alert variant={alert.variant} onClose={() => setAlert(null)}>
          {alert.msg}
        </Alert>
      )}

      <Input
        label="Nama Sekolah"
        value={form.nama}
        onChange={e => set('nama', e.target.value)}
        placeholder="SMA Negeri 1 Kupang"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Jenis Sekolah"
          value={form.jenisSekolah}
          onChange={e => set('jenisSekolah', e.target.value)}
          options={jenisOptions}
          required
        />
        <Input
          label="NPSN"
          value={form.npsn}
          onChange={e => set('npsn', e.target.value)}
          placeholder="8 digit angka"
          maxLength={8}
        />
      </div>

      <Select
        label="Kabupaten/Kota"
        value={form.wilayahId}
        onChange={e => set('wilayahId', e.target.value)}
        options={wilayahList}
        placeholder="-- Pilih Kabupaten/Kota --"
        required
      />

      <Input
        label="Alamat Lengkap"
        value={form.alamat}
        onChange={e => set('alamat', e.target.value)}
        placeholder="Jalan, Kelurahan, Kecamatan"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Jumlah Siswa"
          type="number"
          min={0}
          value={form.jumlahSiswa}
          onChange={e => set('jumlahSiswa', e.target.value)}
          required
        />
        <Input
          label="Jumlah Rombel"
          type="number"
          min={0}
          value={form.jumlahRombel}
          onChange={e => set('jumlahRombel', e.target.value)}
          hint="Rombongan Belajar (kelas aktif)"
          required
        />
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading} fullWidth>
          Simpan Profil Sekolah
        </Button>
      </div>
    </form>
  )
}
