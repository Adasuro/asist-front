import { AuthUser, UserProfile } from '@/domain/auth/user.entity'
import { HttpClient } from '../api/http-client'
import { cookies } from 'next/headers'

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const data = await HttpClient.post<any>('/login', { email, password })

    return { 
      data: { 
        user: data.user, 
        profile: data.user as UserProfile,
        token: data.access_token
      }, 
      error: null 
    }
  } catch (error: any) {
    console.error('Login Error:', error)
    return { data: null, error: { message: error.message || 'Error en el login' } }
  }
}

export const signOut = async () => {
  try {
    await HttpClient.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    
    if (!token) return null;

    // Obtener datos del usuario desde el backend para asegurar que el token es válido
    const user = await HttpClient.get<any>('/user')
    
    return {
      id: user.id,
      email: user.email,
      profile: user as UserProfile
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
