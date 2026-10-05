import SidebarSekolah from '@/components/layout/SidebarSekolah'
import MobileLayoutSekolah from '@/components/mobile/MobileLayoutSekolah'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SekolahLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'SEKOLAH') {
    redirect('/login')
  }
  const userName = session?.nama ?? 'Portal Sekolah'
  return (
    <>
      <div className="hidden md:flex h-dvh bg-[#f5f5f5]">
        <SidebarSekolah userName={userName} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto px-5 lg:px-6 pt-5 pb-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <div className="md:hidden">
        <MobileLayoutSekolah userName={userName}>
          {children}
        </MobileLayoutSekolah>
      </div>
    </>
  )
}