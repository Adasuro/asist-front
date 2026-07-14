'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { FileText, Plus, Search, Filter, Calendar, User, School, Clock, Download, Eye } from 'lucide-react'
import { getJustifications } from '@/infrastructure/attendance/attendance.repository'
import { Badge } from '@/presentation/components/ui/Badge'
import { Loader2 } from 'lucide-react'
import JustificationDetailModal from '@/presentation/components/admin/JustificationDetailModal'

export default function JustificacionesPage() {
  const { data: justificationsData, isLoading, mutate: fetchData } = useSWR('/justifications', getJustifications)
  const justifications = justificationsData || []
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJustification, setSelectedJustification] = useState<any | null>(null)

  const filteredJustifications = justifications.filter(j => 
    j.asistencia.estudiante.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.asistencia.estudiante.seccion.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            Justificaciones
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase font-black tracking-widest">Admin</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Gestión de inasistencias y permisos médicos</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
          <Plus size={20} />
          Nueva Justificación
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por estudiante o sección..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={16} />
              Filtrar por Fecha
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-gray-400">
            <div className="relative">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" size={18} />
            </div>
            <p className="font-bold mt-4 tracking-tight">Consultando archivos...</p>
          </div>
        ) : filteredJustifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 font-black uppercase text-[10px] tracking-[0.15em]">
                  <th className="px-8 py-5 text-left">Estudiante</th>
                  <th className="px-8 py-5 text-left">Ubicación Académica</th>
                  <th className="px-8 py-5 text-left">Fecha del Evento</th>
                  <th className="px-8 py-5 text-left">Motivo Resumido</th>
                  <th className="px-8 py-5 text-left">Validado por</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredJustifications.map((j) => (
                  <tr key={j.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                          {j.asistencia.estudiante.nombre_completo?.charAt(0) || '?'}
                        </div>
                        <span className="font-bold text-gray-800">{j.asistencia.estudiante.nombre_completo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-[10px] text-blue-600 uppercase tracking-tight">{j.asistencia.estudiante.seccion.grado.nombre}</span>
                        <span className="font-medium text-gray-500">{j.asistencia.estudiante.seccion.nombre}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 font-bold text-gray-600">
                        <Calendar size={14} className="text-blue-400" />
                        {new Date(j.asistencia.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="max-w-[200px] truncate text-gray-500 font-medium" title={j.motivo}>
                        {j.motivo}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-bold text-xs text-gray-700">{j.registrado_por.nombre_completo}</span>
                          <span className="text-[10px] text-blue-400 uppercase font-black tracking-tighter">{j.registrado_por.rol}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedJustification(j)}
                            className="bg-white text-blue-600 p-2.5 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-90" 
                            title="Ver Registro Completo"
                          >
                             <Eye size={18} />
                          </button>
                          <button className="bg-gray-50 text-gray-400 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90" title="Descargar PDF">
                             <Download size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No hay registros</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 font-medium">
              {searchQuery ? 'Prueba con otro término de búsqueda.' : 'Las justificaciones que registres aparecerán en este listado para su seguimiento oficial.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedJustification && (
          <JustificationDetailModal 
            justification={selectedJustification}
            onClose={() => setSelectedJustification(null)}
          />
      )}
    </div>
  )
}
