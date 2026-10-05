'use client'

import { useState } from 'react'

export default function SekolahAvatar({
  src,
  nama,
  size = 64,
  rounded = '50%',
  bg = '#eff6ff',
  color = '#1d4ed8',
}: {
  src?: string | null
  nama: string
  size?: number
  rounded?: string
  bg?: string
  color?: string
}) {
  const [error, setError] = useState(false)
  const initial = nama?.trim()?.charAt(0)?.toUpperCase() || '?'

  if (!src || error) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: rounded,
          background: bg, color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 800, fontSize: size * 0.38,
          flexShrink: 0, border: '2px solid #e5e7eb',
        }}
      >
        {initial}
      </div>
    )
  }

  // src bisa berupa data URL base64 (dari upload) atau URL eksternal,
  // jadi pakai <img> biasa — next/image tidak mendukung data URL/host
  // yang belum terdaftar di next.config tanpa konfigurasi tambahan.
  return (
    <img
      src={src}
      alt={nama}
      width={size}
      height={size}
      onError={() => setError(true)}
      style={{
        width: size, height: size, borderRadius: rounded,
        objectFit: 'cover', flexShrink: 0, border: '2px solid #e5e7eb',
      }}
    />
  )
}