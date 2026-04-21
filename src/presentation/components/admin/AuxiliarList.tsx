'use client'

import { useState } from 'react'
import { 
  UserCog, 
  Shield, 
  ShieldOff, 
  Key,
  Mail,
  CreditCard,
  GraduationCap
} from 'lucide-react'
import { toggleAuxiliarStatusAction } from '@/application/admin/admin.actions'
import { ChangePasswordModal } from './ChangePasswordModal'

export function AuxiliarList({ auxiliaries }: { auxiliaries: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggleStatus = async (id: string) => {
    setLoading(id)
    await toggleAuxiliarStatusAction(id)
    setLoading(null)
  }

  if (auxiliaries.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <Users size={48} className="mx-auto mb-4 opacity-20" />
        <p>No hay auxiliares registrados aún.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Auxiliar</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto / DNI</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grado(s) Asignado(s)</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {auxiliaries.map((aux) => {
            const uniqueGrades = Array.from(new Set(aux.secciones.map((s: any) => s.grado.nombre))).join(', ')
            
            return (
              <tr key={aux.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      aux.activo ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      {aux.nombre_completo.charAt(0)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{aux.nombre_completo}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 flex flex-col gap-1">
                    <span className="flex items-center gap-1"><Mail size={14} /> {aux.email}</span>
                    <span className="flex items-center gap-1"><CreditCard size={14} /> {aux.dni}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <GraduationCap size={16} className="text-purple-500" />
                    {uniqueGrades || 'Ninguno'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    aux.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {aux.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <ChangePasswordModal auxiliaryId={aux.id} name={aux.nombre_completo} />
                    
                    <button 
                      onClick={() => handleToggleStatus(aux.id)}
                      disabled={loading === aux.id}
                      className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                        aux.activo 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={aux.activo ? 'Desactivar' : 'Activar'}
                    >
                      {loading === aux.id ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        aux.activo ? <ShieldOff size={20} /> : <Shield size={20} />
                      )}
                      <span>{aux.activo ? 'Desactivar' : 'Activar'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

import { Users } from 'lucide-react'
