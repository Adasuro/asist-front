import { z } from 'zod'

export const profileSchema = z.object({
  telefono: z.string().max(20, 'El teléfono no puede superar los 20 caracteres').optional().or(z.literal('')),
  direccion: z.string().max(255, 'La dirección no puede superar los 255 caracteres').optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal(''))
})

export const profilePasswordSchema = z.object({
  current_password: z.string().min(1, 'La contraseña actual es obligatoria'),
  password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  password_confirmation: z.string().min(1, 'La confirmación es obligatoria')
}).refine(data => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation']
})
