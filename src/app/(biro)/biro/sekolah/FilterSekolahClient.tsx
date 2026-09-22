'use client'

interface FilterSekolahClientProps {
  jenis: string
  status: string
  wilayahId: string
  wilayahList: { id: string; nama: string }[]
}

export default function FilterSekolahClient({
  jenis, status, wilayahId, wilayahList,
}: FilterSekolahClientProps) {

  function navigate(key: string, value: string) {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
    window.location.href = url.toString()
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={jenis}
        onChange={e => navigate('jenis', e.target.value)}
        className="input w-auto"
      >
        <option value="">Semua Jenis</option>
        <option value="SMA">SMA</option>
        <option value="SMK">SMK</option>
        <option value="SLB">SLB</option>
      </select>

      <select
        value={status}
        onChange={e => navigate('status', e.target.value)}
        className="input w-auto"
      >
        <option value="">Semua Status</option>
        <option value="DRAFT">Draft</option>
        <option value="DIKIRIM">Dikirim</option>
        <option value="DISETUJUI">Disetujui</option>
        <option value="DITOLAK">Ditolak</option>
      </select>

      <select
        value={wilayahId}
        onChange={e => navigate('wilayahId', e.target.value)}
        className="input w-auto"
      >
        <option value="">Semua Kabupaten/Kota</option>
        {wilayahList.map(w => (
          <option key={w.id} value={w.id}>{w.nama}</option>
        ))}
      </select>

      <a href="/biro/sekolah" className="btn-secondary text-sm py-2">
        Reset
      </a>
    </div>
  )
}
