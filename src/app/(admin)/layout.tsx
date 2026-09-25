import SidebarAdmin from '@/components/layout/SidebarAdmin'
import MobileLayoutAdmin from '@/components/mobile/MobileLayoutAdmin'
import HeaderAdminBar from '@/components/layout/HeaderAdminBar'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }
  const userName = session?.nama ?? 'Admin'
  return (
    <>
      <div className="hidden md:flex h-dvh bg-[#f8f9fb]">
        <SidebarAdmin userName={userName} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <HeaderAdminBar userName={userName} userRole="Super Admin" />
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto px-5 lg:px-6 pt-5 pb-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <div className="md:hidden">
        <MobileLayoutAdmin userName={userName}>
          {children}
        </MobileLayoutAdmin>
      </div>
    </>
  )
}
