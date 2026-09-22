'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  nip: string
  nama: string
  email?: string       // opsional — hanya info kontak
  role: string
  isAktif: boolean
  sekolahId?: string
  sekolah?: { nama: string }
  wilayahId?: string
  wilayah?: { nama: string }
  createdAt: string
}

interface Wilayah {
  id: string
  nama: string
}

const emptyForm = {
  nip:          '',
  password:     '',
  role:         'SEKOLAH',
  namaUser:     '',   // nama lengkap / nama sekolah
  email:        '',   // opsional
  jenisSekolah: 'SMA',
  wilayahId:    '',
}

const emptyEdit = { nama: '', nip: '', password: '', email: '' }

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({
  open, onClose, title, subtitle, children,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'modalIn 0.18s ease-out',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, background: '#fff', borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            background: '#f3f4f6', border: 'none', borderRadius: 8, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  )
}

export default function AdminUsersPage() {
  const [list, setList]               = useState<User[]>([])
  const [wilayahList, setWilayahList] = useState<Wilayah[]>([])
  const [form, setForm]               = useState(emptyForm)
  const [editUser, setEditUser]       = useState<User | null>(null)
  const [editForm, setEditForm]       = useState(emptyEdit)
  const [msg, setMsg]                 = useState({ type: '', text: '' })
  const [editMsg, setEditMsg]         = useState({ type: '', text: '' })
  const [loading, setLoading]         = useState(false)
  const [filter, setFilter]           = useState('SEMUA')
  const [search, setSearch]           = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showEditPw, setShowEditPw]   = useState(false)
  const [showAddModal, setShowAddModal]   = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  function load() {
    fetch('/api/users').then(r => r.json()).then(d => setList(Array.isArray(d.data) ? d.data : []))
    fetch('/api/wilayah').then(r => r.json()).then(d => setWilayahList(Array.isArray(d.data) ? d.data : []))
  }

  useEffect(() => { load() }, [])

  function openAddModal() {
    setForm(emptyForm)
    setMsg({ type: '', text: '' })
    setShowPw(false)
    setShowAddModal(true)
  }

  function closeAddModal() {
    setShowAddModal(false)
  }

  function openEditModal(u: User) {
    setEditUser(u)
    setEditForm({ nama: u.nama, nip: u.nip, password: '', email: u.email || '' })
    setEditMsg({ type: '', text: '' })
    setShowEditPw(false)
    setShowEditModal(true)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditUser(null)
    setEditForm(emptyEdit)
  }

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })

    if (!form.nip.trim())     { setMsg({ type: 'error', text: 'NIP wajib diisi' });          setLoading(false); return }
    if (!form.namaUser.trim()){ setMsg({ type: 'error', text: 'Nama wajib diisi' });          setLoading(false); return }
    if (form.role === 'SEKOLAH' && !form.wilayahId) {
      setMsg({ type: 'error', text: 'Wilayah wajib dipilih untuk akun Sekolah' })
      setLoading(false); return
    }
    if (form.role === 'WILAYAH' && !form.wilayahId) {
      setMsg({ type: 'error', text: 'Wilayah wajib dipilih untuk akun Wilayah' })
      setLoading(false); return
    }

    try {
      const res = await fetch('/api/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nip:          form.nip.trim(),
          password:     form.password,
          nama:         form.namaUser.trim(),
          role:         form.role,
          email:        form.email.trim() || undefined,
          namaSekolah:  form.role === 'SEKOLAH' ? form.namaUser.trim() : undefined,
          jenisSekolah: form.role === 'SEKOLAH' ? form.jenisSekolah : undefined,
          wilayahId:    (form.role === 'SEKOLAH' || form.role === 'WILAYAH') ? form.wilayahId : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: data.error }); return }
      setMsg({ type: 'success', text: `Akun ${form.namaUser} berhasil dibuat!` })
      setForm(emptyForm)
      setShowPw(false)
      load()
      setTimeout(() => setShowAddModal(false), 900)
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' })
    } finally { setLoading(false) }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setLoading(true)
    setEditMsg({ type: '', text: '' })
    const body: Record<string, string> = {}
    if (editForm.nama)     body.nama     = editForm.nama
    if (editForm.nip)      body.nip      = editForm.nip
    if (editForm.email)    body.email    = editForm.email
    if (editForm.password) body.password = editForm.password
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setEditMsg({ type: 'error', text: data.error }); return }
      setEditMsg({ type: 'success', text: 'Akun berhasil diperbarui!' })
      load()
      setTimeout(() => closeEditModal(), 900)
    } catch {
      setEditMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' })
    } finally { setLoading(false) }
  }

  async function toggleAktif(user: User) {
    if (!confirm(`${user.isAktif ? 'Nonaktifkan' : 'Aktifkan'} akun ${user.nama}?`)) return
    await fetch(`/api/users/${user.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAktif: !user.isAktif }),
    })
    load()
  }

  async function handleDelete(user: User) {
    const peringatan = user.role === 'SEKOLAH'
      ? `Hapus permanen akun ${user.nama}?\n\nKarena ini akun SEKOLAH, seluruh data sekolahnya (data guru, riwayat validasi, permohonan jabatan) akan IKUT TERHAPUS juga. Tindakan ini tidak bisa dibatalkan.`
      : `Hapus permanen akun ${user.nama}? Tindakan ini tidak bisa dibatalkan.`
    if (!confirm(peringatan)) return
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
    load()
  }

  const roleColor: Record<string, string> = {
    ADMIN:   'bg-red-100 text-red-700',
    BIRO:    'bg-indigo-100 text-indigo-700',
    WILAYAH: 'bg-teal-100 text-teal-700',
    SEKOLAH: 'bg-blue-100 text-blue-700',
  }

  const filtered = list
    .filter(u => {
      if (filter === 'SEMUA')    return true
      if (filter === 'AKTIF')    return u.isAktif
      if (filter === 'NONAKTIF') return !u.isAktif
      return u.role === filter
    })
    .filter(u => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return u.nama.toLowerCase().includes(q) || u.nip.includes(q) || (u.email || '').toLowerCase().includes(q)
    })

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Kelola Pengguna</h2>
          <p className="text-sm text-gray-500">
            Semua pengguna (Sekolah · Biro · Admin) login menggunakan <strong>NIP</strong> dan password
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
        >
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14"/>
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* ── Daftar Pengguna ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-semibold text-gray-800">
            Daftar Pengguna <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} akun)</span>
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama / NIP / email..."
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-48"
            />
            <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1 -mb-1">
              {['SEMUA','AKTIF','NONAKTIF','SEKOLAH','WILAYAH','BIRO','ADMIN'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                    filter === f ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop: tabel ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Nama','NIP','Role','Email','Sekolah','Status','Dibuat','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 ${!u.isAktif ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nama}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-700">{u.nip}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.email || <span className="text-gray-200">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.sekolah?.nama || u.wilayah?.nama || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isAktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isAktif ? '● Aktif' : '● Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => openEditModal(u)}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded font-medium">Edit</button>
                      <button onClick={() => toggleAktif(u)}
                        className={`text-xs px-2 py-1 rounded font-medium ${u.isAktif ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button onClick={() => handleDelete(u)}
                        className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1 rounded font-medium">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile: card list ── */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">Tidak ada data</p>
          ) : filtered.map(u => (
            <div key={u.id} className={`px-4 py-3.5 ${!u.isAktif ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{u.nama}</p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{u.nip}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleColor[u.role]}`}>{u.role}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-gray-500">
                <span className={`font-semibold px-2 py-0.5 rounded-full ${u.isAktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {u.isAktif ? '● Aktif' : '● Nonaktif'}
                </span>
                {u.email && <span className="truncate">{u.email}</span>}
                {u.sekolah?.nama && <span className="truncate">{u.sekolah.nama}</span>}
                {u.wilayah?.nama && <span className="truncate">{u.wilayah.nama}</span>}
                <span className="text-gray-400">{new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => openEditModal(u)}
                  className="text-xs flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1.5 rounded font-medium">Edit</button>
                <button onClick={() => toggleAktif(u)}
                  className={`text-xs flex-1 px-2 py-1.5 rounded font-medium ${u.isAktif ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {u.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => handleDelete(u)}
                  className="text-xs flex-1 bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1.5 rounded font-medium">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal Tambah ── */}
      <Modal
        open={showAddModal}
        onClose={closeAddModal}
        title="Tambah Akun Baru"
        subtitle="NIP wajib diisi untuk semua role — digunakan sebagai username login"
      >
        {msg.text && (
          <div className={`text-sm rounded-lg px-3 py-2 mb-3 border ${
            msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>{msg.text}</div>
        )}

        <form onSubmit={handleTambah} className="space-y-3">
          <div>
            <label className="label">Role *</label>
            <select className="input" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value, wilayahId: '', jenisSekolah: 'SMA' }))}>
              <option value="SEKOLAH">Sekolah</option>
              <option value="WILAYAH">Wilayah (monitoring per kabupaten/kota)</option>
              <option value="BIRO">Biro</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="label">NIP * <span className="text-xs font-normal text-gray-400">(username login)</span></label>
            <input className="input font-mono" value={form.nip}
              onChange={e => setForm(f => ({ ...f, nip: e.target.value }))}
              placeholder="Contoh: 19850101 201001 1 001" required />
          </div>

          <div>
            <label className="label">{form.role === 'SEKOLAH' ? 'Nama Sekolah' : 'Nama Lengkap'} *</label>
            <input className="input" value={form.namaUser}
              onChange={e => setForm(f => ({ ...f, namaUser: e.target.value }))}
              placeholder={form.role === 'SEKOLAH' ? 'Contoh: SMA Negeri 1 Kupang' : 'Masukkan nama lengkap'} required />
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-10"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required minLength={6} placeholder="Minimal 6 karakter" />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700">
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <div>
            <label className="label">Email <span className="text-xs font-normal text-gray-400">(opsional — info kontak)</span></label>
            <input type="email" className="input" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="nama@nttprov.go.id" />
            <p className="text-xs text-gray-400 mt-1">Email bukan digunakan untuk login, hanya sebagai informasi kontak.</p>
          </div>

          {form.role === 'SEKOLAH' && (
            <>
              <div>
                <label className="label">Jenis Sekolah *</label>
                <select className="input" value={form.jenisSekolah}
                  onChange={e => setForm(f => ({ ...f, jenisSekolah: e.target.value }))}>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                  <option value="SLB">SLB</option>
                </select>
              </div>
              <div>
                <label className="label">Wilayah *</label>
                <select className="input" value={form.wilayahId}
                  onChange={e => setForm(f => ({ ...f, wilayahId: e.target.value }))} required>
                  <option value="">-- Pilih Wilayah --</option>
                  {wilayahList.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
                </select>
              </div>
            </>
          )}

          {form.role === 'WILAYAH' && (
            <div>
              <label className="label">Wilayah (Kabupaten/Kota) *</label>
              <select className="input" value={form.wilayahId}
                onChange={e => setForm(f => ({ ...f, wilayahId: e.target.value }))} required>
                <option value="">-- Pilih Wilayah --</option>
                {wilayahList.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Akun ini hanya bisa memantau data sekolah di wilayah yang dipilih — tidak bisa verifikasi/menghapus data.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <button type="button" onClick={closeAddModal} className="btn-secondary w-full sm:w-auto">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Menyimpan...' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Edit ── */}
      <Modal
        open={showEditModal}
        onClose={closeEditModal}
        title={editUser ? `Edit Akun — ${editUser.nama}` : 'Edit Akun'}
      >
        {editUser && (
          <>
            {editMsg.text && (
              <div className={`text-sm rounded-lg px-3 py-2 mb-3 border ${
                editMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>{editMsg.text}</div>
            )}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p><span className="text-gray-500">Role:</span>
                <span className={`font-semibold ml-1 px-2 py-0.5 rounded-full text-xs ${roleColor[editUser.role]}`}>{editUser.role}</span>
              </p>
              <p className="mt-1 font-mono text-xs text-gray-500">NIP saat ini: <span className="text-gray-800">{editUser.nip}</span></p>
              {editUser.sekolah && <p className="mt-1 text-gray-500">Sekolah: <span className="text-gray-700">{editUser.sekolah.nama}</span></p>}
              {editUser.wilayah && <p className="mt-1 text-gray-500">Wilayah: <span className="text-gray-700">{editUser.wilayah.nama}</span></p>}
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="label">Nama Baru</label>
                <input className="input" value={editForm.nama}
                  onChange={e => setEditForm(f => ({ ...f, nama: e.target.value }))}
                  placeholder={editUser.nama} />
              </div>
              <div>
                <label className="label">NIP Baru</label>
                <input className="input font-mono" value={editForm.nip}
                  onChange={e => setEditForm(f => ({ ...f, nip: e.target.value }))}
                  placeholder={editUser.nip} />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah NIP.</p>
              </div>
              <div>
                <label className="label">Email Baru <span className="text-xs font-normal text-gray-400">(opsional)</span></label>
                <input type="email" className="input" value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={editUser.email || 'Kosongkan jika tidak diubah'} />
              </div>
              <div>
                <label className="label">Password Baru</label>
                <div className="relative">
                  <input type={showEditPw ? 'text' : 'password'} className="input pr-10"
                    value={editForm.password}
                    onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Kosongkan jika tidak diubah" minLength={6} />
                  <button type="button" tabIndex={-1} onClick={() => setShowEditPw(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700">
                    <EyeIcon open={showEditPw} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                <button type="button" onClick={closeEditModal} className="btn-secondary w-full sm:w-auto">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  )
}