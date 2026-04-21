import { getCurrentUser } from '@/infrastructure/auth/auth.repository'
import { getAuxiliaries, getGrados } from '@/infrastructure/admin/admin.repository'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  UserCog, 
  Shield, 
  ShieldOff, 
  Key,
  Mail,
  CreditCard,
  GraduationCap
} from 'lucide-react'
import { AuxiliarList } from '@/presentation/components/admin/AuxiliarList'
import { CreateAuxiliarModal } from '@/presentation/components/admin/CreateAuxiliarModal'

export default async function AuxiliaresPage() {
  const user = await getCurrentUser()

  if (!user || user.profile?.rol !== 'superusuario') {
    redirect('/dashboard')
  }

  const auxiliaries = await getAuxiliaries()
  const grados = await getGrados()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg text-white">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Auxiliares</h1>
              <p className="text-sm text-gray-500">Administra las cuentas y accesos del personal</p>
            </div>
          </div>
        </div>
        
        <CreateAuxiliarModal grados={grados} />
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Lista de Auxiliares</h2>
          <p className="text-sm text-gray-500">Total de auxiliares registrados: {auxiliaries.length}</p>
        </div>
        
        <AuxiliarList auxiliaries={auxiliaries} />
      </div>
    </div>
  )
}
