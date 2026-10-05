import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'e-SIPKG | Sistem Pemerataan Guru NTT',
  description: 'Sistem Informasi Pemerataan dan Kebutuhan Guru Provinsi Nusa Tenggara Timur',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}