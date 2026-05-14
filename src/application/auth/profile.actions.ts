'use server'

import { updateProfile, updateProfilePhoto, updateMyPassword } from '@/infrastructure/auth/auth.repository'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const data = {
    telefono: formData.get('telefono'),
    direccion: formData.get('direccion'),
    fecha_nacimiento: formData.get('fecha_nacimiento'),
  }

  const result = await updateProfile(data)
  if (!result.error) {
    revalidatePath('/dashboard/profile')
  }
  return result
}

export async function updateProfilePhotoAction(formData: FormData) {
  const result = await updateProfilePhoto(formData)
  if (!result.error) {
    revalidatePath('/dashboard/profile')
  }
  return result
}

export async function updateMyPasswordAction(formData: FormData) {
  const current_password = formData.get('current_password') as string
  const password = formData.get('password') as string
  const password_confirmation = formData.get('password_confirmation') as string

  const result = await updateMyPassword({
    current_password,
    password,
    password_confirmation
  })
  
  return result
}
