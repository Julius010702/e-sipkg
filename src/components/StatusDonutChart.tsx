'use client'

interface DonutChartProps {
  draft:     number
  dikirim:   number
  disetujui: number
  total:     number
}

export default function StatusDonutChart({ draft, dikirim, disetujui, total }: DonutChartProps) {
  const size   = 160
  const cx     = size / 2
  const cy     = size / 2
  const radius = 58
  const inner  = 36
  const circumference = 2 * Math.PI * radius

  const segments = [
    { label: 'Draft',     value: draft,     color: '#94a3b8', textColor: 'text-slate-500' },
    { label: 'Dikirim',   value: dikirim,   color: '#60a5fa', textColor: 'text-blue-500'  },
    { label: 'Disetujui', value: disetujui, color: '#34d399', textColor: 'text-emerald-500' },
  ]

  // Hitung arc per segment
  let cumulative = 0
  const arcs = segments.map(seg => {
    const pct    = total > 0 ? seg.value / total : 0
    const dash   = pct * circumference
    const gap    = circumference - dash
    const offset = circumference - cumulative * circumference
    cumulative  += pct
    return { ...seg, pct, dash, gap, offset }
  })

  return (
    <div className="flex items-center gap-6 px-5 py-4">
      {/* SVG Donut */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={radius - inner}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={radius - inner}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          ))}
          {/* Teks tengah */}
          <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-800" fontSize="22" fontWeight="700">
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-400" fontSize="10">
            sekolah
          </text>
        </svg>
      </div>

      {/* Legend + progress bar */}
      <div className="flex-1 space-y-3">
        {arcs.map((arc, i) => (
          <div key={i}>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: arc.color }} />
                {arc.label}
              </span>
              <span className={`font-bold text-xs ${arc.textColor}`}>
                {arc.value} <span className="font-normal text-gray-400">({total > 0 ? Math.round(arc.pct * 100) : 0}%)</span>
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${arc.pct * 100}%`, background: arc.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}