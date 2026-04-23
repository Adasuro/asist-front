'use server'

import { loginWithEmail } from '@/infrastructure/auth/auth.repository'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const { data, error } = await loginWithEmail(email, password)

    if (error) {
      return { error: error.message }
    }

    if (data?.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth_token', data.token, {
        httpOnly: false, // Permitir acceso desde el cliente para el HttpClient
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: '/',
      })
    }
  } catch (err: any) {
    return { error: 'Error inesperado en el servidor' }
  }

  redirect('/dashboard')
}
