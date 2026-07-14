'use server'

import { createStudent, updateStudent, deleteStudent } from '@/infrastructure/students/student.repository'
import { revalidatePath } from 'next/cache'

export async function createStudentAction(data: any) {
  try {
    await createStudent(data)
    revalidatePath('/dashboard/estudiantes')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Error al registrar' }
  }
}

export async function updateStudentAction(id: string, data: any) {
  try {
    await updateStudent(id, data)
    revalidatePath('/dashboard/estudiantes')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar' }
  }
}

export async function deleteStudentAction(id: string) {
  try {
    await deleteStudent(id)
    revalidatePath('/dashboard/estudiantes')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Error al eliminar' }
  }
}
