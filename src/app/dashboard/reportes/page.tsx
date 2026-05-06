import { TrendingUp, Download, BarChart2, PieChart } from 'lucide-react'

export default function ReportesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reportes Consolidados</h1>
        <p className="text-gray-500">Análisis estadístico de asistencia y puntualidad</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard title="Asistencia por Grado" description="Resumen mensual por niveles" icon={<BarChart2 size={24} />} />
        <ReportCard title="Alertas de Deserción" description="Estudiantes con >30% de faltas" icon={<TrendingUp size={24} />} color="red" />
        <ReportCard title="Puntualidad Global" description="Comparativa mañana/tarde" icon={<PieChart size={24} />} color="purple" />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-20">
        <div className="max-w-md mx-auto">
          <TrendingUp size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Motor de Reportes en Preparación</h2>
          <p className="text-gray-500 mb-6">Estamos procesando los datos históricos para generar visualizaciones interactivas.</p>
          <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-medium flex items-center gap-2 mx-auto hover:bg-gray-200 transition-all">
            <Download size={18} />
            Descargar Datos Crudos (CSV)
          </button>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, description, icon, color = 'blue' }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  )
}
