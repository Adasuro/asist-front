'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  School, 
  AlertTriangle, 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  ClipboardCheck,
  CalendarDays
} from 'lucide-react'
import { logoutAction } from '@/application/auth/logout.action'

interface SidebarProps {
  user: {
    nombre_completo: string
    rol: string
  }
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  {
    title: 'Panel de Control',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['superusuario', 'auxiliar']
  },
  {
    title: 'Gestión de Auxiliares',
    href: '/dashboard/auxiliares',
    icon: <Users size={20} />,
    roles: ['superusuario']
  },
  {
    title: 'Estudiantes',
    href: '/dashboard/estudiantes',
    icon: <Users size={20} />,
    roles: ['superusuario', 'auxiliar']
  },
  {
    title: 'Asistencia',
    href: '/dashboard/asistencia',
    icon: <ClipboardCheck size={20} />,
    roles: ['auxiliar']
  },
  {
    title: 'Justificaciones',
    href: '/dashboard/justificaciones',
    icon: <FileText size={20} />,
    roles: ['superusuario', 'auxiliar']
  },
  {
    title: 'Reportes',
    href: '/dashboard/reportes',
    icon: <TrendingUp size={20} />,
    roles: ['superusuario']
  },
  {
    title: 'Calendario',
    href: '/dashboard/calendario',
    icon: <CalendarDays size={20} />,
    roles: ['superusuario', 'auxiliar']
  },
  {
    title: 'Alertas',
    href: '/dashboard/alertas',
    icon: <AlertTriangle size={20} />,
    roles: ['superusuario']
  }
]

export function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const filteredItems = navItems.filter(item => item.roles.includes(user.rol))

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Logo */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <School size={24} />
            </div>
            <span className="font-bold text-xl text-gray-800">ASIST</span>
          </div>
        )}
        {isCollapsed && (
          <div className="bg-blue-600 p-2 rounded-lg text-white mx-auto">
            <School size={24} />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <UserCircle size={24} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-800 truncate">{user.nombre_completo}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user.rol}</p>
            </div>
          )}
        </div>
        
        <form action={logoutAction} className="mt-4">
          <button 
            className={`w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </form>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-blue-600 shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
