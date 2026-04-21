import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export const getAuxiliaries = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/auxiliaries`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('Error al obtener auxiliares')
    return await response.json()
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getGrados = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/grados`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('Error al obtener grados')
    return await response.json()
  } catch (error) {
    console.error(error)
    return []
  }
}

export const createAuxiliar = async (data: any) => {
  try {
    const response = await fetch(`${API_URL}/admin/auxiliaries`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Error al crear auxiliar' }
    return { data: result }
  } catch (error) {
    return { error: 'No se pudo conectar con el servidor' }
  }
}

export const toggleAuxiliarStatus = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/auxiliaries/${id}/toggle`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    })
    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Error al cambiar estado' }
    return { data: result }
  } catch (error) {
    return { error: 'No se pudo conectar con el servidor' }
  }
}

export const updateAuxiliarPassword = async (id: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/admin/auxiliaries/${id}/password`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ password }),
    })
    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Error al actualizar contraseña' }
    return { data: result }
  } catch (error) {
    return { error: 'No se pudo conectar con el servidor' }
  }
}
