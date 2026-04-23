const API_URL = process.env.NEXT_PUBLIC_API_URL

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export class HttpClient {
  private static async getAuthHeaders() {
    let token: string | undefined

    // Detectar si estamos en el servidor o cliente
    if (typeof window === 'undefined') {
      // Servidor: Importación dinámica para evitar errores en el cliente
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      token = cookieStore.get('auth_token')?.value
    } else {
      // Cliente: Leer de document.cookie de forma segura
      const name = 'auth_token='
      const decodedCookie = decodeURIComponent(document.cookie)
      const ca = decodedCookie.split(';')
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') {
          c = c.substring(1)
        }
        if (c.indexOf(name) === 0) {
          token = c.substring(name.length, c.length)
        }
      }
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
  }

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = await this.getAuthHeaders()
    const { params, ...restOptions } = options

    let url = `${API_URL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        ...headers,
        ...restOptions.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error en la petición' }))
      throw new Error(errorData.message || errorData.error || 'Error en la petición')
    }

    const contentType = response.headers.get('content-type')
    if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
      return response.blob() as unknown as T
    }

    return response.json() as T
  }

  static get<T>(endpoint: string, params?: Record<string, string>, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET', params })
  }

  static post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    })
  }

  static patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(body) 
    })
  }

  static delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}
