import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function CalendarioPage() {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Calendario Académico</h1>
          <p className="text-gray-500">Eventos, feriados y jornadas de asistencia</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronLeft size={20}/></button>
           <button className="px-4 py-2 font-bold text-gray-700">Abril 2026</button>
           <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {days.map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 h-[600px]">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="border-r border-b border-gray-50 p-2 hover:bg-gray-50 transition-colors group cursor-pointer relative">
              <span className={`text-sm font-medium ${i + 1 === 29 ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                {(i % 31) + 1}
              </span>
              {i + 1 === 29 && (
                <div className="mt-2 p-1.5 bg-blue-50 border border-blue-100 rounded text-[10px] font-bold text-blue-700 leading-tight">
                  Hoy: Revisión de Asistencia
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
