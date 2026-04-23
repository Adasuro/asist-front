"use client"

import React from 'react'
import { User, Phone, MapPin, Calendar, Hash, Eye } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface Student {
  id: string
  nombre_completo: string
  dni: string
  codigo_sistema: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  seccion: {
    nombre: string
    grado: {
      nombre: string
    }
  }
}

export default function StudentTable({ students, loading }: { students: Student[], loading: boolean }) {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border shadow-sm">
        <User className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-700">No hay alumnos registrados</h3>
        <p className="text-gray-500">Comienza registrando uno individualmente o por CSV.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alumno</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Código / DNI</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grado y Sección</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {student.nombre_completo.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{student.nombre_completo}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> {student.fecha_nacimiento || 'N/A'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-700 flex items-center gap-1">
                    <Hash size={14} className="text-gray-400" /> {student.codigo_sistema}
                  </p>
                  <p className="text-xs text-gray-500">DNI: {student.dni}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="info">
                    {student.seccion.grado.nombre} - {student.seccion.nombre}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-700 flex items-center gap-1">
                    <Phone size={14} className="text-gray-400" /> {student.telefono || 'Sin telf.'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin size={12} className="text-gray-400" /> {student.direccion || 'Sin direc.'}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" leftIcon={<Eye size={16} />}>
                    Ficha
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
