import { getAssignedSections } from '@/infrastructure/attendance/sections.repository'
import { getCurrentUser } from '@/infrastructure/auth/auth.repository'
import { ClipboardCheck, School, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AsistenciaPage() {
  const user = await getCurrentUser()
  const misSecciones = user ? await getAssignedSections(user.id) : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Control de Asistencia</h1>
        <p className="text-gray-500">Selecciona una sección para registrar la asistencia de hoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {misSecciones.length > 0 ? misSecciones.map((sec) => (
          <Link 
            key={sec.id}
            href={`/dashboard/asistencia/${sec.id}`}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <School size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase">
                    {sec.grado.nivel}
                </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{sec.grado.nombre}</h3>
              <p className="text-gray-500">Sección: <span className="font-bold text-blue-600">{sec.nombre}</span></p>
            </div>
            <div className="mt-6 flex items-center justify-between text-blue-600 font-bold text-sm">
                <span>Registrar ahora</span>
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        )) : (
          <div className="col-span-full p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <ClipboardCheck size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No tienes secciones asignadas</h3>
          </div>
        )}
      </div>
    </div>
  )
}
