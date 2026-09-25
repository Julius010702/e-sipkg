'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

const JENJANG_JABATAN = [
  { value: 'AHLI_PERTAMA', label: 'Ahli Pertama', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'AHLI_MUDA',    label: 'Ahli Muda',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'AHLI_MADYA',   label: 'Ahli Madya',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'AHLI_UTAMA',   label: 'Ahli Utama',   color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const

interface GuruRow {
  id: string
  namaJabatan: string
  jenjangJabatan: string
  isBK: boolean
  jumlahGuruPNS: number
  jumlahGuruPPPK: number
  jamMengajarPerMinggu: number
  jumlahRombel: number
  kebutuhanGuru: number
}

interface JabatanMaster {
  id: string
  namaJabatan: string
  jamStandar: number
  isBK: boolean
}

// Satu "jabatan" (mapel) bisa punya guru PNS di beberapa jenjang sekaligus.
// Grup ini menggabungkan semua baris GuruRow yang namaJabatan-nya sama.
type JenjangKey = typeof JENJANG_JABATAN[number]['value']

interface GuruGroup {
  namaJabatan: string
  isBK: boolean
  jamMengajarPerMinggu: number
  jumlahRombel: number
  rows: GuruRow[]
  rowIdByJenjang: Partial<Record<JenjangKey, string>>
  pnsByJenjang: Partial<Record<JenjangKey, number>>
  totalPNS: number
  totalPPPK: number
  totalASN: number
  kebutuhanGuru: number
  selisih: number
}

type EditingGroup = { namaJabatan: string; rowIdByJenjang: Partial<Record<JenjangKey, string>> } | null

type ModalState =
  | { kind: 'confirm-delete'; ids: string[]; nama: string }
  | { kind: 'success'; title: string; text: string }
  | { kind: 'error'; title: string; text: string }
  | { kind: 'ajukan' }
  | null

const emptyForm = {
  namaJabatan: '',
  isBK: false,
  pnsAhliPertama: '' as string | number,
  pnsAhliMuda: '' as string | number,
  pnsAhliMadya: '' as string | number,
  pnsAhliUtama: '' as string | number,
  jumlahGuruPPPK: '' as string | number,
  jamMengajarPerMinggu: '' as string | number,
  jumlahRombel: '' as string | number,
  jumlahSiswaBK: '' as string | number,
}

// Field form tempat PNS tiap jenjang diisi
const PNS_FIELD_BY_JENJANG: Record<JenjangKey, keyof typeof emptyForm> = {
  AHLI_PERTAMA: 'pnsAhliPertama',
  AHLI_MUDA:    'pnsAhliMuda',
  AHLI_MADYA:   'pnsAhliMadya',
  AHLI_UTAMA:   'pnsAhliUtama',
}

const ROWS_PER_PAGE = 5
const NILAI_AJUKAN = '__AJUKAN_BARU__'

/* ─── Modal ala "Apakah Anda Yakin?" + modal ajukan jabatan ──────────── */
function AlertModal({
  modal, onClose, onConfirmDelete, onAjukan, ajukanLoading,
}: {
  modal: ModalState
  onClose: () => void
  onConfirmDelete: (ids: string[]) => void
  onAjukan: (nama: string, alasan: string) => void
  ajukanLoading: boolean
}) {
  const [namaAjukan, setNamaAjukan]     = useState('')
  const [alasanAjukan, setAlasanAjukan] = useState('')

  useEffect(() => {
    if (modal?.kind === 'ajukan') { setNamaAjukan(''); setAlasanAjukan('') }
  }, [modal])

  if (!modal) return null

  const isConfirm = modal.kind === 'confirm-delete'
  const isSuccess = modal.kind === 'success'
  const isAjukan  = modal.kind === 'ajukan'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${isAjukan ? 'max-w-md text-left' : 'max-w-sm text-center'} rounded-2xl bg-white px-6 py-8 shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {isAjukan ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Ajukan Jabatan Baru</h3>
                <p className="text-xs text-gray-500">Permohonan akan ditinjau oleh Admin Biro Organisasi</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Nama Jabatan / Mata Pelajaran <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Contoh: Guru Prakarya"
                  value={namaAjukan}
                  onChange={e => setNamaAjukan(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Alasan / Keterangan (opsional)</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Contoh: Mata pelajaran muatan lokal yang belum ada di daftar"
                  value={alasanAjukan}
                  onChange={e => setAlasanAjukan(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                disabled={ajukanLoading || namaAjukan.trim().length < 2}
                onClick={() => onAjukan(namaAjukan.trim(), alasanAjukan.trim())}
                className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ajukanLoading ? 'Mengirim…' : 'Kirim Permohonan'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: isConfirm ? 'rgba(245,158,11,0.1)' : isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              }}>
              {isConfirm && (
                <svg className="h-9 w-9 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v5m0 3h.01" />
                </svg>
              )}
              {isSuccess && (
                <svg className="h-9 w-9 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              )}
              {modal.kind === 'error' && (
                <svg className="h-9 w-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
              )}
            </div>

            {isConfirm ? (
              <>
                <h3 className="text-lg font-bold text-gray-900">Apakah Anda Yakin?</h3>
                <p className="mt-1.5 text-sm text-gray-500">
                  Seluruh data jabatan &ldquo;{modal.nama}&rdquo; (semua jenjang) akan dihapus dan tidak dapat dikembalikan!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900">{modal.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{modal.text}</p>
              </>
            )}

            <div className="mt-6 flex justify-center gap-3">
              {isConfirm ? (
                <>
                  <button
                    onClick={() => { onConfirmDelete(modal.ids); onClose() }}
                    className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Ya, hapus!
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ background: isSuccess ? '#10b981' : '#ef4444' }}
                >
                  OK
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function GuruPage() {
  const [guruList, setGuruList]       = useState<GuruRow[]>([])
  const [jabatanMaster, setJabatanMaster] = useState<JabatanMaster[]>([])
  const [form, setForm]               = useState(emptyForm)
  const [editingGroup, setEditingGroup] = useState<EditingGroup>(null)
  const [loading, setLoading]         = useState(false)
  const [ajukanLoading, setAjukanLoading] = useState(false)
  const [modal, setModal]             = useState<ModalState>(null)

  // Jumlah siswa sekolah (untuk kalkulasi kebutuhan Guru BK: siswa ÷ 150)
  const [sekolahJumlahSiswa, setSekolahJumlahSiswa] = useState(0)

  // Search + pagination tabel
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const [perPage, setPerPage] = useState(ROWS_PER_PAGE)

  const load = useCallback(() => {
    fetch('/api/guru-jabatan')
      .then(r => r.json())
      .then(d => setGuruList(Array.isArray(d.data) ? d.data : []))
  }, [])

  const loadJabatanMaster = useCallback(() => {
    fetch('/api/jabatan', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => setJabatanMaster(Array.isArray(d.data) ? d.data : []))
      .catch(() => {})
  }, [])

  const loadSekolah = useCallback(() => {
    fetch('/api/sekolah/me', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => setSekolahJumlahSiswa(Number(d?.data?.jumlahSiswa) || 0))
      .catch(() => {})
  }, [])

  useEffect(() => { load(); loadJabatanMaster(); loadSekolah() }, [load, loadJabatanMaster, loadSekolah])

  // Kelompokkan semua baris (per jenjang) menjadi satu grup per namaJabatan,
  // supaya kebutuhan guru (jam × rombel) dihitung SEKALI per jabatan —
  // jenjang cuma jadi rincian jumlah PNS di dalamnya.
  const groupedList = useMemo<GuruGroup[]>(() => {
    const map = new Map<string, GuruGroup>()
    const loadMapByGroup = new Map<string, Map<string, number>>()

    for (const g of guruList) {
      let grp = map.get(g.namaJabatan)
      if (!grp) {
        grp = {
          namaJabatan: g.namaJabatan,
          isBK: g.isBK,
          jamMengajarPerMinggu: g.jamMengajarPerMinggu,
          jumlahRombel: g.jumlahRombel,
          rows: [],
          rowIdByJenjang: {},
          pnsByJenjang: {},
          totalPNS: 0,
          totalPPPK: 0,
          totalASN: 0,
          kebutuhanGuru: 0,
          selisih: 0,
        }
        map.set(g.namaJabatan, grp)
        loadMapByGroup.set(g.namaJabatan, new Map())
      }
      grp.rows.push(g)
      const jenjang = g.jenjangJabatan as JenjangKey
      grp.rowIdByJenjang[jenjang] = g.id
      grp.pnsByJenjang[jenjang]   = (grp.pnsByJenjang[jenjang] || 0) + g.jumlahGuruPNS
      grp.totalPNS  += g.jumlahGuruPNS
      grp.totalPPPK += g.jumlahGuruPPPK

      // Dedupe kebutuhan: kalau semua jenjang jabatan ini punya jam & rombel
      // yang sama (kasus normal), kebutuhan cuma dihitung sekali. Kalau ada
      // data lama dengan jam/rombel berbeda per jenjang, tetap dijumlahkan
      // per kombinasi unik supaya tidak hilang.
      const loadKey = `${g.isBK}-${g.jamMengajarPerMinggu}-${g.jumlahRombel}`
      const lm = loadMapByGroup.get(g.namaJabatan)!
      if (!lm.has(loadKey)) lm.set(loadKey, g.kebutuhanGuru)
    }

    return Array.from(map.values()).map(grp => {
      const lm = loadMapByGroup.get(grp.namaJabatan)!
      const kebutuhanGuru = Array.from(lm.values()).reduce((s, v) => s + v, 0)
      const totalASN = grp.totalPNS + grp.totalPPPK
      return { ...grp, kebutuhanGuru, totalASN, selisih: totalASN - Math.round(kebutuhanGuru) }
    })
  }, [guruList])

  useEffect(() => {
    if (editingGroup) {
      const grp = groupedList.find(g => g.namaJabatan === editingGroup.namaJabatan)
      if (grp) {
        setForm({
          namaJabatan:          grp.namaJabatan,
          isBK:                 grp.isBK,
          pnsAhliPertama:       grp.pnsByJenjang.AHLI_PERTAMA || '',
          pnsAhliMuda:          grp.pnsByJenjang.AHLI_MUDA || '',
          pnsAhliMadya:         grp.pnsByJenjang.AHLI_MADYA || '',
          pnsAhliUtama:         grp.pnsByJenjang.AHLI_UTAMA || '',
          jumlahGuruPPPK:       grp.totalPPPK || '',
          jamMengajarPerMinggu: grp.jamMengajarPerMinggu,
          jumlahRombel:         grp.jumlahRombel,
          jumlahSiswaBK:        sekolahJumlahSiswa,
        })
      }
    } else {
      setForm(f => ({ ...emptyForm, jumlahSiswaBK: sekolahJumlahSiswa || f.jumlahSiswaBK }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingGroup])

  // Pilih jabatan dari dropdown master → auto isi jam standar & status BK
  function handlePilihJabatan(val: string) {
    if (val === NILAI_AJUKAN) {
      setModal({ kind: 'ajukan' })
      return
    }
    const found = jabatanMaster.find(j => j.namaJabatan === val)
    if (found) {
      setForm(f => ({
        ...f,
        namaJabatan: found.namaJabatan,
        isBK: found.isBK,
        jamMengajarPerMinggu: found.isBK ? f.jamMengajarPerMinggu : found.jamStandar,
      }))
    } else {
      setForm(f => ({ ...f, namaJabatan: val }))
    }
  }

  async function handleAjukanJabatan(nama: string, alasan: string) {
    setAjukanLoading(true)
    try {
      const res = await fetch('/api/biro/permohonan-jabatan', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaJabatan: nama, alasan: alasan || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setModal({ kind: 'error', title: 'Gagal Mengajukan', text: data.error || 'Terjadi kesalahan.' })
        return
      }
      setModal({
        kind: 'success',
        title: 'Permohonan Terkirim',
        text: `Permohonan jabatan "${nama}" sudah dikirim dan menunggu persetujuan Admin.`,
      })
    } catch {
      setModal({ kind: 'error', title: 'Gagal Mengajukan', text: 'Terjadi kesalahan, silakan coba lagi.' })
    } finally {
      setAjukanLoading(false)
    }
  }

  // Cek duplikat di frontend — sekarang per NAMA JABATAN saja (satu jabatan
  // = satu grup, jenjang cuma rincian PNS di dalamnya)
  function isDuplikat(): boolean {
    const nama = form.namaJabatan.trim().toLowerCase()
    return groupedList.some(g => g.namaJabatan.toLowerCase() === nama && g.namaJabatan !== editingGroup?.namaJabatan)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.namaJabatan.trim()) {
      setModal({ kind: 'error', title: 'Data Belum Lengkap', text: 'Pilih nama jabatan/mata pelajaran terlebih dahulu.' })
      return
    }

    if (!form.isBK && (Number(form.jumlahRombel) || 0) < 1) {
      setModal({ kind: 'error', title: 'Data Belum Lengkap', text: 'Jumlah rombel (kelas yang diajar mata pelajaran ini) wajib diisi, minimal 1.' })
      return
    }

    if (isDuplikat()) {
      setModal({
        kind: 'error',
        title: 'Data Duplikat',
        text: `"${form.namaJabatan.trim()}" sudah ada di daftar. Klik Edit pada baris yang sudah ada untuk mengubah rincian PNS-nya.`,
      })
      return
    }

    setLoading(true)
    try {
      const jam    = form.isBK ? 24 : Number(form.jamMengajarPerMinggu) || 24
      const rombel = form.isBK ? 1  : Number(form.jumlahRombel) || 1
      const pppkTotal = Number(form.jumlahGuruPPPK) || 0

      const pnsMap: Record<JenjangKey, number> = {
        AHLI_PERTAMA: Number(form.pnsAhliPertama) || 0,
        AHLI_MUDA:    Number(form.pnsAhliMuda) || 0,
        AHLI_MADYA:   Number(form.pnsAhliMadya) || 0,
        AHLI_UTAMA:   Number(form.pnsAhliUtama) || 0,
      }
      const jenjangOrder = JENJANG_JABATAN.map(j => j.value)
      // PPPK (belum dipecah per jenjang) ditempel di jenjang pertama yang
      // punya PNS; kalau tidak ada, dipakaikan ke Ahli Pertama sebagai baris
      // "utama" jabatan ini supaya kebutuhannya tetap tercatat.
      const primary = jenjangOrder.find(j => pnsMap[j] > 0) || 'AHLI_PERTAMA'

      for (const jenjang of jenjangOrder) {
        const pns        = pnsMap[jenjang]
        const isPrimary  = jenjang === primary
        const pppk       = isPrimary ? pppkTotal : 0
        const existingId = editingGroup?.rowIdByJenjang[jenjang]

        if (pns === 0 && pppk === 0 && !isPrimary) {
          if (existingId) await fetch(`/api/guru-jabatan/${existingId}`, { method: 'DELETE' })
          continue
        }

        const payload = {
          namaJabatan:          form.namaJabatan.trim(),
          jenjangJabatan:       jenjang,
          isBK:                 form.isBK,
          jumlahGuruPNS:        pns,
          jumlahGuruPPPK:       pppk,
          jamMengajarPerMinggu: jam,
          jumlahRombel:         rombel,
        }

        const res = existingId
          ? await fetch(`/api/guru-jabatan/${existingId}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            })
          : await fetch('/api/guru-jabatan', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setModal({ kind: 'error', title: 'Gagal Menyimpan', text: data.error || 'Terjadi kesalahan.' })
          return
        }
      }

      // Guru BK → sinkronkan Jumlah Seluruh Siswa ke profil sekolah,
      // supaya kebutuhan (siswa ÷ 150) terhitung otomatis.
      if (form.isBK) {
        const siswaBaru = Number(form.jumlahSiswaBK) || 0
        if (siswaBaru !== sekolahJumlahSiswa) {
          await fetch('/api/sekolah/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jumlahSiswa: siswaBaru }),
          })
          setSekolahJumlahSiswa(siswaBaru)
        }
      }

      setModal({
        kind: 'success',
        title: 'Berhasil!',
        text: editingGroup ? 'Data guru telah diperbarui.' : 'Data guru berhasil ditambahkan.',
      })
      setEditingGroup(null)
      load()
    } catch {
      setModal({ kind: 'error', title: 'Gagal Menyimpan', text: 'Terjadi kesalahan.' })
    } finally {
      setLoading(false)
    }
  }

  function askDelete(grp: GuruGroup) {
    setModal({ kind: 'confirm-delete', ids: grp.rows.map(r => r.id), nama: grp.namaJabatan })
  }

  async function confirmDelete(ids: string[]) {
    try {
      const results = await Promise.all(ids.map(id => fetch(`/api/guru-jabatan/${id}`, { method: 'DELETE' })))
      if (results.some(r => !r.ok)) { setModal({ kind: 'error', title: 'Gagal Menghapus', text: 'Sebagian data gagal dihapus.' }); load(); return }
      load()
      setModal({ kind: 'success', title: 'Terhapus!', text: 'Data guru berhasil dihapus.' })
    } catch {
      setModal({ kind: 'error', title: 'Gagal Menghapus', text: 'Terjadi kesalahan, silakan coba lagi.' })
    }
  }

  const totalPNS       = groupedList.reduce((s, g) => s + g.totalPNS, 0)
  const totalPPPK      = groupedList.reduce((s, g) => s + g.totalPPPK, 0)
  const totalASN       = totalPNS + totalPPPK
  const totalKebutuhan = groupedList.reduce((s, g) => s + Math.round(g.kebutuhanGuru), 0)
  const totalSelisih   = totalASN - totalKebutuhan
  const totalPNSForm   =
    (Number(form.pnsAhliPertama) || 0) +
    (Number(form.pnsAhliMuda) || 0) +
    (Number(form.pnsAhliMadya) || 0) +
    (Number(form.pnsAhliUtama) || 0)

  const numInputProps = (
    field: keyof typeof emptyForm,
    placeholder: string
  ) => ({
    type: 'text' as const,
    inputMode: 'numeric' as const,
    pattern: '[0-9]*',
    className: 'input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    placeholder,
    value: form[field] as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '')
      setForm(f => ({ ...f, [field]: raw }))
    },
  })

  const duplikatRealtime = form.namaJabatan.trim().length > 0 && isDuplikat()

  // Filter + paginasi tabel (per grup jabatan)
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groupedList
    return groupedList.filter(g => g.namaJabatan.toLowerCase().includes(q))
  }, [groupedList, search])

  const totalPages = Math.max(1, Math.ceil(filteredList.length / perPage))
  const pagedList  = filteredList.slice((page - 1) * perPage, page * perPage)

  useEffect(() => { setPage(1) }, [search, perPage])
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages, page])

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Data Guru per Jabatan</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Input jabatan/mata pelajaran guru beserta jenjang fungsional dan jumlah ASN.
        </p>
      </div>

      {/* Summary Stat Cards */}
      {groupedList.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Jabatan',  value: groupedList.length,  color: 'text-gray-800' },
            { label: 'Total Guru PNS',      value: totalPNS,         color: 'text-blue-700' },
            { label: 'Total Guru PPPK',     value: totalPPPK,        color: 'text-indigo-700' },
            {
              label: totalSelisih < 0 ? 'Kekurangan' : totalSelisih > 0 ? 'Kelebihan' : 'Terpenuhi',
              value: Math.abs(totalSelisih),
              color: totalSelisih < 0 ? 'text-red-600' : totalSelisih > 0 ? 'text-emerald-600' : 'text-gray-400',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-4 py-3.5">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`mt-0.5 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form Input */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className={`px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 ${
          editingGroup ? 'bg-amber-50' : 'bg-gray-50/70'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            editingGroup ? 'bg-amber-100' : 'bg-blue-100'
          }`}>
            {editingGroup ? (
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <h3 className={`text-sm font-semibold ${editingGroup ? 'text-amber-800' : 'text-gray-800'}`}>
            {editingGroup ? 'Edit Data Guru' : 'Tambah / Filter Data Guru'}
          </h3>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nama Jabatan — dropdown dari master admin */}
            <div>
              <label className="label">
                Nama Jabatan Guru <span className="text-red-500">*</span>
              </label>
              <select
                className={`input ${duplikatRealtime ? 'border-red-400 focus:ring-red-300' : ''}`}
                value={form.namaJabatan}
                onChange={e => handlePilihJabatan(e.target.value)}
              >
                <option value="" disabled>Pilih jabatan / mata pelajaran…</option>
                {jabatanMaster.map(j => (
                  <option key={j.id} value={j.namaJabatan}>
                    {j.namaJabatan}{j.isBK ? ' (BK)' : ''}
                  </option>
                ))}
                <option value={NILAI_AJUKAN}>➕ Tidak ada di daftar? Ajukan jabatan baru…</option>
              </select>

              {duplikatRealtime && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  &ldquo;{form.namaJabatan.trim()}&rdquo; sudah ada di daftar. Klik Edit pada baris yang sudah ada untuk mengubah rinciannya.
                </p>
              )}
            </div>

            {/* Jam Mengajar & Jumlah Rombel — SEKALI untuk jabatan ini, tidak per jenjang */}
            {!form.isBK && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Jumlah Jam Mata Pelajaran per Minggu</label>
                  <input {...numInputProps('jamMengajarPerMinggu', 'Contoh: 24')} />
                  <p className="text-xs text-gray-400 mt-1">Standar: 24 jam/minggu</p>
                </div>
                <div>
                  <label className="label">
                    Jumlah Rombel yang Diajar Mapel Ini <span className="text-red-500">*</span>
                  </label>
                  <input {...numInputProps('jumlahRombel', 'Contoh: 3')} />
                  <p className="text-xs text-gray-400 mt-1">
                    Jumlah rombongan belajar (kelas) yang diajar mata pelajaran ini.
                  </p>
                </div>
              </div>
            )}

            {/* Guru BK toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isBK ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <input
                  type="checkbox"
                  checked={form.isBK as boolean}
                  onChange={e => setForm(f => ({ ...f, isBK: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isBK ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-gray-700">Guru BK</span>
            </label>
            {form.isBK && (
              <div>
                <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
                  Kebutuhan Guru BK dihitung otomatis: jumlah seluruh siswa ÷ 150
                </p>
                <label className="label">
                  Jumlah Seluruh Siswa <span className="text-red-500">*</span>
                </label>
                <input {...numInputProps('jumlahSiswaBK', 'Contoh: 900')} />
                <p className="text-xs text-gray-400 mt-1">
                  Total siswa se-sekolah. Nilai ini otomatis memperbarui data di Profil Sekolah.
                </p>
              </div>
            )}

            {/* PNS per jenjang — diisi masing-masing, totalnya otomatis digabung */}
            <div>
              <label className="label">Jumlah Guru PNS per Jenjang</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {JENJANG_JABATAN.map(j => (
                  <div key={j.value}>
                    <span className="block text-[11px] text-gray-500 mb-1">{j.label}</span>
                    <input {...numInputProps(PNS_FIELD_BY_JENJANG[j.value], '0')} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Total PNS jabatan ini otomatis digabung: <span className="font-semibold text-gray-800">{totalPNSForm}</span>
              </p>
            </div>

            <div>
              <label className="label">Jumlah Guru PPPK</label>
              <input {...numInputProps('jumlahGuruPPPK', 'Contoh: 3')} />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading || duplikatRealtime}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {loading ? 'Menyimpan…' : editingGroup ? 'Perbarui Data' : 'Tambah Data'}
              </button>
              {editingGroup && (
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tabel Guru */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Daftar Guru
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({filteredList.length} jabatan)
            </span>
          </h3>
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama guru…"
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">No</th>
                <th className="border border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-600">Nama Jabatan Guru</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Rumus</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Kebutuhan</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">PNS</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">PPPK</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Total ASN</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Kurang</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Lebih</th>
                <th className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs">{search ? 'Tidak ada hasil pencarian.' : 'Belum ada data guru. Tambahkan di form di atas.'}</span>
                    </div>
                  </td>
                </tr>
              ) : pagedList.map((g, i) => {
                const keb          = Math.round(g.kebutuhanGuru)
                const selisihBaris = g.totalASN - keb
                const rumus        = g.isBK
                  ? `siswa / 150 = ${keb}`
                  : `(${g.jamMengajarPerMinggu} × ${g.jumlahRombel}) / 24 = ${keb}`
                return (
                  <tr key={g.namaJabatan} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50/80' : 'bg-gray-50/60 hover:bg-gray-100/60'}>
                    <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-400">{(page - 1) * perPage + i + 1}</td>
                    <td className="border border-gray-200 px-3 py-2.5">
                      <span className="font-medium text-gray-800">{g.namaJabatan}</span>
                      {g.isBK && (
                        <span className="ml-1.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 font-medium border border-blue-100">
                          BK
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">
                      <code className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {rumus}
                      </code>
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-800">{keb}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-600">{g.totalPNS}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center text-gray-600">{g.totalPPPK}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-800">{g.totalASN}</td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-red-600">
                      {selisihBaris < 0 ? Math.abs(selisihBaris) : ''}
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center font-semibold text-emerald-600">
                      {selisihBaris > 0 ? selisihBaris : ''}
                    </td>
                    <td className="border border-gray-200 px-3 py-2.5 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => setEditingGroup({ namaJabatan: g.namaJabatan, rowIdByJenjang: g.rowIdByJenjang })}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => askDelete(g)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredList.length > 0 && (
                <tr className="bg-blue-800/5 border-t-2 border-blue-800/20 font-semibold">
                  <td colSpan={3} className="border border-gray-200 px-3 py-2.5 text-xs text-gray-700 font-semibold">
                    Total (semua data)
                  </td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-gray-800">{totalKebutuhan}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-gray-800">{totalPNS}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-gray-800">{totalPPPK}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-gray-800">{totalASN}</td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-red-600">
                    {totalSelisih < 0 ? Math.abs(totalSelisih) : ''}
                  </td>
                  <td className="border border-gray-200 px-3 py-2.5 text-center text-xs font-bold text-emerald-600">
                    {totalSelisih > 0 ? totalSelisih : ''}
                  </td>
                  <td className="border border-gray-200" />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredList.length)} dari {filteredList.length} data
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round"strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    n === page ? 'bg-blue-800 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round"strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <select
              value={perPage}
              onChange={e => setPerPage(Number(e.target.value))}
              className="rounded-lg border border-gray-200 text-xs px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {[5, 10, 20].map(n => <option key={n} value={n}>{n} / halaman</option>)}
            </select>
          </div>
        )}
      </div>

      <AlertModal
        modal={modal}
        onClose={() => setModal(null)}
        onConfirmDelete={confirmDelete}
        onAjukan={handleAjukanJabatan}
        ajukanLoading={ajukanLoading}
      />
    </div>
  )
}
