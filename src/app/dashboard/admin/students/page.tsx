"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Download, Search, Users, Filter } from 'lucide-react'
import StudentTable from '@/presentation/components/admin/StudentTable'
import ImportStudentsModal from '@/presentation/components/admin/ImportStudentsModal'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        }
      })
      const data = await response.json()
      setStudents(data.data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/template`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth_token=')[1]?.split(';')[0]}`,
        }
      })
      
      if (!response.ok) throw new Error('No se pudo descargar la plantilla')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_estudiantes.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error al descargar la plantilla')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Gestión de Alumnos
          </h1>
          <p className="text-gray-500 text-sm">Administra la información de los estudiantes y realiza cargas masivas.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={handleDownloadTemplate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <Download size={18} /> Plantilla
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 font-bold transition-colors"
          >
            <Plus size={18} /> Importar CSV
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md shadow-blue-200 transition-all active:scale-95">
            <Plus size={18} /> Nuevo Alumno
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o código..."
            className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
            <option value="">Todos los grados</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
            <option value="">Todas las secciones</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <StudentTable students={students} loading={loading} />

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border text-sm text-gray-500">
        <p>Mostrando {students.length} alumnos registrados</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Anterior</button>
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Siguiente</button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportStudentsModal 
          onClose={() => setShowImportModal(false)} 
          onSuccess={fetchStudents} 
        />
      )}
    </div>
  )
}
