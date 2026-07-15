import { HttpClient } from '../api/http-client'

export const getAuxiliaries = async () => {
  try {
    return await HttpClient.get<any>('/admin/auxiliaries')
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getGrados = async () => {
  try {
    return await HttpClient.get<any>('/grados')
  } catch (error) {
    console.error(error)
    return []
  }
}

export const createAuxiliar = async (data: any) => {
  try {
    const result = await HttpClient.post<any>('/admin/auxiliaries', data)
    return { data: result }
  } catch (error: any) {
    return { error: error.message || 'No se pudo conectar con el servidor' }
  }
}

export const updateAuxiliar = async (id: string, data: any) => {
  try {
    const result = await HttpClient.patch<any>(`/admin/auxiliaries/${id}`, data)
    return { data: result }
  } catch (error: any) {
    return { error: error.message || 'No se pudo conectar con el servidor' }
  }
}

export const toggleAuxiliarStatus = async (id: string) => {
  try {
    const result = await HttpClient.patch<any>(`/admin/auxiliaries/${id}/toggle`)
    return { data: result }
  } catch (error: any) {
    return { error: error.message || 'No se pudo conectar con el servidor' }
  }
}

export const updateAuxiliarPassword = async (id: string, password: string) => {
  try {
    const result = await HttpClient.patch<any>(`/admin/auxiliaries/${id}/password`, { password })
    return { data: result }
  } catch (error: any) {
    return { error: error.message || 'No se pudo conectar con el servidor' }
  }
}
