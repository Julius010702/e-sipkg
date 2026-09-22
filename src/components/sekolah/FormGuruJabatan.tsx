'use client'

import { useState, useEffect } from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'

interface Jabatan { id: string; namaJabatan: string; kode: string; isBK: boolean; jamStandar: number }

interface FormGuruJabatanProps {
  editData?: {
    id: string
    jabatanId: string
    jumlahGuruPNS: number
    jumlahGuruPPPK: number
    jamMengajarPerMinggu: number
  } | null
  usedJabatanIds?: string[]
  onSaved?: () => void
  onCancel?: () => void
}

const empty = { jabatanId: '', jumlahGuruPNS: 0, jumlahGuruPPPK: 0, jamMengajarPerMinggu: 24 }

export default function FormGuruJabatan({ editData, usedJabatanIds = [], onSaved, onCancel }: FormGuruJabatanProps) {
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ variant: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    fetch('/api/jabatan', { credentials: 'same-origin' }).then(r => r.json()).then(d => setJabatanList(d.data || []))
  }, [])

  useEffect(() => {
    if (editData) {
      setForm({
        jabatanId: editData.jabatanId,
        jumlahGuruPNS: editData.jumlahGuruPNS,
        jumlahGuruPPPK: editData.jumlahGuruPPPK,
        jamMengajarPerMinggu: editData.jamMengajarPerMinggu,
      })
    } else {
      setForm(empty)
    }
  }, [editData])

  const selectedJabatan = jabatanList.find(j => j.id === form.jabatanId)
  const isEdit = !!editData

  const availableJabatan = jabatanList
    .filter(j => !usedJabatanIds.includes(j.id) || j.id === form.jabatanId)
    .map(j => ({ value: j.id, label: `${j.namaJabatan}${j.isBK ? ' (BK)' : ` - ${j.jamStandar} jam`}` }))

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setAlert(null)
    const url = isEdit ? `/api/guru-jabatan/${editData!.id}` : '/api/guru-jabatan'
    const method = isEdit ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          jumlahGuruPNS: Number(form.jumlahGuruPNS),
          jumlahGuruPPPK: Number(form.jumlahGuruPPPK),
          jamMengajarPerMinggu: Number(form.jamMengajarPerMinggu),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setAlert({ variant: 'error', msg: data.error }); return }
      setAlert({ variant: 'success', msg: isEdit ? 'Data diperbarui!' : 'Data berhasil ditambahkan!' })
      if (!isEdit) setForm(empty)
      onSaved?.()
    } catch {
      setAlert({ variant: 'error', msg: 'Terjadi kesalahan.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alert && <Alert variant={alert.variant} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <Select
        label="Jabatan / Mata Pelajaran"
        value={form.jabatanId}
        onChange={e => {
          const j = jabatanList.find(x => x.id === e.target.value)
          setForm(f => ({ ...f, jabatanId: e.target.value, jamMengajarPerMinggu: j?.jamStandar || 24 }))
        }}
        options={availableJabatan}
        placeholder="-- Pilih Jabatan --"
        required
      />

      {selectedJabatan?.isBK && (
        <Alert variant="info">
          Guru BK: kebutuhan dihitung otomatis dari <strong>jumlah siswa ÷ 150</strong>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Guru PNS"
          type="number"
          min={0}
          value={form.jumlahGuruPNS}
          onChange={e => set('jumlahGuruPNS', e.target.value)}
        />
        <Input
          label="Guru PPPK"
          type="number"
          min={0}
          value={form.jumlahGuruPPPK}
          onChange={e => set('jumlahGuruPPPK', e.target.value)}
        />
      </div>

      {!selectedJabatan?.isBK && (
        <Input
          label="Jam Mengajar per Minggu"
          type="number"
          min={1}
          max={40}
          value={form.jamMengajarPerMinggu}
          onChange={e => set('jamMengajarPerMinggu', e.target.value)}
          hint="Standar: 24 jam per minggu"
          className="max-w-xs"
        />
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Perbarui Data' : 'Tambahkan'}
        </Button>
        {isEdit && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
