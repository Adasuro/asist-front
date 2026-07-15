'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import { TrendingUp, Download, BarChart2, PieChart, Calendar as CalendarIcon, Filter, CheckCircle2, Clock, AlertCircle, FileText, Search, User, FileSpreadsheet } from 'lucide-react'
import { HttpClient } from '@/infrastructure/api/http-client'
import { Button } from '@/presentation/components/ui/Button'
import { Select } from '@/presentation/components/ui/Select'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function ReportesPage() {
  const [exporting, setExporting] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [estudianteNombre, setEstudianteNombre] = useState('')
  const [seccionId, setSeccionId] = useState('')

  const { data: seccionesData } = useSWR('/sections/assigned', () => HttpClient.get<any[]>('/sections/assigned'))
  const secciones = seccionesData || []

  const { data: stats, isLoading: loading, mutate: fetchStats } = useSWR(
    ['/reports/attendance-stats', fechaInicio, fechaFin, seccionId, estudianteNombre],
    ([, fIni, fFin, sId, name]) => {
      const params: any = { 
        fecha_inicio: fIni,
        fecha_fin: fFin,
        estudiante_nombre: name
      }
      if (sId) params.seccion_id = sId
      return HttpClient.get<any>('/reports/attendance-stats', params)
    }
  )

  const { data: rankingsData, isLoading: loadingRankings, mutate: fetchRankings } = useSWR(
    ['/reports/rankings', fechaInicio, fechaFin],
    ([, fIni, fFin]) => {
      const params: any = { 
        fecha_inicio: fIni,
        fecha_fin: fFin
      }
      return HttpClient.get<any>('/reports/rankings', params)
    }
  )

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExporting(type)
    try {
      const params: any = { 
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estudiante_nombre: estudianteNombre
      }
      if (seccionId) params.seccion_id = seccionId
      
      const endpoint = type === 'pdf' ? '/reports/export-pdf' : '/reports/export-excel'
      const blob = await HttpClient.get<Blob>(endpoint, params)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Reporte_Asistencia_${new Date().getTime()}.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error al exportar el reporte')
    } finally {
      setExporting(null)
    }
  }

  const seccionOptions = secciones.map(s => ({ 
    value: s.id, 
    label: `${s.grado.nombre} - ${s.nombre}` 
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reportes de Asistencia</h1>
          <p className="text-gray-500">Visualización detallada de puntualidad y faltas</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            leftIcon={<FileSpreadsheet size={18} />}
            onClick={() => handleExport('excel')}
            loading={exporting === 'excel'}
          >
            Exportar Excel
          </Button>
          <Button 
            variant="tertiary" 
            leftIcon={<Download size={18} />}
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Estudiante</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Nombre..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              value={estudianteNombre}
              onChange={(e) => setEstudianteNombre(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Desde</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Hasta</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Sección</label>
          <Select 
            options={seccionOptions}
            value={seccionId}
            onChange={(e) => setSeccionId(e.target.value)}
            placeholder="Todas mis secciones"
          />
        </div>
        <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={() => { fetchStats(); fetchRankings(); }} loading={loading || loadingRankings}>
                Actualizar
            </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-gray-400 font-medium">Cargando estadísticas...</p>
        </div>
      ) : stats ? (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Asistencia Total" 
                    value={stats.presente + stats.tardanza_justificada + stats.tardanza_injustificada} 
                    total={stats.total}
                    icon={<CheckCircle2 size={24} />} 
                    color="blue" 
                />
                <StatCard 
                    title="Puntualidad" 
                    value={stats.presente} 
                    total={stats.total}
                    icon={<Clock size={24} />} 
                    color="green" 
                />
                <StatCard 
                    title="Tardanzas" 
                    value={stats.tardanza_justificada + stats.tardanza_injustificada} 
                    total={stats.total}
                    icon={<AlertCircle size={24} />} 
                    color="amber" 
                />
                <StatCard 
                    title="Faltas Totales" 
                    value={stats.falta_justificada + stats.falta_injustificada} 
                    total={stats.total}
                    icon={<X className="text-red-500" size={24} />} 
                    color="red" 
                />
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PieChart size={24} className="text-purple-500" />
                        Desglose de Tardanzas
                    </h2>
                    <div className="space-y-6">
                        <ProgressRow 
                            label="Tardanzas Justificadas" 
                            value={stats.tardanza_justificada} 
                            total={stats.tardanza_justificada + stats.tardanza_injustificada}
                            color="bg-blue-500"
                        />
                        <ProgressRow 
                            label="Tardanzas No Justificadas" 
                            value={stats.tardanza_injustificada} 
                            total={stats.tardanza_justificada + stats.tardanza_injustificada}
                            color="bg-amber-500"
                        />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={24} className="text-red-500" />
                        Desglose de Faltas
                    </h2>
                    <div className="space-y-6">
                        <ProgressRow 
                            label="Faltas Justificadas" 
                            value={stats.falta_justificada} 
                            total={stats.falta_justificada + stats.falta_injustificada}
                            color="bg-green-500"
                        />
                        <ProgressRow 
                            label="Faltas No Justificadas" 
                            value={stats.falta_injustificada} 
                            total={stats.falta_justificada + stats.falta_injustificada}
                            color="bg-red-500"
                        />
                    </div>
                </div>
            </div>

            {/* Rankings Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <BarChart2 size={24} className="text-blue-500" />
                        Ranking de Tardanzas y Faltas por Aula
                    </h2>
                    <p className="text-xs text-gray-400 mb-6">Comparativa de ausentismo y tardanzas entre las secciones asignadas.</p>
                    
                    {loadingRankings ? (
                        <div className="h-80 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500 animate-bounce" size={32} />
                        </div>
                    ) : rankingsData?.secciones?.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={rankingsData.secciones.map((sec: any) => ({
                                        name: `${sec.grado_nombre} - ${sec.seccion_nombre}`,
                                        Faltas: Number(sec.faltas),
                                        Tardanzas: Number(sec.tardanzas)
                                    }))}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="Faltas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="Tardanzas" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-400">
                            No hay suficientes datos para generar el ranking por aula
                        </div>
                    )}
                </div>

                <div className="bg-white p-8 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <BarChart2 size={24} className="text-purple-500" />
                        Ranking de Tardanzas y Faltas por Grado
                    </h2>
                    <p className="text-xs text-gray-400 mb-6">Comparativa de ausentismo y tardanzas acumulados por cada grado.</p>
                    
                    {loadingRankings ? (
                        <div className="h-80 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500 animate-bounce" size={32} />
                        </div>
                    ) : rankingsData?.grados?.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={rankingsData.grados.map((gra: any) => ({
                                        name: gra.grado_nombre,
                                        Faltas: Number(gra.faltas),
                                        Tardanzas: Number(gra.tardanzas)
                                    }))}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="Faltas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="Tardanzas" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-400">
                            No hay suficientes datos para generar el ranking por grado
                        </div>
                    )}
                </div>
            </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border">
            <p className="text-gray-400">No hay datos para esta fecha o sección</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, total, icon, color }: any) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
            {icon}
        </div>
        <span className="text-xs font-bold text-gray-400">{percentage}%</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, total, color }: any) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-800">{value} ({percentage}%)</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
