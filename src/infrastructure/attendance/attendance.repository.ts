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
  return HttpClient.get<{ asistencias: any[], is_official: boolean }>(`/attendance/section/${sectionId}/daily`)
}

export async function officiateAttendance(sectionId: string) {
  return HttpClient.post<any>(`/attendance/section/${sectionId}/officiate`)
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

export async function justifyAttendance(data: FormData | {
  asistencia_id: string
  motivo: string
  documento_url?: string
}) {
  return HttpClient.post<any>('/justifications', data)
}

export async function getJustifications() {
  return HttpClient.get<any[]>('/justifications')
}

export async function registerBulkAttendance(seccionId: string, students: { estudiante_id: string, estado: 'presente' | 'falta' }[]) {
  return HttpClient.post<any>('/attendance/bulk', { seccion_id: seccionId, students })
}
