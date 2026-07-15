'use client'

import { useState } from 'react'
import { Phone, MapPin, Calendar, Save, Loader2, CreditCard, Mail } from 'lucide-react'
import { updateProfileAction } from '@/application/auth/profile.actions'
import { profileSchema } from '@/domain/validation/profile.schema'

export function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const telefono = formData.get('telefono') as string
    const direccion = formData.get('direccion') as string
    const fecha_nacimiento = formData.get('fecha_nacimiento') as string

    // Validate using Zod schema
    const validation = profileSchema.safeParse({ telefono, direccion, fecha_nacimiento })
    if (!validation.success) {
      setError(validation.error.issues[0].message)
      setIsPending(false)
      return
    }

    const result = await updateProfileAction(formData)

    setIsPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos no editables */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" /> DNI (No editable)
          </label>
          <input 
            value={user.dni}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail size={16} className="text-gray-400" /> Correo (No editable)
          </label>
          <input 
            value={user.email}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
          />
        </div>

        {/* Datos editables */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Phone size={16} className="text-blue-600" /> Teléfono
          </label>
          <input 
            name="telefono"
            defaultValue={user.telefono}
            placeholder="Ej: 987654321"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" /> Fecha de Nacimiento
          </label>
          <input 
            type="date"
            name="fecha_nacimiento"
            defaultValue={user.fecha_nacimiento}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" /> Dirección
          </label>
          <input 
            name="direccion"
            defaultValue={user.direccion}
            placeholder="Ej: Av. Las Américas 123, El Tambo"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}

      {success && (
        <p className="text-green-600 text-sm font-medium">¡Perfil actualizado correctamente!</p>
      )}

      <div className="flex justify-end">
        <button 
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Guardar Cambios
        </button>
      </div>
    </form>
  )
}
