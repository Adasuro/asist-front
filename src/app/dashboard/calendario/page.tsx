'use client'

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X, 
  Calendar, 
  Info, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react'
import { HttpClient } from '@/infrastructure/api/http-client'

interface Evento {
  id: string
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  tipo: 'feriado' | 'reunion' | 'examen' | 'actividad' | 'otro'
}

function getPeruvianHoliday(month: number, day: number, year: number): string | null {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  if (month === 0 && day === 1) return 'Año Nuevo'
  
  // Holy Week (Jueves Santo & Viernes Santo)
  if (month === 3) { // April
    if (year === 2026 && day === 2) return 'Jueves Santo'
    if (year === 2026 && day === 3) return 'Viernes Santo'
    if (year === 2028 && day === 13) return 'Jueves Santo'
    if (year === 2028 && day === 14) return 'Viernes Santo'
  }
  if (month === 2) { // March
    if (year === 2027 && day === 25) return 'Jueves Santo'
    if (year === 2027 && day === 26) return 'Viernes Santo'
  }

  if (month === 4 && day === 1) return 'Día del Trabajo'
  if (month === 5 && day === 7) return 'Batalla de Arica / Día de la Bandera'
  if (month === 5 && day === 29) return 'San Pedro y San Pablo'
  if (month === 6 && day === 23) return 'Día de la Fuerza Aérea del Perú'
  if (month === 6 && day === 28) return 'Fiestas Patrias'
  if (month === 6 && day === 29) return 'Fiestas Patrias'
  if (month === 7 && day === 6) return 'Batalla de Junín'
  if (month === 7 && day === 30) return 'Santa Rosa de Lima'
  if (month === 9 && day === 8) return 'Combate de Angamos'
  if (month === 10 && day === 1) return 'Día de Todos los Santos'
  if (month === 11 && day === 8) return 'Inmaculada Concepción'
  if (month === 11 && day === 9) return 'Batalla de Ayacucho'
  if (month === 11 && day === 25) return 'Navidad'
  return null
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const viewMonth = currentDate.getMonth()
  const viewYear = currentDate.getFullYear()

  // User auth state
  const { data: userData } = useSWR('/user', () => HttpClient.get<any>('/user'))
  const isSuper = userData?.rol === 'superusuario'

  // Events API state
  const { data: eventsData, mutate: revalidateEvents, isLoading: loadingEvents } = useSWR<Evento[]>(
    '/events',
    () => HttpClient.get<Evento[]>('/events')
  )
  const events = eventsData || []

  // Modals state
  const [selectedDay, setSelectedDay] = useState<{ day: number; isCurrentMonth: boolean; dateString: string } | null>(null)
  const [activeEvent, setActiveEvent] = useState<Evento | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form fields state
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<'feriado' | 'reunion' | 'examen' | 'actividad' | 'otro'>('actividad')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Reset form when creating or editing changes
  useEffect(() => {
    if (activeEvent) {
      setTitulo(activeEvent.titulo)
      setDescripcion(activeEvent.descripcion || '')
      setTipo(activeEvent.tipo)
      setFechaInicio(activeEvent.fecha_inicio)
      setFechaFin(activeEvent.fecha_fin)
    } else if (selectedDay) {
      setTitulo('')
      setDescripcion('')
      setTipo('actividad')
      setFechaInicio(selectedDay.dateString)
      setFechaFin(selectedDay.dateString)
    }
  }, [activeEvent, selectedDay])

  // Calcular días del mes
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  
  // Días del mes anterior para rellenar
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate()
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: prevMonthLastDay - firstDayOfMonth + i + 1,
    currentMonth: false
  }))

  // Días del mes actual
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true
  }))

  // Combinar días para la cuadrícula
  const allDays = [...prevMonthDays, ...currentMonthDays]
  // Rellenar hasta completar 42 celdas (6 semanas)
  const remainingDays = 42 - allDays.length
  const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
    day: i + 1,
    currentMonth: false
  }))

  const calendarGrid = [...allDays, ...nextMonthDays]

  const isToday = (day: number, isCurrentMonth: boolean) => {
    const today = new Date()
    return isCurrentMonth && 
           day === today.getDate() && 
           viewMonth === today.getMonth() && 
           viewYear === today.getFullYear()
  }

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewYear, viewMonth + offset, 1)
    setCurrentDate(newDate)
  }

  const getDayDateString = (day: number, isCurrentMonth: boolean) => {
    let m = viewMonth
    let y = viewYear
    if (!isCurrentMonth) {
      if (day > 15) {
        m = viewMonth === 0 ? 11 : viewMonth - 1
        y = viewMonth === 0 ? viewYear - 1 : viewYear
      } else {
        m = viewMonth === 11 ? 0 : viewMonth + 1
        y = viewMonth === 11 ? viewYear + 1 : viewYear
      }
    }
    const monthStr = String(m + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${y}-${monthStr}-${dayStr}`
  }

  // Get all items on a day
  const getDayEvents = (dateStr: string, day: number, isCurrentMonth: boolean) => {
    // 1. Get database events for this date range
    const filteredDbEvents = events.filter(e => e.fecha_inicio <= dateStr && e.fecha_fin >= dateStr)

    // 2. Get Peruvian holidays
    let m = viewMonth
    let y = viewYear
    if (!isCurrentMonth) {
      if (day > 15) {
        m = viewMonth === 0 ? 11 : viewMonth - 1
        y = viewMonth === 0 ? viewYear - 1 : viewYear
      } else {
        m = viewMonth === 11 ? 0 : viewMonth + 1
        y = viewMonth === 11 ? viewYear + 1 : viewYear
      }
    }
    const holiday = getPeruvianHoliday(m, day, y)

    const list: any[] = []
    if (holiday) {
      list.push({
        id: `peru-holiday-${dateStr}`,
        titulo: `🇵🇪 ${holiday}`,
        tipo: 'feriado',
        isHoliday: true,
        descripcion: 'Feriado Oficial según el Calendario Peruano.'
      })
    }
    filteredDbEvents.forEach(e => {
      list.push({ ...e, isHoliday: false })
    })

    return list
  }

  // Handle Event Submit
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !fechaInicio || !fechaFin) return

    setSubmitting(true)
    setError(null)
    try {
      if (activeEvent) {
        // Edit Mode
        await HttpClient.patch(`/events/${activeEvent.id}`, {
          titulo,
          descripcion,
          tipo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        })
      } else {
        // Create Mode
        await HttpClient.post('/events', {
          titulo,
          descripcion,
          tipo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        })
      }
      revalidateEvents()
      closeModals()
    } catch (err: any) {
      setError(err.message || 'Error al guardar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Event Delete
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return
    setSubmitting(true)
    setError(null)
    try {
      await HttpClient.delete(`/events/${id}`)
      revalidateEvents()
      closeModals()
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  const closeModals = () => {
    setSelectedDay(null)
    setActiveEvent(null)
    setIsCreating(false)
    setError(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-600" size={28} />
            Calendario Académico
          </h1>
          <p className="text-gray-500 font-medium mt-1">Planifica actividades escolares y consulta festividades oficiales de Perú</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner">
           <button 
             onClick={() => changeMonth(-1)}
             className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500 cursor-pointer"
             title="Mes anterior"
           >
             <ChevronLeft size={20}/>
           </button>
           <span className="font-black text-gray-700 min-w-[140px] text-center text-sm uppercase tracking-wide">
             {monthNames[viewMonth]} {viewYear}
           </span>
           <button 
             onClick={() => changeMonth(1)}
             className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500 cursor-pointer"
             title="Mes siguiente"
           >
             <ChevronRight size={20}/>
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {daysOfWeek.map(day => (
            <div key={day} className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 border-collapse">
          {calendarGrid.map((item, i) => {
            const today = isToday(item.day, item.currentMonth)
            const dateStr = getDayDateString(item.day, item.currentMonth)
            const dayEvents = getDayEvents(dateStr, item.day, item.currentMonth)

            return (
              <div 
                key={i} 
                onClick={() => {
                  setSelectedDay({
                    day: item.day,
                    isCurrentMonth: item.currentMonth,
                    dateString: dateStr
                  })
                }}
                className={`min-h-[120px] border-r border-b border-gray-50 p-3 hover:bg-blue-50/10 transition-all group relative cursor-pointer flex flex-col justify-between ${!item.currentMonth ? 'bg-gray-50/30' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                    today 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                      : item.currentMonth ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {item.day}
                  </span>
                  
                  {isSuper && item.currentMonth && (
                    <span className="p-1 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={14} />
                    </span>
                  )}
                </div>
                
                {/* Event Tags inside the cell */}
                <div className="mt-2 space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.slice(0, 3).map((evt: any, idx: number) => {
                    const badgeStyles = {
                      feriado: 'bg-red-50 text-red-700 border-red-100',
                      reunion: 'bg-purple-50 text-purple-700 border-purple-100',
                      examen: 'bg-blue-50 text-blue-700 border-blue-100',
                      actividad: 'bg-green-50 text-green-700 border-green-100',
                      otro: 'bg-gray-50 text-gray-700 border-gray-100'
                    }
                    return (
                      <div 
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (evt.isHoliday) {
                            setSelectedDay({
                              day: item.day,
                              isCurrentMonth: item.currentMonth,
                              dateString: dateStr
                            })
                          } else {
                            setActiveEvent(evt)
                          }
                        }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border truncate transition-all ${badgeStyles[evt.tipo as keyof typeof badgeStyles] || badgeStyles.otro}`}
                        title={evt.titulo}
                      >
                        {evt.titulo}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] font-black text-gray-400 pl-1">
                      + {dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Day details / creation Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl border border-blue-100">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800 tracking-tight">
                    {new Date(selectedDay.dateString).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">Actividades y festividades programadas</p>
                </div>
              </div>
              <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-full transition-all cursor-pointer text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Event Creation Form */}
              {isCreating && isSuper ? (
                <form onSubmit={handleSaveEvent} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <h3 className="font-black text-gray-700 text-sm flex items-center gap-2">
                    <Plus size={16} className="text-blue-500" />
                    Nueva Actividad Académica
                  </h3>
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase">Título de la Actividad</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ej. Examen Mensual de Ciencias"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase">Categoría / Tipo</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as any)}
                      >
                        <option value="actividad">🏫 Actividad Escolar</option>
                        <option value="examen">📝 Examen / Evaluación</option>
                        <option value="reunion">👥 Reunión / Citación</option>
                        <option value="feriado">🎈 Feriado / Festividad</option>
                        <option value="otro">⚙️ Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase">Fecha de Inicio</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase">Fecha de Finalización</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase">Descripción / Detalles</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                      placeholder="Agregue información importante sobre la actividad..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 flex items-center gap-1.5 transition-all"
                    >
                      {submitting && <Loader2 className="animate-spin" size={14} />}
                      Guardar
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Day Events list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-gray-700 text-sm">Actividades del Día</h3>
                  {!isCreating && isSuper && (
                    <button 
                      onClick={() => setIsCreating(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} />
                      Nueva Actividad
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {getDayEvents(selectedDay.dateString, selectedDay.day, selectedDay.isCurrentMonth).length > 0 ? (
                    getDayEvents(selectedDay.dateString, selectedDay.day, selectedDay.isCurrentMonth).map((evt: any, idx: number) => {
                      const cardStyles = {
                        feriado: 'bg-red-50 border-red-100 hover:border-red-200 text-red-900',
                        reunion: 'bg-purple-50 border-purple-100 hover:border-purple-200 text-purple-900',
                        examen: 'bg-blue-50 border-blue-100 hover:border-blue-200 text-blue-900',
                        actividad: 'bg-green-50 border-green-100 hover:border-green-200 text-green-900',
                        otro: 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-900'
                      }
                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all flex justify-between items-start group shadow-sm ${cardStyles[evt.tipo as keyof typeof cardStyles] || cardStyles.otro}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-base">{evt.titulo}</span>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded border border-black/5">
                                {evt.tipo}
                              </span>
                            </div>
                            <p className="text-xs mt-1 opacity-80 font-medium">
                              {evt.descripcion || 'Sin descripción adicional.'}
                            </p>
                            {!evt.isHoliday && (
                              <p className="text-[10px] mt-2 opacity-60 font-semibold flex items-center gap-1">
                                <Calendar size={12} />
                                Del {evt.fecha_inicio} al {evt.fecha_fin}
                              </p>
                            )}
                          </div>
                          
                          {!evt.isHoliday && isSuper && (
                            <button 
                              onClick={() => {
                                closeModals()
                                setActiveEvent(evt)
                              }}
                              className="text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl p-2 border border-transparent hover:border-blue-100 transition-all opacity-0 group-hover:opacity-100"
                              title="Editar evento"
                            >
                              <Plus size={16} className="rotate-45" />
                            </button>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed text-gray-400">
                      No hay actividades ni feriados programados para esta fecha
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {activeEvent && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl border border-blue-100">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800 tracking-tight">Editar Actividad</h2>
                  <p className="text-xs text-gray-400 font-medium">Modifica los detalles del evento escolar</p>
                </div>
              </div>
              <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-full transition-all cursor-pointer text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase">Título de la Actividad</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase">Categoría / Tipo</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                  >
                    <option value="actividad">🏫 Actividad Escolar</option>
                    <option value="examen">📝 Examen / Evaluación</option>
                    <option value="reunion">👥 Reunión / Citación</option>
                    <option value="feriado">🎈 Feriado / Festividad</option>
                    <option value="otro">⚙️ Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase">Fecha de Inicio</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase">Fecha de Finalización</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase">Descripción / Detalles</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => handleDeleteEvent(activeEvent.id)}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Eliminar Evento
                </button>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 flex items-center gap-1.5 transition-all"
                  >
                    {submitting && <Loader2 className="animate-spin" size={14} />}
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
