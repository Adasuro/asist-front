'use client'

import React, { useState } from 'react'
import { X, Loader2, FileText, Check, Upload } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import { justifyAttendance } from '@/infrastructure/attendance/attendance.repository'

interface JustificationModalProps {
  asistenciaId: string
  studentName: string
  onClose: () => void
  onSuccess: () => void
}

export default function JustificationModal({ asistenciaId, studentName, onClose, onSuccess }: JustificationModalProps) {
  const [motivo, setMotivo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivo.trim()) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('asistencia_id', asistenciaId)
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
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl text-green-600">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Justificar Asistencia</h2>
              <p className="text-sm text-gray-500">{studentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Motivo de la justificación</label>
            <textarea
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 min-h-[120px] transition-all"
              placeholder="Ej. Cita médica, Problemas familiares, etc."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <Upload size={16} className="text-gray-400" />
              Documento de sustento (opcional)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0])
                }
              }}
            />
            <p className="text-[10px] text-gray-400 ml-1">Formatos admitidos: PDF, PNG, JPG, JPEG. Máximo 2MB.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
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
              loading={loading}
              leftIcon={!loading && <Check size={18} />}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
