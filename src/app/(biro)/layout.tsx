import SidebarBiro from '@/components/layout/SidebarBiro'
import MobileLayoutBiro from '@/components/mobile/MobileLayoutBiro'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function BiroLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'BIRO') {
    redirect('/login')
  }
  const userName = session?.nama ?? 'Biro Organisasi'
  return (
    <>
      <div className="hidden md:flex h-dvh bg-gray-50">
        <SidebarBiro userName={userName} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto px-5 lg:px-6 pt-5 pb-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <div className="md:hidden">
        <MobileLayoutBiro userName={userName}>
          {children}
        </MobileLayoutBiro>
      </div>
    </>
  )
}