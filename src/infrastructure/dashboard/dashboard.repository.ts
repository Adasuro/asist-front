import { HttpClient } from '../api/http-client';

export interface CriticalStudent {
  nombre_completo: string;
  total: number;
}

export interface TrendData {
  fecha: string;
  presentes: number;
  tardanzas: number;
  faltas: number;
}

export interface AdvancedStats {
  daily_percentage: number;
  monthly_percentage: number;
  critical_absences: CriticalStudent[];
  critical_tardiness: CriticalStudent[];
  trend: TrendData[];
  total_students: number;
}

export const getAdvancedStats = async (seccionId?: string): Promise<AdvancedStats | null> => {
  try {
    const params: Record<string, string> = {};
    if (seccionId) {
      params['seccion_id'] = seccionId;
    }
    const data = await HttpClient.get<AdvancedStats>('/stats/advanced', params, { cache: 'no-store' });
    return data;
  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return null;
  }
};
