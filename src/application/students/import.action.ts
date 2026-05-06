'use server'

import { cookies } from 'next/headers'

export async function importStudentsAction(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return { error: 'No se encontró la sesión activa (Token faltante)' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || data.message || 'Error en el servidor durante la importación' }
    }

    return { stats: data.stats }
  } catch (err: any) {
    console.error("Import Action Error:", err)
    return { error: 'Error inesperado al conectar con el servidor' }
  }
}
