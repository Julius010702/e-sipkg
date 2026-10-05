import { useState, useEffect } from 'react'
import type { RekapKebutuhan } from '@/types'

export function useAnalisisRekap(params?: { wilayahId?: string; periodeId?: string }) {
  const [rekap, setRekap] = useState<RekapKebutuhan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = new URLSearchParams()
    if (params?.wilayahId) query.set('wilayahId', params.wilayahId)
    if (params?.periodeId) query.set('periodeId', params.periodeId)

    fetch(`/api/analisis/rekap?${query}`)
      .then(r => r.json())
      .then(d => { if (d.success) setRekap(d.data) })
      .finally(() => setLoading(false))
  }, [params?.wilayahId, params?.periodeId])

  return { rekap, loading }
}
