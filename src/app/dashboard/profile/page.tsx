import { getCurrentUser } from '@/infrastructure/auth/auth.repository'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { PhotoUpload } from '@/presentation/components/profile/PhotoUpload'
import { ProfileForm } from '@/presentation/components/profile/ProfileForm'
import { PasswordChange } from '@/presentation/components/profile/PasswordChange'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <UserCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
              <p className="text-sm text-gray-500">Gestiona tu información personal y de seguridad</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Foto y Resumen */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <PhotoUpload user={user.profile} />
          </div>
        </div>

        {/* Columna Derecha: Formularios */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
              Información Personal
            </h3>
            <ProfileForm user={user.profile} />
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <PasswordChange user={user.profile} />
          </div>
        </div>
      </main>
    </div>
  )
}
