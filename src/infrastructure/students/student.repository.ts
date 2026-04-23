import { HttpClient } from '../api/http-client'

export const getStudents = async (page = 1, search = '', gradoId = '', seccionId = '') => {
  return HttpClient.get<any>('/students', {
    page: page.toString(),
    search,
    grado_id: gradoId,
    seccion_id: seccionId,
  })
}

export const importStudentsCSV = async (formData: FormData) => {
  return HttpClient.post<any>('/students/import', formData)
}

export const createStudent = async (studentData: any) => {
  return HttpClient.post<any>('/students', studentData)
}

export const getImportTemplate = async () => {
  // Para descargar archivos binarios (como un stream de CSV), 
  // a veces es mejor usar fetch directamente si HttpClient espera JSON.
  // Pero nuestro HttpClient lanza error si !response.ok, lo cual es bueno.
  
  // Como es un archivo para descargar, usaremos la URL directa o un fetch manual
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  return `${API_URL}/students/template`
}
