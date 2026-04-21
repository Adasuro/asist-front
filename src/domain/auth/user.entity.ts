export type UserRol = 'superusuario' | 'auxiliar';

export interface UserProfile {
  id: string;
  nombre_completo: string;
  email: string;
  dni: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  rol: UserRol;
  activo: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}
