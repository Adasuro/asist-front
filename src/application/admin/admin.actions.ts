'use server'

import { 
  createAuxiliar as createAuxiliarRepo, 
  toggleAuxiliarStatus as toggleRepo, 
  updateAuxiliarPassword as updatePasswordRepo 
} from '@/infrastructure/admin/admin.repository'
import { revalidatePath } from 'next/cache'

export async function createAuxiliarAction(formData: FormData) {
  const nombre_completo = formData.get('nombre_completo') as string
  const email = formData.get('email') as string
  const dni = formData.get('dni') as string
  const password = formData.get('password') as string
  const grado_id = formData.get('grado_id') as string

  const result = await createAuxiliarRepo({
    nombre_completo,
    email,
    dni,
    password,
    grado_id
  })

  if (!result.error) {
    revalidatePath('/dashboard/auxiliares')
  }

  return result
}

export async function toggleAuxiliarStatusAction(id: string) {
  const result = await toggleRepo(id)
  
  if (!result.error) {
    revalidatePath('/dashboard/auxiliares')
  }
  
  return result
}

export async function updateAuxiliarPasswordAction(id: string, formData: FormData) {
  const password = formData.get('password') as string
  const result = await updatePasswordRepo(id, password)
  
  if (!result.error) {
    revalidatePath('/dashboard/auxiliares')
  }
  
  return result
}
