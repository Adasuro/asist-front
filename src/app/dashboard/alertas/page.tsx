import { AlertTriangle, Bell, Clock } from 'lucide-react'

export default function AlertasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Alertas del Sistema</h1>
        <p className="text-gray-500">Notificaciones críticas y preventivas de asistencia</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Historial de Alertas
            </h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Marcar todas como leídas</button>
        </div>
        
        <div className="divide-y divide-gray-50">
            <AlertItem 
                title="Inasistencia Crítica" 
                desc="El estudiante Juan Pérez de 5to A ha faltado 3 días consecutivos." 
                type="critical" 
                time="Hace 10 minutos"
            />
            <AlertItem 
                title="Nueva Justificación Pendiente" 
                desc="Se ha cargado un certificado médico para María López (4to B)." 
                type="info" 
                time="Hace 2 horas"
            />
            <AlertItem 
                title="Recordatorio de Cierre" 
                desc="Faltan 3 secciones por registrar asistencia hoy." 
                type="warning" 
                time="Hace 4 horas"
            />
        </div>

        <div className="p-6 bg-gray-50 text-center text-sm text-gray-500 font-medium">
            Mostrando alertas de las últimas 24 horas
        </div>
      </div>
    </div>
  )
}

function AlertItem({ title, desc, type, time }: any) {
    const icons: any = {
        critical: <AlertTriangle className="text-red-600" size={20} />,
        warning: <AlertTriangle className="text-yellow-600" size={20} />,
        info: <Clock className="text-blue-600" size={20} />,
    }
    const bg: any = {
        critical: 'bg-red-50',
        warning: 'bg-yellow-50',
        info: 'bg-blue-50',
    }
    
    return (
        <div className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
            <div className={`p-3 rounded-xl ${bg[type]}`}>
                {icons[type]}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <span className="text-xs text-gray-400 font-medium">{time}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
                <div className="flex gap-4 mt-3">
                    <button className="text-xs font-bold text-blue-600 hover:underline">Ver detalle</button>
                    <button className="text-xs font-bold text-gray-400 hover:text-gray-600">Archivar</button>
                </div>
            </div>
        </div>
    )
}
