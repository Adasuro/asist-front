'use client'

import { useState } from 'react'
import { 
  X, 
  User, 
  Mail, 
  CreditCard, 
  GraduationCap,
  Loader2,
  UserCog
} from 'lucide-react'
import { updateAuxiliarAction } from '@/application/admin/admin.actions'

interface EditAuxiliarModalProps {
  auxiliar: any
  grados: any[]
}

export function EditAuxiliarModal({ auxiliar, grados }: EditAuxiliarModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener ID del grado actual
  const currentGradoId = auxiliar.secciones?.[0]?.grado?.id || ''

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateAuxiliarAction(auxiliar.id, formData)
    
    setIsPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
        title="Editar"
      >
        <UserCog size={20} />
        <span>Editar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserCog className="text-blue-600" size={24} />
                Editar Auxiliar
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <X size={16} />
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} /> Nombre Completo
                </label>
                <input 
                  name="nombre_completo" 
                  defaultValue={auxiliar.nombre_completo}
                  required 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CreditCard size={16} /> DNI
                  </label>
                  <input 
                    name="dni" 
                    defaultValue={auxiliar.dni}
                    required 
                    maxLength={8}
                    minLength={8}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={16} /> Grado
                  </label>
                  <select 
                    name="grado_id" 
                    defaultValue={currentGradoId}
                    required 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {grados.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Correo Electrónico
                </label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={auxiliar.email}
                  required 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 size={20} className="animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
