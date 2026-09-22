'use client'

import { useEffect, useState } from 'react'

export default function ScrollUtils() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const docH    = document.documentElement.scrollHeight - window.innerHeight

      setVisible(scrollY > 300)
      setProgress(docH > 0 ? (scrollY / docH) * 100 : 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Reading progress bar */}
      <div
        aria-hidden="true"
        style={{
          position:   'fixed',
          top:        '3px',
          left:       0,
          height:     '2px',
          width:      `${progress}%`,
          background: 'rgba(96,165,250,0.55)',
          zIndex:     9998,
          transition: 'width 0.1s linear',
          pointerEvents: 'none',
        }}
      />

      {/* Back-to-top button */}
      <button
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position:     'fixed',
          bottom:       '80px',
          right:        '18px',
          width:        '38px',
          height:       '38px',
          borderRadius: '10px',
          background:   '#1e40af',
          border:       'none',
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          boxShadow:    '0 4px 16px rgba(30,64,175,0.35)',
          opacity:      visible ? 1 : 0,
          transform:    visible ? 'translateY(0)' : 'translateY(10px)',
          transition:   'opacity 0.3s, transform 0.3s, background 0.2s',
          zIndex:       200,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <svg
          width={16} height={16}
          fill="none" viewBox="0 0 24 24"
          stroke="white" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  )
}