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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Acceso No Autorizado</h1>
          <p className="text-gray-500 mb-6 text-sm">No hemos podido validar tu perfil de usuario. Por favor, intenta iniciar sesión nuevamente.</p>
          <form action={logoutAction}>
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
              Volver al Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  const { profile } = user

  const isSuper = profile.rol === 'superusuario'
  
  // Cargar estadísticas reales desde el nuevo endpoint
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-sm text-gray-500">Bienvenido, {profile.nombre_completo}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isSuper ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {profile.rol.toUpperCase()}
          </span>
          <form action={logoutAction}>
            <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-all border border-red-100 hover:bg-red-100">
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      {/* Grid de Accesos Rápidos con Datos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickStat title={isSuper ? "Total Estudiantes" : "Mis Alumnos"} value={counts?.estudiantes || 0} icon={<Users size={24} />} color="blue" />
        <QuickStat title={isSuper ? "Secciones Activas" : "Mis Secciones"} value={counts?.secciones || 0} icon={<School size={24} />} color="green" />
        <QuickStat title="Alertas Hoy" value={counts?.alertas || 0} icon={<AlertTriangle size={24} />} color="yellow" />
        <QuickStat title="Asistencia Global" value="0%" icon={<BarChart3 size={24} />} color="purple" />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!isSuper && (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Clock className="text-blue-500" size={20} />
                Toma de Asistencia Rápida
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {misSecciones.length > 0 ? misSecciones.map((sec) => (
                  <Link 
                    key={sec.id}
                    href={`/dashboard/asistencia/${sec.id}`}
                    className="p-4 border border-gray-100 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-between group shadow-sm hover:border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <School size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{sec.grado.nombre} - {sec.nombre}</div>
                        <div className="text-xs text-gray-500">Haz clic para registrar</div>
                      </div>
                    </div>
                    <ArrowRight className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={20} />
                  </Link>
                )) : (
                  <div className="col-span-2 p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    No tienes secciones asignadas. Contacta al administrador.
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <LayoutDashboard className="text-gray-500" size={20} />
              Acciones de Gestión
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/estudiantes" className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 group">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <Search size={20} />
                </div>
                <div>
                  <div className="font-medium">Buscar Estudiante</div>
                  <div className="text-xs text-gray-500">Ver historial de asistencias</div>
                </div>
              </Link>
              {isSuper && (
                <Link href="/dashboard/reportes" className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 group">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="font-medium">Reportes Generales</div>
                    <div className="text-xs text-gray-500">Estadísticas por grado/nivel</div>
                  </div>
                </Link>
              )}
                <Link href="/dashboard/justificaciones" className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 group">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-medium">Justificaciones</div>
                  <div className="text-xs text-gray-500">Gestionar permisos médicos</div>
                </div>
              </Link>
              {isSuper && (
                <Link href="/dashboard/auxiliares" className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 group">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="font-medium">Gestión de Auxiliares</div>
                    <div className="text-xs text-gray-500">Cuentas, grados y accesos</div>
                  </div>
                </Link>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <AlertTriangle className="text-yellow-500" size={20} />
              Alertas Recientes
            </h2>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CheckCircle2 size={48} className="text-green-500 mb-4" />
              <p className="text-sm font-medium">No hay alertas pendientes para hoy</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Calendar className="text-blue-500" size={20} />
              Información de Hoy
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Fecha</span>
                <span className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Día Lectivo</span>
                <span className="text-blue-600 font-bold">Lunes - Semana 1</span>
              </div>
            </div>
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
