import { getCurrentUser } from '@/infrastructure/auth/auth.repository'
import { Sidebar } from '@/presentation/components/ui/Sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !user.profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Componente de cliente */}
      <Sidebar user={user.profile} />
      
      {/* Main Content - Se ajusta según si el sidebar está colapsado o no mediante padding dinámico */}
      {/* Nota: Como el sidebar es fixed para evitar saltos de layout, usamos un wrapper con margen */}
      <main className="flex-1 transition-all duration-300 ml-20 lg:ml-64">
        {/* Usamos clases dinámicas en el cliente para el margen exacto, 
            pero por ahora dejamos un margen base que se ajustará con el estado del sidebar 
            en una versión más pulida. Por ahora, el contenido principal tendrá este margen. */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
