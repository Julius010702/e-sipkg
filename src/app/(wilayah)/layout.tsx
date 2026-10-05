import SidebarWilayah from '@/components/layout/SidebarWilayah'
import MobileLayoutWilayah from '@/components/mobile/MobileLayoutWilayah'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function WilayahLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'WILAYAH') {
    redirect('/login')
  }
  const userName = session?.nama ?? 'Wilayah'

  const wilayah = session.wilayahId
    ? await prisma.wilayah.findUnique({ where: { id: session.wilayahId }, select: { nama: true } })
    : null
  const wilayahNama = wilayah?.nama

  return (
    <>
      <div className="hidden md:flex h-dvh bg-gray-50">
        <SidebarWilayah userName={userName} wilayahNama={wilayahNama} />
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
        <MobileLayoutWilayah userName={userName} wilayahNama={wilayahNama}>
          {children}
        </MobileLayoutWilayah>
      </div>
    </>
  )
}
