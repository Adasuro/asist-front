"use client";

import { BarChart3, TrendingUp, Users } from 'lucide-react';

interface KpiCardsProps {
  dailyPercentage: number;
  monthlyPercentage: number;
  totalStudents: number;
}

export default function KpiCards({ dailyPercentage, monthlyPercentage, totalStudents }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard 
        title="Estudiantes Activos" 
        value={totalStudents.toString()} 
        icon={<Users size={24} />} 
        color="blue"
      />
      <KpiCard 
        title="Asistencia Diaria (Hoy)" 
        value={`${dailyPercentage}%`} 
        icon={<TrendingUp size={24} />} 
        color="green"
        description="Porcentaje de estudiantes presentes hoy"
      />
      <KpiCard 
        title="Asistencia Mensual" 
        value={`${monthlyPercentage}%`} 
        icon={<BarChart3 size={24} />} 
        color="purple"
        description="Promedio en el mes actual"
      />
    </div>
  );
}

function KpiCard({ title, value, icon, color, description }: { title: string, value: string, icon: React.ReactNode, color: string, description?: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm font-medium text-gray-500 mt-1">{title}</div>
        {description && <div className="text-xs text-gray-400 mt-2">{description}</div>}
      </div>
    </div>
  );
}
