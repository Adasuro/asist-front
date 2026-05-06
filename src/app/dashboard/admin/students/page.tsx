"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Download, Search, Users } from 'lucide-react'
import StudentTable from '@/presentation/components/admin/StudentTable'
import ImportStudentsModal from '@/presentation/components/admin/ImportStudentsModal'
import CreateStudentModal from '@/presentation/components/admin/CreateStudentModal'
import { Button } from '@/presentation/components/ui/Button'
import { Input } from '@/presentation/components/ui/Input'
import { HttpClient } from '@/infrastructure/api/http-client'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const data = await HttpClient.get<any>('/students', { search: searchTerm })
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
      const blob = await HttpClient.get<Blob>('/students/template')
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
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl text-white">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Alumnos</h1>
            <p className="text-gray-500 text-sm font-medium">Administración global de estudiantes.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button variant="tertiary" onClick={handleDownloadTemplate} leftIcon={<Download size={18} />}>
            Plantilla
          </Button>
          <Button variant="secondary" onClick={() => setShowImportModal(true)} leftIcon={<Plus size={18} />}>
            Importar
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
            Nuevo Alumno
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <Input 
          placeholder="Buscar estudiantes..."
          leftIcon={<Search size={20} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <StudentTable 
        students={students} 
        loading={loading} 
        onRefresh={fetchStudents} 
      />

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
  )
}
