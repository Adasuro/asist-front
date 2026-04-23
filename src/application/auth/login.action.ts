'use server'

import { loginWithEmail } from '@/infrastructure/auth/auth.repository'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const { error } = await loginWithEmail(email, password)

    if (error) {
      return { error: error.message }
    }
  } catch (err: any) {
    return { error: 'Error inesperado en el servidor' }
  }

  redirect('/dashboard')
}
