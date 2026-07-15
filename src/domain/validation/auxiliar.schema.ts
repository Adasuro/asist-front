import { z } from 'zod'

export const createAuxiliarSchema = z.object({
  nombre_completo: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre es demasiado largo')
    .trim(),
  email: z.string().email('El correo electrónico no es válido').trim(),
  dni: z.string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  grado_id: z.string().min(1, 'El grado es obligatorio')
})

export const updateAuxiliarSchema = createAuxiliarSchema.omit({ password: true })

export const changeAuxiliarPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
})
