'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createStudentAction(data: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'No autorizado' }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Error al registrar' }

    revalidatePath('/dashboard/estudiantes')
    return { success: true }
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}

export async function updateStudentAction(id: string, data: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'No autorizado' }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Error al actualizar' }

    revalidatePath('/dashboard/estudiantes')
    return { success: true }
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}

export async function deleteStudentAction(id: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return { error: 'No autorizado' }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Error al eliminar' }

    revalidatePath('/dashboard/estudiantes')
    return { success: true }
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}
