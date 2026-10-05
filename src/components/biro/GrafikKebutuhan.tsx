'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts'

interface DataItem {
  namaJabatan: string
  totalKebutuhan: number
  totalTersedia: number
  totalSelisih: number
}

interface GrafikKebutuhanProps {
  data: DataItem[]
  title?: string
  maxItems?: number
}

const COLORS = {
  kebutuhan: '#6366f1',
  tersedia:  '#22c55e',
  kurang:    '#ef4444',
  lebih:     '#22c55e',
}

export default function GrafikKebutuhan({
  data,
  title = 'Kebutuhan vs Tersedia per Jabatan',
  maxItems = 10,
}: GrafikKebutuhanProps) {
  const displayed = data
    .filter(d => d.totalSelisih !== 0)
    .sort((a, b) => Math.abs(b.totalSelisih) - Math.abs(a.totalSelisih))
    .slice(0, maxItems)
    .map(d => ({
      ...d,
      namaJabatan: d.namaJabatan.length > 14 ? d.namaJabatan.slice(0, 12) + '…' : d.namaJabatan,
      totalKebutuhan: parseFloat(d.totalKebutuhan.toFixed(1)),
      totalTersedia: d.totalTersedia,
    }))

  if (displayed.length === 0) {
    return (
      <div className="card p-8 text-center text-gray-400">
        <p className="text-sm">Belum ada data untuk ditampilkan.</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={displayed} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="namaJabatan"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name === 'totalKebutuhan' ? 'Kebutuhan' : 'Tersedia',
            ]}
            labelStyle={{ fontWeight: 600, color: '#111' }}
          />
          <Legend
            formatter={(value) => value === 'totalKebutuhan' ? 'Kebutuhan' : 'Tersedia'}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="totalKebutuhan" fill={COLORS.kebutuhan} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="totalTersedia" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {displayed.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.totalSelisih > 0 ? COLORS.kurang : COLORS.lebih}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 text-center mt-2">
        Menampilkan {displayed.length} jabatan dengan selisih terbesar
      </p>
    </div>
  )
}
