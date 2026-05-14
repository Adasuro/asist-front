'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, User } from 'lucide-react'
import { updateProfilePhotoAction } from '@/application/auth/profile.actions'
import Image from 'next/image'

export function PhotoUpload({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const photoUrl = user.foto_perfil 
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${user.foto_perfil}`
    : null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsPending(true)
    const formData = new FormData()
    formData.append('foto', file)

    const result = await updateProfilePhotoAction(formData)
    setIsPending(false)

    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md relative">
          {photoUrl ? (
            <Image 
              src={photoUrl} 
              alt={user.nombre_completo} 
              fill 
              className="object-cover"
              unoptimized // Para evitar problemas con dominios externos si no están en next.config
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-blue-50">
              <User size={64} />
            </div>
          )}
          
          {isPending && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
              <Loader2 size={32} className="animate-spin" />
            </div>
          )}
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white"
        >
          <Camera size={20} />
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">{user.nombre_completo}</h2>
        <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">{user.rol}</p>
      </div>
    </div>
  )
}
