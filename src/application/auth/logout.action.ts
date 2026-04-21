'use server'

import { signOut } from '@/infrastructure/auth/auth.repository'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  await signOut()
  redirect('/login')
}
