import React from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField?: string
  emptyMessage?: string
  loading?: boolean
  footer?: React.ReactNode
  className?: string
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'Tidak ada data',
  loading = false,
  footer,
  className = '',
}: TableProps<T>) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={[
                    'px-4 py-3 font-semibold text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap',
                    alignClass[col.align || 'left'],
                    col.className || '',
                  ].join(' ')}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={String(row[keyField]) || i} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={[
                        'px-4 py-3',
                        alignClass[col.align || 'left'],
                        col.className || '',
                      ].join(' ')}
                    >
                      {col.render ? col.render(row, i) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {footer && (
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
