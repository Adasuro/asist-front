import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface SeccionAsignada {
  id: string;
  nombre: string;
  grado: {
    nombre: string;
    nivel: number;
  }
}

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export const getAssignedSections = async (userId: string): Promise<SeccionAsignada[]> => {
  try {
    const response = await fetch(`${API_URL}/sections/assigned`, {
      headers: await getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error('Error fetching sections:', error)
    return []
  }
}

export const getTotalCounts = async () => {
  try {
    const response = await fetch(`${API_URL}/stats/counts`, {
      headers: await getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) return { estudiantes: 0, secciones: 0, alertas: 0 }
    return await response.json()
  } catch (error) {
    console.error('Error fetching counts:', error)
    return { estudiantes: 0, secciones: 0, alertas: 0 }
  }
}
