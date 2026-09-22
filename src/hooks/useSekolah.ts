import { useState, useEffect } from 'react'
import type { Sekolah } from '@/types'

export function useSekolah(id?: string) {
  const [sekolah, setSekolah] = useState<Sekolah | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const url = id ? `/api/sekolah/${id}` : '/api/sekolah/me'
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSekolah(d.data)
        else setError(d.error)
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [id])

  return { sekolah, loading, error }
}

export function useSekolahList(params?: { jenis?: string; wilayahId?: string; status?: string }) {
  const [list, setList] = useState<Sekolah[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = new URLSearchParams()
    if (params?.jenis) query.set('jenis', params.jenis)
    if (params?.wilayahId) query.set('wilayahId', params.wilayahId)
    if (params?.status) query.set('status', params.status)

    fetch(`/api/sekolah?${query}`)
      .then(r => r.json())
      .then(d => { if (d.success) setList(d.data) })
      .finally(() => setLoading(false))
  }, [params?.jenis, params?.wilayahId, params?.status])

  return { list, loading }
}
