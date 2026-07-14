import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('El correo electrónico no es válido').trim(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe tener al menos un carácter especial')
})

export type LoginInput = z.infer<typeof loginSchema>
