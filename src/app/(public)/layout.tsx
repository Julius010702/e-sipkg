import HeaderPublik from '@/components/layout/HeaderPublik'
import FooterPublik from '@/components/layout/FooterPublik'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <HeaderPublik />
      <main style={{ flex: 1 }}>{children}</main>
      <FooterPublik />
    </div>
  )
}
