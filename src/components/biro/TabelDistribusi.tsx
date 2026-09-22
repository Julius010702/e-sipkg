'use client'

interface DistribusiRow {
  jabatan: string
  totalDefisit: string
  totalSurplus: string
  bisa_dipindahkan: string
  sekolahKekurangan: { nama: string; wilayah: string; selisih: number }[]
  sekolahKelebihan: { nama: string; wilayah: string; selisih: number }[]
}

interface TabelDistribusiProps {
  data: DistribusiRow[]
}

export default function TabelDistribusi({ data }: TabelDistribusiProps) {
  if (data.length === 0) {
    return (
      <div className="card p-8 text-center text-gray-400 text-sm">
        Tidak ada rekomendasi distribusi saat ini.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((r, i) => (
        <div key={i} className="card overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">{r.jabatan}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                Defisit: {r.totalDefisit}
              </span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                Surplus: {r.totalSurplus}
              </span>
              <span className="text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-bold">
                Bisa pindah: {r.bisa_dipindahkan} guru
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Kekurangan */}
            <div className="p-4">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">
                📍 Sekolah Kekurangan ({r.sekolahKekurangan.length})
              </p>
              <div className="space-y-1.5">
                {r.sekolahKekurangan.slice(0, 5).map((s, j) => (
                  <div key={j} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate">{s.nama}</p>
                      <p className="text-xs text-gray-400">{s.wilayah}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600 ml-2 flex-shrink-0">
                      +{s.selisih.toFixed(1)}
                    </span>
                  </div>
                ))}
                {r.sekolahKekurangan.length > 5 && (
                  <p className="text-xs text-gray-400 pl-2">+{r.sekolahKekurangan.length - 5} sekolah lainnya</p>
                )}
              </div>
            </div>

            {/* Kelebihan */}
            <div className="p-4">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">
                ✅ Sekolah Kelebihan ({r.sekolahKelebihan.length})
              </p>
              {r.sekolahKelebihan.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Tidak ada sekolah dengan kelebihan guru ini.</p>
              ) : (
                <div className="space-y-1.5">
                  {r.sekolahKelebihan.slice(0, 5).map((s, j) => (
                    <div key={j} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{s.nama}</p>
                        <p className="text-xs text-gray-400">{s.wilayah}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600 ml-2 flex-shrink-0">
                        -{s.selisih.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {r.sekolahKelebihan.length > 5 && (
                    <p className="text-xs text-gray-400 pl-2">+{r.sekolahKelebihan.length - 5} sekolah lainnya</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
