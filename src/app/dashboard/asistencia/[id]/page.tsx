'use client'

import { useEffect, useState, useRef, use } from 'react'
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
  FileText
} from 'lucide-react'
import { 
  registerAttendance, 
  getDailyAttendance, 
  searchStudents,
  getSectionStudents
} from '@/infrastructure/attendance/attendance.repository'
import JustificationModal from '@/presentation/components/admin/JustificationModal'
import { Button } from '@/presentation/components/ui/Button'

export default function RegistroAsistenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sectionId } = use(params)
  const [method, setMethod] = useState<'qr' | 'manual' | 'lista'>('qr')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [attendanceList, setAttendanceList] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Modal state
  const [justifyingAttendance, setJustifyingAttendance] = useState<any | null>(null)

  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    fetchData()
  }, [sectionId])

  useEffect(() => {
    if (method === 'qr') {
      startScanner()
    } else {
      stopScanner()
    }
    return () => stopScanner()
  }, [method])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [attendanceData, studentsData] = await Promise.all([
        getDailyAttendance(sectionId),
        getSectionStudents(sectionId)
      ])
      setAttendanceList(attendanceData)
      setAllStudents(studentsData)
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const startScanner = () => {
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
    if (isRegistering) return
    setIsRegistering(true)
    try {
      const res = await registerAttendance({
        codigo_sistema: decodedText,
        metodo_registro: 'codigo'
      })
      alert(`Asistencia registrada: ${res.attendance.estudiante.nombre_completo} (${res.attendance.estado})`)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsRegistering(false)
    }
  }

  const onScanFailure = (error: any) => {}

  const handleManualRegister = async (studentId: string, estado: 'presente' | 'tardanza' | 'falta' = 'presente') => {
    setIsRegistering(true)
    try {
      const res = await registerAttendance({
        estudiante_id: studentId,
        metodo_registro: 'manual',
        estado: estado
      })
      alert(`Asistencia registrada como ${estado}`)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsRegistering(false)
    }
  }

  const getStudentStatus = (studentId: string) => {
    const record = attendanceList.find(a => a.estudiante_id === studentId)
    if (!record) return { label: 'Falta', color: 'text-red-500 bg-red-50', icon: <X size={14} />, record: null }
    
    if (record.estado === 'presente') 
        return { label: 'Presente', color: 'text-green-600 bg-green-50', icon: <Check size={14} />, record }
    
    if (record.estado === 'tardanza') 
        return { label: record.justificacion ? 'Tardanza Just.' : 'Tardanza', color: record.justificacion ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50', icon: <Clock size={14} />, record }
    
    return { label: record.justificacion ? 'Falta Just.' : 'Falta', color: 'text-red-600 bg-red-50', icon: <X size={14} />, record }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Control de Asistencia</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
             <Clock size={16} className="text-blue-500" />
             <span>Rango Presente: 07:40 - 08:10</span>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setMethod('qr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold ${method === 'qr' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <QrCode size={18} />
            <span>Escáner QR</span>
          </button>
          <button 
            onClick={() => setMethod('lista')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold ${method === 'lista' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <History size={18} />
            <span>Lista de Alumnos</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Area */}
        <div className="lg:col-span-2 space-y-6">
          {method === 'qr' ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-full max-w-sm overflow-hidden rounded-3xl border-8 border-blue-50 bg-gray-50 shadow-inner">
                    <div id="reader" className="w-full"></div>
                    {!isRegistering && (
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-400 font-medium">Apunta el código QR a la cámara para registrar</p>
                    </div>
                    )}
                    {isRegistering && (
                    <div className="p-6 flex items-center justify-center gap-3 text-blue-600 font-bold">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Validando código...</span>
                    </div>
                    )}
                </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between gap-4">
                    <h2 className="font-bold text-gray-800">Alumnos de la Sección</h2>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar alumno..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
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
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allStudents.filter(s => s.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => {
                                const status = getStudentStatus(student.id)
                                return (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {student.nombre_completo.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{student.nombre_completo}</p>
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
                                            <div className="flex justify-end gap-2">
                                                {!status.record ? (
                                                    <>
                                                        <Button size="sm" variant="secondary" onClick={() => handleManualRegister(student.id, 'presente')}>
                                                            P
                                                        </Button>
                                                        <Button size="sm" variant="tertiary" onClick={() => handleManualRegister(student.id, 'tardanza')}>
                                                            T
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {status.record.estado !== 'presente' && !status.record.justificacion && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="tertiary" 
                                                                className="text-blue-600 hover:bg-blue-50"
                                                                onClick={() => setJustifyingAttendance(status.record)}
                                                                leftIcon={<ShieldCheck size={14} />}
                                                            >
                                                                Justificar
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            size="sm" 
                                                            variant="tertiary" 
                                                            onClick={() => handleManualRegister(student.id, status.record.estado === 'presente' ? 'tardanza' : 'presente')}
                                                        >
                                                            Editar
                                                        </Button>
                                                    </>
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
                    <StatRow label="Presentes" value={attendanceList.filter(a => a.estado === 'presente').length} color="green" />
                    <StatRow label="Tardanzas" value={attendanceList.filter(a => a.estado === 'tardanza').length} color="amber" />
                    <StatRow label="Faltas" value={allStudents.length - attendanceList.length} color="red" />
                    <div className="pt-4 mt-4 border-t flex justify-between items-center font-bold text-gray-800">
                        <span>Total Alumnos</span>
                        <span>{allStudents.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
                <h3 className="font-bold mb-2">Ayuda Rápida</h3>
                <p className="text-blue-100 text-xs leading-relaxed">
                    Usa el escáner para agilizar el ingreso. Las tardanzas después de las 08:10 se marcan automáticamente.
                </p>
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
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${colors[color]}`}>{value}</span>
        </div>
    )
}
