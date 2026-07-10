"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendData } from '@/infrastructure/dashboard/dashboard.repository';

interface TrendChartProps {
  data: TrendData[];
}

export default function TrendChart({ data }: TrendChartProps) {
  // Format dates for X-Axis
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  }));

  if (!data || data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">No hay datos de tendencia suficientes.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Tendencia de Asistencia (Últimos 30 días)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPresentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTardanzas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFaltas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="formattedDate" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
            <Area type="monotone" name="Presentes" dataKey="presentes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPresentes)" />
            <Area type="monotone" name="Tardanzas" dataKey="tardanzas" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorTardanzas)" />
            <Area type="monotone" name="Faltas" dataKey="faltas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFaltas)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
