import { getCurrentUser } from '@/infrastructure/auth/auth.repository'
import { getAssignedSections } from '@/infrastructure/attendance/sections.repository'
import { logoutAction } from '@/application/auth/logout.action'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { 
  Users, 
  School, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  LogOut, 
  LayoutDashboard,
  ArrowRight,
  Calendar,
  Clock
} from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user || !user.profile) {
    return null // El layout ya maneja la redirección
  }

  const { profile } = user
  const isSuper = profile.rol === 'superusuario'
  
  // Cargar estadísticas reales
  const counts = await (async () => {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth_token')?.value
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/counts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      })
      return await response.json()
    } catch (e) {
      return { estudiantes: 0, secciones: 0, alertas: 0 }
    }
  })()

  const misSecciones = !isSuper ? await getAssignedSections(user.id) : []

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500">Bienvenido de nuevo, {profile.nombre_completo}</p>
      </div>

      {/* Grid de Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStat title={isSuper ? "Total Estudiantes" : "Mis Alumnos"} value={counts?.estudiantes || 0} icon={<Users size={24} />} color="blue" />
        <QuickStat title={isSuper ? "Secciones Activas" : "Mis Secciones"} value={counts?.secciones || 0} icon={<School size={24} />} color="green" />
        <QuickStat title="Alertas Hoy" value={counts?.alertas || 0} icon={<AlertTriangle size={24} />} color="yellow" />
        <QuickStat title="Asistencia Global" value="0%" icon={<BarChart3 size={24} />} color="purple" />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {!isSuper && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Clock className="text-blue-500" size={24} />
                Toma de Asistencia Rápida
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {misSecciones.length > 0 ? misSecciones.map((sec) => (
                  <Link 
                    key={sec.id}
                    href={`/dashboard/asistencia/${sec.id}`}
                    className="p-5 border border-gray-100 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-between group shadow-sm hover:border-blue-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <School size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg">{sec.grado.nombre} - {sec.nombre}</div>
                        <div className="text-sm text-gray-500">{sec.grado.nivel}</div>
                      </div>
                    </div>
                    <ArrowRight className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={24} />
                  </Link>
                )) : (
                  <div className="col-span-2 p-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
                    No tienes secciones asignadas. Contacta al administrador.
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <LayoutDashboard className="text-gray-500" size={24} />
              Acciones de Gestión
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/estudiantes" className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-4 group">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <Search size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Gestión de Estudiantes</div>
                  <div className="text-sm text-gray-500">Padrón, registros e importación</div>
                </div>
              </Link>
              {isSuper && (
                <Link href="/dashboard/reportes" className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-4 group">
                  <div className="bg-gray-100 p-3 rounded-xl text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Reportes Consolidados</div>
                    <div className="text-sm text-gray-500">Estadísticas institucionales</div>
                  </div>
                </Link>
              )}
                <Link href="/dashboard/justificaciones" className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-4 group">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Justificaciones</div>
                  <div className="text-sm text-gray-500">Permisos y licencias médicas</div>
                </div>
              </Link>
              {isSuper && (
                <Link href="/dashboard/auxiliares" className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-4 group">
                  <div className="bg-gray-100 p-3 rounded-xl text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Gestión de Auxiliares</div>
                    <div className="text-sm text-gray-500">Cuentas y asignaciones</div>
                  </div>
                </Link>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Calendar className="text-blue-500" size={24} />
              Información de Hoy
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-1 border-b border-gray-50 pb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha Actual</span>
                <span className="font-bold text-gray-800 text-lg">
                  {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado Académico</span>
                <span className="text-blue-600 font-bold text-lg">Lunes - Semana 1 (Activo)</span>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold text-lg mb-2">Consejo del día</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Recuerda registrar la asistencia durante los primeros 15 minutos de cada sesión para mantener las alertas al día.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function QuickStat({ title, value, icon, color }: { title: string, value: any, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${colors[color] || 'bg-gray-50'}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        <div className="text-xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
  )
}
