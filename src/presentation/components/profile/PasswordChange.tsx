'use client'

import { useState } from 'react'
import { Lock, ShieldAlert, Key, Loader2, CheckCircle2 } from 'lucide-react'
import { updateMyPasswordAction } from '@/application/auth/profile.actions'
import { profilePasswordSchema } from '@/domain/validation/profile.schema'

export function PasswordChange({ user }: { user: any }) {
  const isSuperUser = user.rol === 'superusuario'
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const current_password = formData.get('current_password') as string
    const password = formData.get('password') as string
    const password_confirmation = formData.get('password_confirmation') as string

    // Validate using Zod schema
    const validation = profilePasswordSchema.safeParse({ current_password, password, password_confirmation })
    if (!validation.success) {
      setError(validation.error.issues[0].message)
      setIsPending(false)
      return
    }

    const result = await updateMyPasswordAction(formData)

    setIsPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      e.currentTarget.reset()
    }
  }

  if (!isSuperUser) {
    return (
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex items-start gap-4">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="font-bold text-amber-800">Seguridad de la Cuenta</h3>
          <p className="text-amber-700 text-sm mt-1">
            Por políticas de seguridad, para cambiar su contraseña debe solicitarlo directamente al <strong>Superusuario</strong>. 
            Él se encargará de asignarle una nueva clave de acceso.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
        <Key className="text-blue-600" size={24} />
        <h3>Cambiar Mi Contraseña</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </p>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2">
            <CheckCircle2 size={16} />
            ¡Contraseña actualizada con éxito!
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Contraseña Actual</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password"
              name="current_password"
              required
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password"
                name="password_confirmation"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Repita la nueva contraseña"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  )
}
