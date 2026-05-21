'use client'

import React, { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const viewMonth = currentDate.getMonth()
  const viewYear = currentDate.getFullYear()

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Calendario Académico</h1>
          <p className="text-gray-500">Eventos, feriados y jornadas de asistencia</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
           <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
           >
            <ChevronLeft size={20}/>
           </button>
           <span className="font-bold text-gray-700 min-w-[120px] text-center">
            {monthNames[viewMonth]} {viewYear}
           </span>
           <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
           >
            <ChevronRight size={20}/>
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {daysOfWeek.map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-collapse">
          {calendarGrid.map((item, i) => {
            const today = isToday(item.day, item.currentMonth)
            return (
              <div 
                key={i} 
                className={`min-h-[100px] border-r border-b border-gray-50 p-3 hover:bg-gray-50/80 transition-all group relative ${!item.currentMonth ? 'bg-gray-50/30' : ''}`}
              >
                <span className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                  today 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : item.currentMonth ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {item.day}
                </span>
                
                {today && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-700 leading-tight animate-in fade-in slide-in-from-top-1">
                    Día Actual
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
