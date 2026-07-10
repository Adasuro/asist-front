'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle2 className="text-green-500" size={20} />,
    progress: 'bg-green-500'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <XCircle className="text-red-500" size={20} />,
    progress: 'bg-red-500'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: <AlertCircle className="text-amber-500" size={20} />,
    progress: 'bg-amber-500'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <Info className="text-blue-500" size={20} />,
    progress: 'bg-blue-500'
  }
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const style = toastStyles[type]

  return (
    <div className={`fixed top-4 right-4 z-[100] min-w-[300px] max-w-md animate-in fade-in slide-in-from-right-4 duration-300`}>
      <div className={`${style.bg} ${style.border} border rounded-2xl p-4 shadow-lg flex items-start gap-3 relative overflow-hidden`}>
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${style.text}`}>{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
        
        {/* Progress bar */}
        <div 
          className={`absolute bottom-0 left-0 h-1 ${style.progress} opacity-30 animate-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
}
