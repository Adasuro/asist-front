import { AuthUser, UserProfile } from '@/domain/auth/user.entity'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { data: null, error: { message: data.message || 'Error en el login' } }
    }

    // Guardar el token en las cookies (para Server Components)
    const cookieStore = await cookies()
    cookieStore.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
    })

    return { 
      data: { 
        user: data.user, 
        profile: data.user as UserProfile 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Login Error:', error)
    return { data: null, error: { message: 'No se pudo conectar con el servidor' } }
  }
}

export const signOut = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (token) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  cookieStore.delete('auth_token')
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  try {
    const response = await fetch(`${API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) return null

    const userData = await response.json()
    return {
      id: userData.id,
      email: userData.email,
      profile: userData as UserProfile
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
