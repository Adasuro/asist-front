import { FileText, Plus, Search, Filter } from 'lucide-react'

export default function JustificacionesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Justificaciones</h1>
          <p className="text-gray-500">Gestión de inasistencias y permisos médicos</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
          <Plus size={20} />
          Nueva Justificación
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por estudiante o sección..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="p-12 text-center">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No hay justificaciones registradas</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Las justificaciones que registres aparecerán en este listado para su seguimiento.
          </p>
        </div>
      </div>
    </div>
  )
}
