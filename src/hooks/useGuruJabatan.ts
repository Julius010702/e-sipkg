import { useState, useEffect, useCallback } from 'react'
import type { GuruJabatan } from '@/types'

export function useGuruJabatan(sekolahId?: string) {
  const [list, setList] = useState<GuruJabatan[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    const query = sekolahId ? `?sekolahId=${sekolahId}` : ''
    fetch(`/api/guru-jabatan${query}`)
      .then(r => r.json())
      .then(d => { if (d.success) setList(d.data) })
      .finally(() => setLoading(false))
  }, [sekolahId])

  useEffect(() => { load() }, [load])

  return { list, loading, reload: load }
}
