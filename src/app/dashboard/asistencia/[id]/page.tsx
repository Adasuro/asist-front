'use client'

import { useEffect, useState, useRef, use } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { 
  QrCode, 
  Search, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  X,
  History,
  Check,
  Clock,
  MoreVertical,
  ShieldCheck,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCcw,
  Calendar,
  Info
} from 'lucide-react'
import { 
  registerAttendance, 
  getDailyAttendance, 
  searchStudents,
  getSectionStudents,
  officiateAttendance,
  registerBulkAttendance
} from '@/infrastructure/attendance/attendance.repository'
import JustificationModal from '@/presentation/components/admin/JustificationModal'
import { Button } from '@/presentation/components/ui/Button'
import { Toast, ToastType } from '@/presentation/components/ui/Toast'

export default function RegistroAsistenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sectionId } = use(params)
  const [method, setMethod] = useState<'qr' | 'manual' | 'lista'>('lista')
  const [searchQuery, setSearchQuery] = useState('')
  const [attendanceList, setAttendanceList] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [isOfficial, setIsOfficial] = useState(false)
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  
  // Local state for initial checklist checkboxes
  const [checkedStudents, setCheckedStudents] = useState<Record<string, boolean>>({})

  // Toast state
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  // Modal state
  const [justifyingAttendance, setJustifyingAttendance] = useState<any | null>(null)

  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const { data: attendanceRes, mutate: revalidateAttendance, error: attendanceError, isLoading: loadingAttendance } = useSWR(
    sectionId ? `/attendance/section/${sectionId}/daily` : null,
    () => getDailyAttendance(sectionId)
  )

  const { data: studentsData, mutate: revalidateStudents, error: studentsError, isLoading: loadingStudents } = useSWR(
    sectionId ? `/students/section/${sectionId}` : null,
    () => getSectionStudents(sectionId)
  )

  const isLoading = (loadingAttendance || loadingStudents) && (!attendanceRes || !studentsData)
  const hasError = (attendanceError || studentsError) && (!attendanceRes || !studentsData)

  useEffect(() => {
    if (attendanceRes) {
      setAttendanceList(attendanceRes.asistencias || [])
      setIsOfficial(!!attendanceRes.is_official)
      if (attendanceRes.is_official) {
        setMethod('lista')
      } else {
        setMethod('lista')
      }
    }
    if (studentsData) {
      setAllStudents(studentsData || [])
      
      // Initialize checkboxes: all checked by default (Presente)
      const initialChecked: Record<string, boolean> = {}
      studentsData.forEach((s: any) => {
        initialChecked[s.id] = true
      })
      setCheckedStudents(initialChecked)
    }
  }, [attendanceRes, studentsData])

  useEffect(() => {
    if (method === 'qr' && isOfficial && !isLoading) {
      // Un pequeño retraso para asegurar que el DOM se ha actualizado
      const timer = setTimeout(() => {
        startScanner()
      }, 100)
      return () => {
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
  }, [method, isOfficial, isLoading])

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  const fetchData = async () => {
    try {
      const [att, std] = await Promise.all([
        revalidateAttendance(),
        revalidateStudents()
      ])
      
      if (att) {
        setAttendanceList(att.asistencias || [])
        setIsOfficial(!!att.is_official)
        if (att.is_official) {
          setMethod('lista')
        }
      }
      if (std) {
        setAllStudents(std || [])
      }
    } catch (error: any) {
      console.error(error)
      showToast('Error al sincronizar con el servidor', 'error')
    }
  }

  const startScanner = () => {
    const readerElement = document.getElementById("reader")
    if (!readerElement) return

    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      )
      scanner.render(onScanSuccess, onScanFailure)
      scannerRef.current = scanner
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error))
      scannerRef.current = null
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    if (isRegistering || !isOfficial) return
    setIsRegistering(true)
    try {
      const res = await registerAttendance({
        codigo_sistema: decodedText,
        metodo_registro: 'codigo'
      })
      showToast(`Asistencia registrada: ${res.attendance.estudiante.nombre_completo}`, 'success')
      fetchData()
    } catch (error: any) {
      showToast(error.message || 'Error al escanear QR', 'error')
    } finally {
      setIsRegistering(false)
    }
  }

  const onScanFailure = (error: any) => {}

  const handleManualRegister = async (studentId: string, estado: 'presente' | 'tardanza' | 'falta' = 'presente') => {
    if (isRegistering) return
    
    // Reglas de edición restrictivas si ya está registrado (oficializado)
    if (isOfficial) {
        const record = attendanceList.find(a => a.estudiante_id === studentId)
        if (!record) {
            showToast('Debe registrar la asistencia masiva inicial primero.', 'error')
            return
        }
        if (record.estado !== 'falta' || estado !== 'tardanza') {
            showToast('BLOQUEADO: Solo puedes cambiar el estado de Falta a Tardanza.', 'warning')
            return
        }
    }

    setIsRegistering(true)
    try {
      await registerAttendance({
        estudiante_id: studentId,
        metodo_registro: 'manual',
        estado: estado
      })
      showToast(`Estado actualizado: ${estado.toUpperCase()}`, 'success')
      await fetchData() 
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar registro', 'error')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleBulkSubmit = async () => {
    if (isBulkSaving) return
    setIsBulkSaving(true)
    try {
      const studentsPayload = allStudents.map(student => ({
        estudiante_id: student.id,
        estado: (checkedStudents[student.id] !== false) ? 'presente' : 'falta' as 'presente' | 'falta'
      }))

      await registerBulkAttendance(sectionId, studentsPayload)
      showToast('Asistencia inicial guardada y oficializada.', 'success')
      await fetchData()
    } catch (error: any) {
      showToast(error.message || 'Error al guardar la asistencia masiva.', 'error')
    } finally {
      setIsBulkSaving(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    const updated = { ...checkedStudents }
    allStudents.forEach(student => {
      updated[student.id] = checked
    })
    setCheckedStudents(updated)
  }

  const isAllSelected = allStudents.length > 0 && allStudents.every(student => checkedStudents[student.id] !== false)

  const getStudentStatus = (studentId: string) => {
    const record = attendanceList.find(a => a.estudiante_id === studentId)
    if (!record) return { label: 'Sin Registro', color: 'text-gray-400 bg-gray-50', icon: <Clock size={14} />, record: null }
    
    if (record.estado === 'presente') 
        return { label: 'Presente', color: 'text-green-600 bg-green-50', icon: <Check size={14} />, record }
    
    if (record.estado === 'tardanza') 
        return { label: record.justificacion ? 'Tardanza Just.' : 'Tardanza', color: record.justificacion ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50', icon: <Clock size={14} />, record }
    
    return { label: record.justificacion ? 'Falta Just.' : 'Falta', color: 'text-red-600 bg-red-50', icon: <X size={14} />, record }
  }

  // Calculate stats reactively
  const localPresentes = isOfficial 
    ? attendanceList.filter(a => a.estado === 'presente').length
    : allStudents.filter(s => checkedStudents[s.id] !== false).length

  const localTardanzas = isOfficial 
    ? attendanceList.filter(a => a.estado === 'tardanza').length
    : 0

  const localFaltas = isOfficial 
    ? attendanceList.filter(a => a.estado === 'falta').length
    : allStudents.length - localPresentes

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isOfficial ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {isOfficial ? <Lock size={24} /> : <Unlock size={24} />}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    Control de Asistencia 
                    {isOfficial && <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">OFICIAL</span>}
                </h1>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 font-medium">
                    <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-500" />
                        <span>Presente: Inicial | Tarde: Después</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={fetchData} 
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                title="Sincronizar"
            >
                <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            
            {isOfficial && (
              <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                  <button 
                      onClick={() => setMethod('qr')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold cursor-pointer ${method === 'qr' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      <QrCode size={18} />
                      <span>Escáner QR</span>
                  </button>
                  <button 
                      onClick={() => setMethod('lista')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold cursor-pointer ${method === 'lista' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      <History size={18} />
                      <span>Lista</span>
                  </button>
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Area */}
        <div className="lg:col-span-2 space-y-6">
          {hasError ? (
             <div className="bg-white p-20 rounded-3xl border border-red-100 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="text-red-500 animate-bounce" size={40} />
                <p className="font-bold text-gray-700">Error al cargar la información del servidor</p>
                <p className="text-xs text-gray-400">Por favor, verifica tu conexión o reintenta.</p>
                <Button variant="secondary" onClick={fetchData} leftIcon={<RefreshCcw size={16} />}>Reintentar</Button>
             </div>
          ) : isLoading ? (
             <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="font-bold text-gray-400">Actualizando lista de alumnos...</p>
             </div>
          ) : (method === 'qr' && isOfficial) ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-full max-w-sm overflow-hidden rounded-3xl border-8 border-blue-50 bg-gray-50 shadow-inner">
                    <div id="reader" className="w-full"></div>
                    {!isRegistering && (
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-400 font-medium">Apunta el código QR de llegada tardía a la cámara</p>
                    </div>
                    )}
                    {isRegistering && (
                    <div className="p-6 flex items-center justify-center gap-3 text-blue-600 font-bold">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Validando escaneo...</span>
                    </div>
                    )}
                </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-bold text-gray-800">
                        {isOfficial ? 'Asistencias Oficiales' : 'Lista de Registro Inicial'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isOfficial 
                          ? 'Solo se permiten registrar tardanzas para alumnos ausentes.' 
                          : 'Marca a todos los que estén presentes. Los desmarcados se registrarán como faltas.'}
                      </p>
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar alumno..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Alumno</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">
                                  {isOfficial ? 'Acciones' : (
                                    <div className="flex items-center justify-end gap-2 pr-4">
                                      <span>¿Presente?</span>
                                      <input 
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                      />
                                    </div>
                                  )}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allStudents.filter(s => s.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => {
                                const status = getStudentStatus(student.id)
                                const isPresent = status.record?.estado === 'presente'
                                const isTardanza = status.record?.estado === 'tardanza'
                                const isFalta = status.record?.estado === 'falta'

                                if (!isOfficial) {
                                  // Modo Registro Inicial Checklist
                                  const isChecked = checkedStudents[student.id] !== false
                                  return (
                                    <tr key={student.id} className="hover:bg-blue-50/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-blue-100 text-blue-600">
                                                    {student.nombre_completo.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {student.nombre_completo}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">{student.codigo_sistema}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                                                isChecked ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                            }`}>
                                                {isChecked ? <Check size={12} /> : <X size={12} />}
                                                {isChecked ? 'Presente' : 'Falta'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end pr-4">
                                                <input 
                                                    type="checkbox"
                                                    className="w-5 h-5 accent-blue-600 cursor-pointer rounded-lg border-gray-300"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        setCheckedStudents({
                                                            ...checkedStudents,
                                                            [student.id]: e.target.checked
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                  )
                                }

                                // Modo Monitorización / Oficial
                                return (
                                    <tr key={student.id} className={`transition-colors ${isPresent || isTardanza ? 'bg-gray-50/30' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                    isPresent ? 'bg-green-100 text-green-600' : isTardanza ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {student.nombre_completo.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${isPresent || isTardanza ? 'text-gray-400' : 'text-gray-800'}`}>
                                                        {student.nombre_completo}
                                                        {(isPresent || isTardanza) && <Lock size={12} className="inline ml-2 text-amber-500" />}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">{student.codigo_sistema}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5 items-center">
                                                {isFalta && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary"
                                                        onClick={() => handleManualRegister(student.id, 'tardanza')}
                                                        disabled={isRegistering}
                                                        title="Registrar Tardanza"
                                                        leftIcon={<Clock size={12} />}
                                                        className="px-3.5 text-xs font-bold shadow-sm"
                                                    >
                                                        Llegó Tarde
                                                    </Button>
                                                )}

                                                {status.record && !isPresent && !status.record.justificacion && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="tertiary" 
                                                        className="text-blue-600 hover:bg-blue-50 ml-2"
                                                        onClick={() => setJustifyingAttendance(status.record)}
                                                        title="Justificar"
                                                    >
                                                        <ShieldCheck size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
        </div>

        {/* Sidebar Statistics/Recent */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-500" />
                    Resumen de Hoy
                </h2>
                <div className="space-y-4">
                    <StatRow label="Presentes" value={localPresentes} color="green" />
                    <StatRow label="Tardanzas" value={localTardanzas} color="amber" />
                    <StatRow label="Faltas" value={localFaltas} color="red" />
                    <div className="pt-4 mt-4 border-t flex justify-between items-center font-bold text-gray-800">
                        <span>Alumnos Matrícula</span>
                        <span>{allStudents.length}</span>
                    </div>
                </div>

                {!isOfficial ? (
                    <div className="mt-6 space-y-3">
                        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-blue-700 font-medium">
                                Marca en la lista a todos los presentes. Al guardar, los desmarcados recibirán de forma oficial la marca de "Falta".
                            </p>
                        </div>
                        <Button 
                            onClick={handleBulkSubmit}
                            isLoading={isBulkSaving}
                            disabled={allStudents.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <ShieldCheck size={20} />
                            Guardar Asistencia de Hoy
                        </Button>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <Lock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-amber-700 leading-relaxed font-bold uppercase tracking-tight">
                              Asistencia Oficializada
                          </p>
                          <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                              Cerrada para registros iniciales. Solo se admiten tardanzas y justificaciones.
                          </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Ayuda Rápida
                    </h3>
                    <p className="text-blue-100 text-xs leading-relaxed font-medium">
                        Una vez guardada la asistencia inicial, el día se oficializa. Los alumnos en "Falta" que lleguen después pueden ser actualizados a "Tardanza" usando el botón lateral o por medio de su código QR.
                    </p>
                </div>
                <ShieldCheck className="absolute -bottom-4 -right-4 text-white/10" size={100} />
            </div>
        </div>
      </div>

      {/* Modals */}
      {justifyingAttendance && (
        <JustificationModal 
          asistenciaId={justifyingAttendance.id}
          studentName={justifyingAttendance.estudiante.nombre_completo}
          onClose={() => setJustifyingAttendance(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}

function StatRow({ label, value, color }: { label: string, value: number, color: 'green' | 'amber' | 'red' | 'blue' }) {
    const colors = {
        green: 'bg-green-100 text-green-700',
        amber: 'bg-amber-100 text-amber-700',
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700'
    }
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${colors[color]}`}>{value}</span>
        </div>
    )
}
