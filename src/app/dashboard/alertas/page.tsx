'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Loader2, 
  X,
  ShieldCheck,
  PhoneCall
} from 'lucide-react'
import { HttpClient } from '@/infrastructure/api/http-client'

interface Alerta {
  id: string
  estudiante_id: string
  tipo: string
  mensaje: string
  resuelta: boolean
  created_at: string
  estudiante: {
    id: string
    nombre_completo: string
    dni: string
    telefono: string
    seccion: {
      id: string
      nombre: string
      grado: {
        id: string
        nombre: string
      }
    }
  }
}

export default function AlertasPage() {
  const { data: alertsData, isLoading, mutate: revalidateAlerts } = useSWR<Alerta[]>(
    '/alerts',
    () => HttpClient.get<Alerta[]>('/alerts')
  )
  const alerts = alertsData || []

  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolvingAll, setResolvingAll] = useState(false)

  const handleResolve = async (id: string) => {
    setResolvingId(id)
    try {
      await HttpClient.post(`/alerts/${id}/resolve`)
      revalidateAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
      alert('Error al resolver la alerta')
    } finally {
      setResolvingId(null)
    }
  }

  const handleResolveAll = async () => {
    if (alerts.length === 0) return
    if (!confirm('¿Estás seguro de marcar todas las alertas como resueltas?')) return

    setResolvingAll(true)
    try {
      await HttpClient.post('/alerts/resolve-all')
      revalidateAlerts()
    } catch (error) {
      console.error('Error resolving all alerts:', error)
      alert('Error al resolver todas las alertas')
    } finally {
      setResolvingAll(false)
    }
  }

  // Helper to format date
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 60) {
        return diffMins <= 1 ? 'Hace un momento' : `Hace ${diffMins} minutos`
      } else if (diffHours < 24) {
        return `Hace ${diffHours} horas`
      } else {
        return `Hace ${diffDays} días`
      }
    } catch (e) {
      return 'Recientemente'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <Bell size={30} className="text-blue-600 animate-swing" />
            Alertas del Sistema
          </h1>
          <p className="text-gray-500 font-medium mt-1">Notificaciones críticas y preventivas de asistencia escolar</p>
        </div>
        
        {alerts.length > 0 && (
          <button 
            onClick={handleResolveAll}
            disabled={resolvingAll}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-sm border border-blue-100 active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
          >
            {resolvingAll ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            Marcar todas como resueltas
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Historial de Alertas Activas
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Lista de alumnos con situaciones críticas de puntualidad o inasistencias.</p>
        </div>
        
        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="font-bold tracking-tight">Cargando alertas críticas...</p>
          </div>
        ) : alerts.length > 0 ? (
          <div className="divide-y divide-gray-50">
              {alerts.map((alert) => {
                const isCritical = alert.tipo === 'faltas_excesivas'
                const title = isCritical ? 'Inasistencias Críticas' : 'Tardanzas Acumuladas'
                
                return (
                  <div key={alert.id} className="p-6 flex flex-col sm:flex-row items-start gap-4 hover:bg-blue-50/5 transition-colors group">
                      <div className={`p-3 rounded-2xl border ${isCritical ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          <AlertTriangle size={22} />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                              <div>
                                  <h3 className="font-black text-gray-800 text-base">{title}</h3>
                                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                      {alert.estudiante.seccion.grado.nombre} - {alert.estudiante.seccion.nombre}
                                  </p>
                              </div>
                              <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                                  {formatTime(alert.created_at)}
                              </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                              Alumno: <span className="font-bold text-gray-800">{alert.estudiante.nombre_completo}</span>
                              <br />
                              {alert.mensaje}
                          </p>

                          <div className="flex flex-wrap gap-3 pt-2">
                              {/* Parent Call Action */}
                              {alert.estudiante.telefono ? (
                                <a 
                                  href={`tel:${alert.estudiante.telefono}`} 
                                  className="inline-flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-green-100 shadow-sm"
                                  title={`Llamar al ${alert.estudiante.telefono}`}
                                >
                                  <PhoneCall size={14} />
                                  Llamar Apoderado ({alert.estudiante.telefono})
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-400 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-100">
                                  <Phone size={14} />
                                  Sin teléfono registrado
                                </span>
                              )}

                              {/* Resolve Action */}
                              <button 
                                onClick={() => handleResolve(alert.id)}
                                disabled={resolvingId !== null}
                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-blue-100 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                {resolvingId === alert.id ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <ShieldCheck size={14} />
                                )}
                                Marcar como resuelta
                              </button>
                          </div>
                      </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Todo en orden</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 font-medium">
              No hay alertas pendientes de inasistencias o tardanzas en este momento.
            </p>
          </div>
        )}

        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 font-bold uppercase tracking-wider border-t">
            Monitoreo en tiempo real
        </div>
      </div>
    </div>
  )
}
