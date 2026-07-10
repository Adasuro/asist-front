'use client'

import React from 'react'
import { X, FileText, Calendar, User, School, Clock, ShieldCheck, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'

interface JustificationDetailModalProps {
  justification: any
  onClose: () => void
}

export default function JustificationDetailModal({ justification, onClose }: JustificationDetailModalProps) {
  if (!justification) return null

  const { asistencia, registrado_por, motivo, documento_url, fecha_presentacion } = justification
  const { estudiante, fecha, estado } = asistencia

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Detalle de Justificación</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Expediente Digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-90">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Student Info Card */}
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
                    {estudiante.nombre_completo.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight">{estudiante.nombre_completo}</h3>
                    <p className="text-blue-100 text-xs font-medium">{estudiante.seccion.grado.nombre} - {estudiante.seccion.nombre}</p>
                </div>
            </div>
            <User className="absolute -bottom-4 -right-4 text-white/10" size={100} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InfoItem 
                icon={<Calendar size={18} className="text-blue-500" />} 
                label="Fecha Inasistencia" 
                value={new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })} 
            />
            <InfoItem 
                icon={<Clock size={18} className="text-amber-500" />} 
                label="Estado Original" 
                value={estado.toUpperCase()} 
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} />
                Motivo de la Falta
            </label>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed font-medium italic">"{motivo}"</p>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-gray-200 grid grid-cols-2 gap-4">
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registrado por</p>
                <p className="text-xs font-black text-gray-700">{registrado_por.nombre_completo}</p>
                <p className="text-[9px] text-blue-500 font-bold uppercase">{registrado_por.rol}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Presentado el</p>
                <p className="text-xs font-black text-gray-700">{new Date(fecha_presentacion).toLocaleDateString('es-PE')}</p>
             </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-8 bg-gray-50 border-t flex gap-3">
          <Button variant="tertiary" className="flex-1 rounded-2xl" onClick={onClose}>
            Cerrar
          </Button>
          {documento_url ? (
            <Button variant="primary" className="flex-1 rounded-2xl shadow-blue-100" onClick={() => window.open(documento_url, '_blank')}>
              <ExternalLink size={18} />
              Ver Documento
            </Button>
          ) : (
            <Button variant="primary" disabled className="flex-1 rounded-2xl opacity-50">
              Sin Adjuntos
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                {icon}
                {label}
            </p>
            <p className="text-sm font-bold text-gray-800 ml-6">{value}</p>
        </div>
    )
}
