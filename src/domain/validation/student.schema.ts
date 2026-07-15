import { z } from 'zod'

export const studentSchema = z.object({
  nombre_completo: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre es demasiado largo')
    .trim(),
  dni: z.string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  grado_id: z.string().min(1, 'El grado es obligatorio'),
  seccion_id: z.string().min(1, 'La sección es obligatoria'),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal(''))
})

export type StudentInput = z.infer<typeof studentSchema>
