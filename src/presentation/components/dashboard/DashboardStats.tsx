"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { getAdvancedStats, AdvancedStats } from '@/infrastructure/dashboard/dashboard.repository';
import KpiCards from './KpiCards';
import TrendChart from './TrendChart';
import CriticalStudentsList from './CriticalStudentsList';

interface Section {
  id: string;
  nombre: string;
  grado: { nombre: string; nivel: number };
}

interface DashboardStatsProps {
  isSuper: boolean;
  sections: Section[];
}

export default function DashboardStats({ isSuper, sections }: DashboardStatsProps) {
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  const { data: stats, isLoading: loading } = useSWR<AdvancedStats | null>(
    selectedSection ? `/stats/advanced?seccion_id=${selectedSection}` : '/stats/advanced',
    () => getAdvancedStats(selectedSection || undefined)
  );

  return (
    <div className="space-y-8">
      {isSuper && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="font-medium text-gray-700">Filtro Global de Rendimiento</div>
          <select 
            className="border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-gray-700 outline-none"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Todas las secciones (Colegio Completo)</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.grado.nombre} - {sec.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="h-32 bg-gray-200 rounded-2xl"></div>
             <div className="h-32 bg-gray-200 rounded-2xl"></div>
             <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-72 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-8">
               <div className="h-40 bg-gray-200 rounded-2xl"></div>
               <div className="h-40 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      ) : stats ? (
        <>
          <KpiCards 
            dailyPercentage={stats.daily_percentage} 
            monthlyPercentage={stats.monthly_percentage} 
            totalStudents={stats.total_students} 
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TrendChart data={stats.trend} />
            </div>
            <div className="space-y-8">
              <CriticalStudentsList 
                title="Top Faltas Injustificadas" 
                data={stats.critical_absences} 
                type="faltas" 
              />
              <CriticalStudentsList 
                title="Top Tardanzas Injustificadas" 
                data={stats.critical_tardiness} 
                type="tardanzas" 
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
          Error al cargar las estadísticas avanzadas.
        </div>
      )}
    </div>
  );
}
