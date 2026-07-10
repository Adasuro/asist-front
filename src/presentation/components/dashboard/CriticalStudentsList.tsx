"use client";

import { CriticalStudent } from '@/infrastructure/dashboard/dashboard.repository';

interface CriticalStudentsListProps {
  title: string;
  data: CriticalStudent[];
  type: 'faltas' | 'tardanzas';
}

export default function CriticalStudentsList({ title, data, type }: CriticalStudentsListProps) {
  const maxTotal = data.length > 0 ? Math.max(...data.map(d => d.total)) : 1;
  const colorClass = type === 'faltas' ? 'bg-red-500' : 'bg-yellow-500';
  const textClass = type === 'faltas' ? 'text-red-700' : 'text-yellow-700';
  const bgSoftClass = type === 'faltas' ? 'bg-red-50' : 'bg-yellow-50';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
      
      {data.length === 0 ? (
        <div className={`flex-1 flex items-center justify-center rounded-xl border border-dashed text-sm font-medium ${textClass} ${bgSoftClass} p-4 text-center`}>
          No hay alumnos críticos registrados. ¡Excelente trabajo!
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((student, index) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="w-1/3 truncate text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors" title={student.nombre_completo}>
                {student.nombre_completo}
              </div>
              <div className="flex-1 flex items-center">
                <div 
                  className={`h-6 rounded-md ${colorClass} transition-all duration-500 group-hover:opacity-80`} 
                  style={{ width: `${(student.total / maxTotal) * 100}%`, minWidth: '24px' }}
                />
                <span className="ml-3 text-sm font-bold text-gray-800">{student.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
