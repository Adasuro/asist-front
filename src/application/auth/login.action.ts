'use server'

import { loginWithEmail } from '@/infrastructure/auth/auth.repository'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await loginWithEmail(email, password)

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
