'use server'

import { importStudentsCSV } from '@/infrastructure/students/student.repository'

export async function importStudentsAction(formData: FormData) {
  try {
    const result = await importStudentsCSV(formData)
    return { stats: result.stats }
  } catch (err: any) {
    return { error: err.message || 'Error inesperado al conectar con el servidor' }
  }
}
