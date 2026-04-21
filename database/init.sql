-- ============================================================================
-- SISTEMA DE CONTROL DE ASISTENCIA - ESQUEMA COMPLETO DE INICIALIZACIÓN
-- ============================================================================
-- Este script limpia y reconstruye toda la base de datos.
-- Ejecutar en el Editor SQL de Supabase.

-- 1. LIMPIEZA (DROP)
-- Eliminamos triggers y tablas en orden inverso de dependencia
DROP TRIGGER IF EXISTS trg_faltas_excesivas ON asistencias;
DROP TRIGGER IF EXISTS trg_tardanzas_mes ON asistencias;
DROP TRIGGER IF EXISTS trg_codigo_estudiante ON estudiantes;

DROP TABLE IF EXISTS alertas CASCADE;
DROP TABLE IF EXISTS justificaciones CASCADE;
DROP TABLE IF EXISTS asistencias CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS auxiliar_secciones CASCADE;
DROP TABLE IF EXISTS secciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS grados CASCADE;

DROP TYPE IF EXISTS metodo_registro CASCADE;
DROP TYPE IF EXISTS estado_asistencia CASCADE;
DROP TYPE IF EXISTS rol_usuario CASCADE;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. TIPOS ENUM
CREATE TYPE rol_usuario AS ENUM ('superusuario', 'auxiliar');
CREATE TYPE estado_asistencia AS ENUM ('presente', 'tardanza', 'falta');
CREATE TYPE metodo_registro AS ENUM ('codigo', 'manual');

-- 4. TABLAS BASE
-- Grados académicos
CREATE TABLE grados (
  id      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre  text    NOT NULL,        -- ej: "1° Grado"
  nivel   int     NOT NULL UNIQUE, -- orden: 1, 2, 3...
  activo  boolean NOT NULL DEFAULT true
);

-- Usuarios (Espejo de auth.users)
CREATE TABLE usuarios (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo  text        NOT NULL,
  email            text        NOT NULL UNIQUE,
  dni              text        NOT NULL UNIQUE,
  telefono         text,
  direccion        text,
  fecha_nacimiento date,
  rol              rol_usuario NOT NULL,
  activo           boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Secciones por grado
CREATE TABLE secciones (
  id        uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  grado_id  uuid    NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
  nombre    text    NOT NULL,  -- "A", "B", "C"
  activo    boolean NOT NULL DEFAULT true,
  UNIQUE (grado_id, nombre)
);

-- Relación Auxiliar <-> Sección
CREATE TABLE auxiliar_secciones (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seccion_id  uuid    NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
  activo      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, seccion_id)
);

-- Estudiantes
CREATE TABLE estudiantes (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo  text    NOT NULL,
  dni              text    NOT NULL UNIQUE,
  codigo_sistema   text    UNIQUE,
  telefono         text,
  direccion        text,
  fecha_nacimiento date,
  seccion_id       uuid    NOT NULL REFERENCES secciones(id),
  activo           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Asistencias
CREATE TABLE asistencias (
  id               uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id    uuid              NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  registrado_por   uuid              NOT NULL REFERENCES usuarios(id),
  seccion_id       uuid              NOT NULL REFERENCES secciones(id),
  fecha            date              NOT NULL DEFAULT current_date,
  estado           estado_asistencia NOT NULL,
  hora_llegada     time,
  observacion      text,
  metodo_registro  metodo_registro   NOT NULL,
  created_at       timestamptz       NOT NULL DEFAULT now(),
  UNIQUE (estudiante_id, fecha)
);

-- Justificaciones
CREATE TABLE justificaciones (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asistencia_id      uuid NOT NULL REFERENCES asistencias(id) ON DELETE CASCADE,
  registrado_por     uuid NOT NULL REFERENCES usuarios(id),
  motivo             text NOT NULL,
  documento_url      text,
  fecha_presentacion date  NOT NULL DEFAULT current_date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asistencia_id)
);

-- Alertas
CREATE TABLE alertas (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid    NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  tipo          text    NOT NULL,  -- 'tardanzas_a_falta' | 'faltas_excesivas'
  mensaje       text    NOT NULL,
  resuelta      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 5. LÓGICA DE NEGOCIO (FUNCIONES Y TRIGGERS)

-- Generador de Código de Sistema (ej: 3A-001)
CREATE OR REPLACE FUNCTION generar_codigo_sistema()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_nivel   int;
  v_seccion text;
  v_seq     int;
BEGIN
  SELECT g.nivel, s.nombre INTO v_nivel, v_seccion FROM secciones s
  JOIN grados g ON g.id = s.grado_id WHERE s.id = NEW.seccion_id;
  SELECT COUNT(*) + 1 INTO v_seq FROM estudiantes WHERE seccion_id = NEW.seccion_id;
  NEW.codigo_sistema := v_nivel::text || v_seccion || '-' || LPAD(v_seq::text, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_codigo_estudiante BEFORE INSERT ON estudiantes
FOR EACH ROW WHEN (NEW.codigo_sistema IS NULL) EXECUTE FUNCTION generar_codigo_sistema();

-- Regla: 3 tardanzas en el mes = Alerta
CREATE OR REPLACE FUNCTION verificar_tardanzas_mes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_tardanzas int;
BEGIN
  IF NEW.estado <> 'tardanza' THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO v_tardanzas FROM asistencias
  WHERE estudiante_id = NEW.estudiante_id AND estado = 'tardanza'
    AND date_trunc('month', fecha) = date_trunc('month', NEW.fecha);
  IF v_tardanzas >= 2 THEN
    INSERT INTO alertas (estudiante_id, tipo, mensaje)
    VALUES (NEW.estudiante_id, 'tardanzas_a_falta', 'Acumuló 3 tardanzas en el mes. Equivale a 1 falta.')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tardanzas_mes AFTER INSERT ON asistencias
FOR EACH ROW EXECUTE FUNCTION verificar_tardanzas_mes();

-- Regla: 5 faltas injustificadas = Alerta
CREATE OR REPLACE FUNCTION verificar_faltas_excesivas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_faltas int;
BEGIN
  IF NEW.estado <> 'falta' THEN RETURN NEW; END IF;
  SELECT COUNT(*) INTO v_faltas FROM asistencias a
  LEFT JOIN justificaciones j ON j.asistencia_id = a.id
  WHERE a.estudiante_id = NEW.estudiante_id AND a.estado = 'falta' AND j.id IS NULL;
  IF v_faltas >= 4 THEN
    INSERT INTO alertas (estudiante_id, tipo, mensaje)
    VALUES (NEW.estudiante_id, 'faltas_excesivas', 'Acumuló 5 o más faltas injustificadas.');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_faltas_excesivas AFTER INSERT ON asistencias
FOR EACH ROW EXECUTE FUNCTION verificar_faltas_excesivas();

-- 6. SEGURIDAD (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE auxiliar_secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE justificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Funciones auxiliares para RLS
CREATE OR REPLACE FUNCTION mi_rol() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT rol::text FROM usuarios WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION mis_secciones() RETURNS uuid[] LANGUAGE sql STABLE AS $$
  SELECT COALESCE(ARRAY_AGG(seccion_id), '{}'::uuid[]) FROM auxiliar_secciones
  WHERE usuario_id = auth.uid() AND activo = true;
$$;

-- Políticas
CREATE POLICY "Select grados" ON grados FOR SELECT USING (true);
CREATE POLICY "Select secciones" ON secciones FOR SELECT USING (true);
CREATE POLICY "Admin gestiona secciones" ON secciones FOR ALL USING (mi_rol() = 'superusuario');
CREATE POLICY "Admin gestiona usuarios" ON usuarios FOR ALL USING (mi_rol() = 'superusuario');
CREATE POLICY "Usuario ve su perfil" ON usuarios FOR SELECT USING (id = auth.uid());
CREATE POLICY "Auxiliar ve sus secciones" ON auxiliar_secciones FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "Estudiantes por seccion" ON estudiantes FOR SELECT USING (mi_rol() = 'superusuario' OR seccion_id = ANY(mis_secciones()));
CREATE POLICY "Gestion asistencias" ON asistencias FOR ALL USING (mi_rol() = 'superusuario' OR seccion_id = ANY(mis_secciones()));

-- 7. DATOS SEMILLA (GRADOS Y SECCIONES)
INSERT INTO grados (nombre, nivel) VALUES
  ('1° Grado', 1), ('2° Grado', 2), ('3° Grado', 3), ('4° Grado', 4), ('5° Grado', 5)
ON CONFLICT (nivel) DO NOTHING;

INSERT INTO secciones (grado_id, nombre)
SELECT id, unnest(ARRAY['A','B','C','D','E','F','G','H','I','J']) FROM grados
ON CONFLICT (grado_id, nombre) DO NOTHING;
