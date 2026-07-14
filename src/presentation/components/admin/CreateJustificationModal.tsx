'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, FileText, Check, Upload, Search, Calendar, AlertCircle, AlertTriangle, User, ArrowRight, Activity, ArrowLeft } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import { justifyAttendance } from '@/infrastructure/attendance/attendance.repository'
import { HttpClient } from '@/infrastructure/api/http-client'

interface CreateJustificationModalProps {
  onClose: () => void
  onSuccess: () => void
}

const QUICK_REASONS = [
  { label: '🩺 Cita Médica', text: 'El estudiante asistió a una cita médica programada.' },
  { label: '🤒 Enfermedad', text: 'El estudiante presentó problemas de salud y fiebre.' },
  { label: '🚗 Tránsito / Retraso', text: 'El estudiante experimentó retraso involuntario por congestión vehicular.' },
  { label: '🏠 Asunto Familiar', text: 'El estudiante tuvo que ausentarse debido a emergencias familiares críticas.' },
  { label: '🏆 Delegación Escolar', text: 'El estudiante participó representando a la institución en evento oficial.' }
]

export default function CreateJustificationModal({ onClose, onSuccess }: CreateJustificationModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  // Unjustified attendances state
  const [loadingAttendances, setLoadingAttendances] = useState(false)
  const [unjustifiedAttendances, setUnjustifiedAttendances] = useState<any[]>([])
  const [selectedAttendanceId, setSelectedAttendanceId] = useState('')

  // Form state
  const [motivo, setMotivo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Recent unjustified records state
  const [recentUnjustified, setRecentUnjustified] = useState<any[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  // Fetch recent unjustified records on mount
  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingRecent(true)
      try {
        const res = await HttpClient.get<any[]>('/attendance/unjustified')
        setRecentUnjustified(res || [])
      } catch (err) {
        console.error('Error al obtener inasistencias recientes:', err)
      } finally {
        setLoadingRecent(false)
      }
    }
    fetchRecent()
  }, [])

  // Debounced search for students
  useEffect(() => {
    if (!searchQuery.trim()) {
      setStudentsList([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await HttpClient.get<any>('/students', { search: searchQuery })
        setStudentsList(res?.data || [])
      } catch (err) {
        console.error('Error al buscar estudiantes:', err)
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch unjustified records when student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setUnjustifiedAttendances([])
      setSelectedAttendanceId('')
      return
    }

    const fetchUnjustified = async () => {
      setLoadingAttendances(true)
      try {
        const res = await HttpClient.get<any[]>('/attendance/unjustified', { estudiante_id: selectedStudent.id })
        setUnjustifiedAttendances(res || [])
        if (res && res.length > 0) {
          setSelectedAttendanceId(res[0].id)
        }
      } catch (err) {
        console.error('Error al obtener inasistencias:', err)
      } finally {
        setLoadingAttendances(false)
      }
    }

    fetchUnjustified()
  }, [selectedStudent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAttendanceId || !motivo.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('asistencia_id', selectedAttendanceId)
      formData.append('motivo', motivo)
      if (file) {
        formData.append('documento', file)
      }

      await justifyAttendance(formData)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar la justificación')
    } finally {
      setSubmitting(false)
    }
  }

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      if (validTypes.includes(droppedFile.type) && droppedFile.size <= 2 * 1024 * 1024) {
        setFile(droppedFile)
        setError(null)
      } else {
        setError("Archivo no válido. Asegúrate de que sea PDF o Imagen y que pese menos de 2MB.")
      }
    }
  }

  // Count unjustified by status
  const unjustifiedFaltasCount = unjustifiedAttendances.filter(a => a.estado === 'falta').length
  const unjustifiedTardanzasCount = unjustifiedAttendances.filter(a => a.estado === 'tardanza').length

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300">
      <div className={`bg-white rounded-3xl w-full ${selectedStudent ? 'max-w-4xl' : 'max-w-xl'} shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 transition-all duration-300`}>
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            {selectedStudent && (
              <button 
                type="button"
                onClick={() => setSelectedStudent(null)} 
                className="p-2 hover:bg-gray-200/70 rounded-full transition-all active:scale-95 text-gray-500 hover:text-gray-700 cursor-pointer mr-1"
                title="Volver a buscar alumno"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-100">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Justificación Global</h2>
              <p className="text-xs text-gray-400 font-medium">Búsqueda rápida y registro ágil con sustento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200/70 rounded-full transition-all active:scale-95 cursor-pointer">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* Step 1: Select Student */}
          {!selectedStudent ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Seleccionar Alumno</label>
                <p className="text-xs text-gray-400">Busca el estudiante por su nombre completo, apellido o DNI.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Escribe el nombre del estudiante..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {searching ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="text-xs font-semibold">Consultando padrón de alumnos...</span>
                  </div>
                ) : studentsList.length > 0 ? (
                  studentsList.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className="w-full p-4 flex items-center justify-between text-left bg-gray-50/50 hover:bg-blue-50/30 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100/60 text-blue-700 font-black text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                          {student.nombre_completo?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">
                            {student.nombre_completo}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {student.seccion?.grado?.nombre} - {student.seccion?.nombre} | DNI: {student.dni}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={16} />
                      </div>
                    </button>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="text-center py-10 bg-gray-50/40 rounded-2xl border border-dashed">
                    <AlertCircle size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400">No se encontraron coincidencias</p>
                    <p className="text-[10px] text-gray-400 mt-1">Verifica el nombre completo o número de DNI.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loadingRecent ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <span className="text-xs font-semibold">Cargando incidencias recientes...</span>
                      </div>
                    ) : recentUnjustified.length > 0 ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity size={14} className="text-blue-500" />
                            Tardanzas y Faltas Recientes por Justificar
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                          {recentUnjustified.map((record) => {
                            const student = record.estudiante
                            const formattedDate = new Date(record.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                              day: 'numeric',
                              month: 'short',
                              weekday: 'short'
                            })
                            const isFalta = record.estado === 'falta'

                            return (
                              <button
                                key={record.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(student)
                                  setSelectedAttendanceId(record.id)
                                }}
                                className="w-full p-3.5 bg-gray-50/50 hover:bg-blue-50/30 border border-gray-100 hover:border-blue-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform">
                                    {student.nombre_completo.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-gray-800 text-xs group-hover:text-blue-800 transition-colors">
                                      {student.nombre_completo}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                      {student.seccion?.grado?.nombre} - {student.seccion?.nombre}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                    isFalta ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {record.estado}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-bold capitalize">
                                    {formattedDate}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50/30 rounded-2xl border border-dashed flex flex-col items-center justify-center text-gray-400">
                        <Check size={30} className="text-emerald-500 mb-2" />
                        <p className="text-xs font-bold text-gray-600">¡Todo al día!</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">No hay inasistencias ni tardanzas recientes por justificar.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Show Selected Student & Form in Grid Side-by-Side */
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
              
              {/* Left Column: Form & Sustentación (spans 3) */}
              <div className="md:col-span-3 space-y-5">
                
                {/* Selected Student Card */}
                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-blue-50/10 border border-blue-100 rounded-2xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                      {selectedStudent.nombre_completo?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Estudiante</span>
                      <p className="font-extrabold text-gray-800 text-sm mt-0.5">{selectedStudent.nombre_completo}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {selectedStudent.seccion?.grado?.nombre} - {selectedStudent.seccion?.nombre}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-red-500 hover:text-red-700 font-extrabold bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>

                {/* Selected Date Indicator */}
                {selectedAttendanceId ? (
                  <div className="p-4 bg-blue-50/30 border border-blue-200/50 rounded-2xl flex items-center gap-3 text-blue-800 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Fecha Seleccionada</p>
                      <p className="text-xs font-bold capitalize">
                        {new Date(unjustifiedAttendances.find(a => a.id === selectedAttendanceId)?.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex items-center gap-3 text-amber-800">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Atención</p>
                      <p className="text-xs font-bold">Selecciona una fecha del panel derecho para justificar</p>
                    </div>
                  </div>
                )}

                {selectedAttendanceId && (
                  <>
                    {/* Motivo */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Motivo de la Justificación</label>
                      <textarea
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 min-h-[90px] transition-all text-sm font-medium shadow-inner"
                        placeholder="Redacta detalladamente el sustento..."
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        required
                      />
                      
                      {/* Quick Reasons pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {QUICK_REASONS.map((r, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMotivo(r.text)}
                            className="text-[10px] font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Document upload zone */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Documento de Sustento</label>
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center transition-all ${
                          dragActive
                            ? 'border-blue-500 bg-blue-50/20'
                            : file
                            ? 'border-emerald-300 bg-emerald-50/10'
                            : 'border-gray-200 bg-gray-50/30 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setFile(e.target.files[0])
                            }
                          }}
                        />
                        
                        {file ? (
                          <div className="flex flex-col items-center gap-2 text-center w-full">
                            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm">
                              <Check size={20} className="stroke-[2.5]" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-emerald-800 truncate max-w-[280px]">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="text-[10px] text-red-500 font-extrabold hover:underline mt-1 bg-red-50 px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              Remover archivo
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer w-full text-center py-2">
                            <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:scale-105 transition-transform">
                              <Upload size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-700">Arrastra tu archivo aquí o haz clic</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">PDF, PNG o JPG (Max. 2MB)</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex gap-2 items-center">
                    <AlertTriangle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="tertiary" className="flex-1" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1" 
                    disabled={!selectedAttendanceId}
                    loading={submitting}
                    leftIcon={!submitting && <Check size={18} />}
                  >
                    Guardar
                  </Button>
                </div>
              </div>

              {/* Right Column: Absences & Tardiness List Sidebar (spans 2) */}
              <div className="md:col-span-2 space-y-4 md:border-l md:pl-6 border-gray-100 flex flex-col">
                
                {/* Status Stats counts */}
                {unjustifiedAttendances.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                    <div className="p-2.5 bg-red-50/60 border border-red-100/70 rounded-xl flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-[10px]">
                        {unjustifiedFaltasCount}
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Faltas</p>
                        <p className="text-[10px] text-gray-700 font-extrabold">Pendientes</p>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50/60 border border-amber-100/70 rounded-xl flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-[10px]">
                        {unjustifiedTardanzasCount}
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tardanzas</p>
                        <p className="text-[10px] text-gray-700 font-extrabold">Pendientes</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 flex-1 flex flex-col min-h-[250px]">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Historial de Tardanzas y Faltas
                  </label>
                  
                  {loadingAttendances ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400 py-12 justify-center bg-gray-50/50 rounded-2xl border border-dashed flex-1">
                      <Loader2 className="animate-spin text-blue-500" size={20} />
                      <span className="text-xs font-semibold">Cargando historial...</span>
                    </div>
                  ) : unjustifiedAttendances.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 flex-1">
                      {unjustifiedAttendances.map((att) => {
                        const isSelected = selectedAttendanceId === att.id
                        const formattedDate = new Date(att.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })
                        const isFalta = att.estado === 'falta'

                        return (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => setSelectedAttendanceId(att.id)}
                            className={`w-full p-3 flex items-center justify-between text-left rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                                : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                isFalta ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {att.estado}
                              </span>
                              <span className="text-xs font-bold text-gray-700 capitalize">
                                {formattedDate}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-4.5 h-4.5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <Check size={10} className="stroke-[3]" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex gap-3 items-start flex-1 justify-center flex-col">
                      <Check size={24} className="text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-emerald-950">¡Sin pendientes!</p>
                        <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                          El alumno se encuentra al día y no posee inasistencias o tardanzas pendientes por justificar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
