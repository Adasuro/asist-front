'use server'

import { signOut } from '@/infrastructure/auth/auth.repository'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function logoutAction() {
  await signOut()
  
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  
  redirect('/login')
}
