import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without clsx dependency
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatAngka(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}

export function formatSelisih(selisih: number): string {
  if (selisih > 0) return `+${selisih.toFixed(1)}`
  return selisih.toFixed(1)
}

export function statusDataLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Draft',
    DIKIRIM: 'Dikirim',
    DISETUJUI: 'Disetujui',
    DITOLAK: 'Ditolak',
  }
  return map[status] || status
}

export function statusDataColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    DIKIRIM: 'bg-blue-100 text-blue-700',
    DISETUJUI: 'bg-green-100 text-green-700',
    DITOLAK: 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

export function jenisSekolahColor(jenis: string): string {
  const map: Record<string, string> = {
    SMA: 'bg-indigo-100 text-indigo-700',
    SMK: 'bg-orange-100 text-orange-700',
    SLB: 'bg-teal-100 text-teal-700',
  }
  return map[jenis] || 'bg-gray-100 text-gray-700'
}

export function apiResponse(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}
