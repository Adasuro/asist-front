import { getCurrentUser } from '@/infrastructure/auth/auth.repository'
import { getAssignedSections, getTotalCounts } from '@/infrastructure/attendance/sections.repository'
import { logoutAction } from '@/application/auth/logout.action'
import { redirect } from 'next/navigation'
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

  if (!user) {
    redirect('/login')
  }

  const { profile } = user

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Perfil no encontrado</h1>
        <p>Contacta al administrador del sistema.</p>
      </div>
    )
  }

  const isSuper = profile.rol === 'superusuario'
  
  // Cargar datos reales según el rol
  const counts = isSuper ? await getTotalCounts() : null
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

      {/* Grid de Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isSuper ? (
          <>
            <QuickStat title="Total Estudiantes" value={counts?.estudiantes || 0} icon={<Users size={24} />} color="blue" />
            <QuickStat title="Secciones Activas" value={counts?.secciones || 0} icon={<School size={24} />} color="green" />
            <QuickStat title="Alertas Hoy" value={counts?.alertas || 0} icon={<AlertTriangle size={24} />} color="yellow" />
            <QuickStat title="Asistencia Global" value="0%" icon={<BarChart3 size={24} />} color="purple" />
          </>
        ) : (
          <>
            <QuickStat title="Mis Secciones" value={misSecciones.length} icon={<School size={24} />} color="blue" />
            <QuickStat title="Total Alumnos" value="-" icon={<Users size={24} />} color="green" />
            <QuickStat title="Alertas de mi área" value="0" icon={<AlertTriangle size={24} />} color="yellow" />
            <QuickStat title="Faltas sin Justificar" value="0" icon={<FileText size={24} />} color="red" />
          </>
        )}
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
