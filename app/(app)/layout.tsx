import { requireAuth } from '@/lib/auth'
import Sidebar from '@/components/app/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Redirige vers /login si pas de token — requireAuth() appelle redirect() si absent
  requireAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
