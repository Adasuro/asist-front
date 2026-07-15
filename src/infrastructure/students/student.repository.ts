import { HttpClient } from '../api/http-client'

export const getStudents = async (page = 1, search = '', gradoId = '', seccionId = '') => {
  return HttpClient.get<unknown>('/students', {
    page: page.toString(),
    search,
    grado_id: gradoId,
    seccion_id: seccionId,
  })
}

export const importStudentsCSV = async (formData: FormData) => {
  return HttpClient.post<{ stats: any }>('/students/import', formData)
}

export const createStudent = async (studentData: unknown) => {
  return HttpClient.post<unknown>('/students', studentData)
}

export const updateStudent = async (id: string, studentData: unknown) => {
  return HttpClient.patch<unknown>(`/students/${id}`, studentData)
}

export const deleteStudent = async (id: string) => {
  return HttpClient.delete<unknown>(`/students/${id}`)
}

export const getImportTemplate = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
  return `${API_URL}/students/template`
}
