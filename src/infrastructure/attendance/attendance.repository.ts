import { HttpClient } from '@/infrastructure/api/http-client'

export async function registerAttendance(data: {
  estudiante_id?: string
  codigo_sistema?: string
  estado?: 'presente' | 'tardanza' | 'falta'
  metodo_registro: 'codigo' | 'manual'
  observacion?: string
}) {
  return HttpClient.post<any>('/attendance', data)
}

export async function getDailyAttendance(sectionId: string) {
  return HttpClient.get<any[]>(`/attendance/section/${sectionId}/daily`)
}

export async function getSectionStudents(sectionId: string) {
    const res = await HttpClient.get<any>('/students', { seccion_id: sectionId, per_page: '100' })
    return res.data || []
}

export async function searchStudents(query: string, sectionId: string) {
  return HttpClient.get<any[]>('/students', {
    search: query,
    seccion_id: sectionId
  })
}

export async function justifyAttendance(data: {
  asistencia_id: string
  motivo: string
  documento_url?: string
}) {
  return HttpClient.post<any>('/justifications', data)
}
