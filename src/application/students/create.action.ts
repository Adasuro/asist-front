'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createStudentAction(data: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return { error: 'No autorizado' }
  }

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

    if (!response.ok) {
      return { error: result.message || 'Error al registrar estudiante' }
    }

    return { success: true, student: result.student }
  } catch (err) {
    return { error: 'Error de conexión con el servidor' }
  }
}
