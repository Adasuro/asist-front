"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import StudentTable from '@/presentation/components/admin/StudentTable'
import ImportStudentsModal from '@/presentation/components/admin/ImportStudentsModal'
import CreateStudentModal from '@/presentation/components/admin/CreateStudentModal'
import { Button } from '@/presentation/components/ui/Button'
import { Input } from '@/presentation/components/ui/Input'
import { Select } from '@/presentation/components/ui/Select'
import { HttpClient } from '@/infrastructure/api/http-client'

interface Grado {
  id: string
  nombre: string
  secciones: { id: string, nombre: string }[]
}

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [gradoId, setGradoId] = useState('')
  const [seccionId, setSeccionId] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStudents, setTotalStudents] = useState(0)
  
  const [grados, setGrados] = useState<Grado[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchGrados = async () => {
    try {
      const data = await HttpClient.get<Grado[]>('/grados')
      setGrados(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching grades:', error)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = {
        search: searchTerm,
        grado_id: gradoId,
        seccion_id: seccionId,
        page: page.toString()
      }
      
      const data = await HttpClient.get<any>('/students', params)
      setStudents(data.data || [])
      setTotalPages(data.last_page || 1)
      setTotalStudents(data.total || 0)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRole = async () => {
    try {
      const data = await HttpClient.get<any>('/user')
      setUserRole(data.rol)
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  useEffect(() => {
    fetchUserRole()
    fetchGrados()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      fetchStudents()
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, gradoId, seccionId])

  useEffect(() => {
    fetchStudents()
  }, [page])

  const isSuper = userRole === 'superusuario'
  const selectedGrado = grados.find(g => g.id === gradoId)
  
  const gradoOptions = grados.map(g => ({ value: g.id, label: g.nombre }))
  const seccionOptions = selectedGrado?.secciones.map(s => ({ value: s.id, label: s.nombre })) || []

  const handleDownloadTemplate = async () => {
    try {
      const blob = await HttpClient.get<Blob>('/students/template')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_estudiantes.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error al descargar plantilla:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-100">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Alumnos</h1>
              <p className="text-gray-500 text-sm font-medium">
                {isSuper 
                  ? 'Administra la información de todos los estudiantes.' 
                  : 'Consulta la información de tus secciones asignadas.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button variant="tertiary" onClick={handleDownloadTemplate} leftIcon={<Download size={18} />}>
              Plantilla
            </Button>
            <Button variant="secondary" onClick={() => setShowImportModal(true)} leftIcon={<Plus size={18} />}>
              Importar CSV
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
              {isSuper ? 'Nuevo Alumno' : 'Registrar'}
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Input 
              placeholder="Buscar por nombre, DNI o código..."
              leftIcon={<Search size={20} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select 
              options={gradoOptions}
              value={gradoId}
              onChange={(e) => { setGradoId(e.target.value); setSeccionId(''); }}
              placeholder="Todos los grados"
            />
          </div>
          <div>
            <Select 
              options={seccionOptions}
              value={seccionId}
              onChange={(e) => setSeccionId(e.target.value)}
              disabled={!gradoId}
              placeholder="Todas las secciones"
            />
          </div>
        </div>

        {/* Students Table */}
        <StudentTable 
          students={students} 
          loading={loading} 
          onRefresh={fetchStudents}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border text-sm text-gray-500 shadow-sm">
          <p className="font-medium text-gray-600">Mostrando {students.length} de {totalStudents} alumnos</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-bold">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <Button 
                variant="tertiary" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft size={20} />
              </Button>
              <Button 
                variant="tertiary" 
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showImportModal && (
          <ImportStudentsModal 
            onClose={() => setShowImportModal(false)} 
            onSuccess={fetchStudents} 
          />
        )}

        {showCreateModal && (
          <CreateStudentModal 
            onClose={() => setShowCreateModal(false)} 
            onSuccess={fetchStudents} 
          />
        )}
      </div>
    </div>
  )
}
