"use client"

import React, { useState, useRef } from 'react'
import { Upload, X, AlertCircle, FileText, Download } from 'lucide-react'
import { importStudentsAction } from '@/application/students/import.action'
import { Button } from '../ui/Button'
import { HttpClient } from '@/infrastructure/api/http-client'

interface ImportStats {
  success: number
  updated: number
  errors: string[]
}

export default function ImportStudentsModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
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
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await importStudentsAction(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.stats) {
        setResults(result.stats)
        if (result.stats.success > 0 || result.stats.updated > 0) {
          onSuccess()
        }
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo procesar el archivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="text-blue-600" size={24} />
            Importar Alumnos (CSV)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {!results ? (
            <>
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-blue-800 flex items-center gap-1">
                    <FileText size={14} /> REGLAS DE IMPORTACIÓN:
                  </h3>
                  <button 
                    onClick={handleDownloadTemplate}
                    disabled={downloadingTemplate}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 underline"
                  >
                    <Download size={12} /> {downloadingTemplate ? 'Descargando...' : 'Descargar Plantilla'}
                  </button>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-blue-700">
                  <li>• <span className="font-bold">nombre_completo*:</span> Texto</li>
                  <li>• <span className="font-bold">dni*:</span> 8 dígitos numéricos</li>
                  <li>• <span className="font-bold">grado*:</span> ej. "1° Grado"</li>
                  <li>• <span className="font-bold">seccion*:</span> ej. "A", "B"</li>
                  <li>• <span className="font-bold">fecha_nacimiento:</span> AAAA-MM-DD</li>
                  <li>• <span className="font-bold">Otros:</span> Opcionales</li>
                </ul>
                <p className="mt-2 text-[10px] italic text-blue-600">* Campos obligatorios</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-full text-white">
                      <FileText size={32} />
                    </div>
                    <p className="font-bold text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload size={48} className="text-gray-400" />
                    <p className="font-bold text-gray-600">Haz clic o arrastra tu archivo CSV aquí</p>
                    <p className="text-sm text-gray-400 font-medium">Solo archivos con extensión .csv</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <Button 
                  variant="tertiary"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  disabled={!file}
                  isLoading={loading}
                  onClick={handleSubmit}
                  leftIcon={<Upload size={20} />}
                >
                  Subir Alumnos
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                  <p className="text-3xl font-black text-green-600">{results.success}</p>
                  <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Nuevos</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                  <p className="text-3xl font-black text-blue-600">{results.updated}</p>
                  <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Actualizados</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Errores encontrados ({results.errors.length}):
                  </p>
                  <ul className="text-xs text-red-600 space-y-1 font-medium">
                    {results.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                variant="primary"
                className="w-full"
                onClick={onClose}
              >
                Cerrar e ir a la lista
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
