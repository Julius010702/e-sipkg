'use client'

interface FilterSekolahProps {
  jenis: string
  wilayah: string
  status: string
  onJenisChange: (v: string) => void
  onWilayahChange: (v: string) => void
  onStatusChange: (v: string) => void
  wilayahList: { id: string; nama: string }[]
}

export default function FilterSekolah({
  jenis, wilayah, status,
  onJenisChange, onWilayahChange, onStatusChange,
  wilayahList,
}: FilterSekolahProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={jenis}
        onChange={e => onJenisChange(e.target.value)}
        className="input w-auto"
      >
        <option value="">Semua Jenis</option>
        <option value="SMA">SMA</option>
        <option value="SMK">SMK</option>
        <option value="SLB">SLB</option>
      </select>

      <select
        value={wilayah}
        onChange={e => onWilayahChange(e.target.value)}
        className="input w-auto"
      >
        <option value="">Semua Kabupaten/Kota</option>
        {wilayahList.map(w => (
          <option key={w.id} value={w.id}>{w.nama}</option>
        ))}
      </select>

      <select
        value={status}
        onChange={e => onStatusChange(e.target.value)}
        className="input w-auto"
      >
        <option value="">Semua Status</option>
        <option value="DRAFT">Draft</option>
        <option value="DIKIRIM">Dikirim</option>
        <option value="DISETUJUI">Disetujui</option>
        <option value="DITOLAK">Ditolak</option>
      </select>
    </div>
  )
}
