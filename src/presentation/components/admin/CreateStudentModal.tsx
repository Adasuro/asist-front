"use client"

import React, { useState, useEffect } from 'react'
import { X, User, Hash, Phone, MapPin, Calendar, Check, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

interface Grado {
  id: string
  nombre: string
  secciones: { id: string, nombre: string }[]
}

import { createStudentAction } from '@/application/students/student.actions'
import { HttpClient } from '@/infrastructure/api/http-client'
import { studentSchema } from '@/domain/validation/student.schema'

export default function CreateStudentModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [grados, setGrados] = useState<Grado[]>([])
  const [loadingGrados, setLoadingGrados] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDniWarning, setShowDniWarning] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    grado_id: '',
    seccion_id: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: ''
  })

  useEffect(() => {
    fetchGrados()
  }, [])

  const fetchGrados = async () => {
    setLoadingGrados(true)
    try {
      // Usar el HttpClient para obtener grados (ya configurado para servidor/cliente)
      const data = await HttpClient.get<Grado[]>('/grados')
      setGrados(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error al cargar grados:", err)
    } finally {
      setLoadingGrados(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Zod validation on submit
    const validation = studentSchema.safeParse(formData)
    if (!validation.success) {
      setError(validation.error.issues[0].message)
      setSubmitting(false)
      return
    }

    try {
      const result = await createStudentAction(formData)

      if (result.error) throw new Error(result.error)

      onSuccess()
      onClose()
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('dni') && (errMsg.toLowerCase().includes('taken') || errMsg.toLowerCase().includes('ya existe') || errMsg.toLowerCase().includes('duplicado') || errMsg.toLowerCase().includes('unique') || errMsg.toLowerCase().includes('repetido') || errMsg.toLowerCase().includes('inválido'))) {
        setShowDniWarning(true)
      } else {
        setError(errMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectedGrado = grados?.find(g => g.id === formData.grado_id)
  const gradoOptions = (grados || []).map(g => ({ value: g.id, label: g.nombre }))
  const seccionOptions = (selectedGrado?.secciones || []).map(s => ({ value: s.id, label: s.nombre }))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              Registro Manual de Alumno
            </h2>
            <p className="text-sm text-gray-500">Ingresa los datos personales y académicos.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm flex items-center gap-2">
              <X size={18} className="bg-red-200 rounded-full p-0.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Información Personal</h3>
              
              <Input 
                label="Nombre Completo"
                required
                placeholder="Ej. Juan Perez Garcia"
                leftIcon={<User size={18} />}
                value={formData.nombre_completo}
                onChange={e => setFormData({...formData, nombre_completo: e.target.value})}
              />

              <Input 
                label="DNI"
                required
                maxLength={8}
                placeholder="8 dígitos"
                leftIcon={<Hash size={18} />}
                value={formData.dni}
                onChange={e => {
                  const cleaned = e.target.value.replace(/\D/g, '')
                  setFormData({...formData, dni: cleaned})
                }}
              />

              <Input 
                label="Fecha de Nacimiento"
                type="date"
                leftIcon={<Calendar size={18} />}
                value={formData.fecha_nacimiento}
                onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Asignación Académica</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Select 
                  label="Grado"
                  required
                  options={gradoOptions}
                  value={formData.grado_id}
                  onChange={e => setFormData({...formData, grado_id: e.target.value, seccion_id: ''})}
                />

                <Select 
                  label="Sección"
                  required
                  disabled={!formData.grado_id}
                  options={seccionOptions}
                  value={formData.seccion_id}
                  onChange={e => setFormData({...formData, seccion_id: e.target.value})}
                />
              </div>

              <Input 
                label="Teléfono (Opcional)"
                placeholder="999888777"
                leftIcon={<Phone size={18} />}
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
              />

              <Input 
                label="Dirección (Opcional)"
                placeholder="Av. Ejemplo 123"
                leftIcon={<MapPin size={18} />}
                value={formData.direccion}
                onChange={e => setFormData({...formData, direccion: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button 
              type="button"
              variant="tertiary"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              isLoading={submitting}
              className="flex-1"
              leftIcon={<Check size={20} />}
            >
              Guardar Alumno
            </Button>
          </div>
        </form>
      </div>

      {showDniWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-red-100 flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-md">
              <AlertTriangle size={32} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-800 tracking-tight">DNI Duplicado o Inválido</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                El DNI <span className="font-bold text-red-600">"{formData.dni}"</span> ya se encuentra registrado para otro alumno. 
                Recuerda que el DNI debe ser único, contener exactamente 8 dígitos numéricos y no incluir letras.
              </p>
            </div>

            <Button 
              type="button" 
              variant="primary" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-100 active:scale-95 cursor-pointer"
              onClick={() => setShowDniWarning(false)}
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
