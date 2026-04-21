-- ============================================================================
-- SCRIPT DE SEMILLAS: USUARIOS Y ESTUDIANTES DE PRUEBA
-- ============================================================================
-- Ejecutar DESPUÉS de init.sql.

-- 1. USUARIOS EN AUTH Y PUBLIC (Contraseña: Prueba123!)
DO $$
BEGIN
  -- Superusuario
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@colegio.edu') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
    VALUES ('11111111-1111-1111-1111-111111111111', 'admin@colegio.edu', crypt('Prueba123!', gen_salt('bf')), now(), 'authenticated', 'authenticated');
    
    INSERT INTO usuarios (id, nombre_completo, email, dni, rol)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Director General', 'admin@colegio.edu', '00000001', 'superusuario');
  END IF;

  -- Auxiliares (1 al 5)
  FOR i IN 1..5 LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'aux' || i || '@colegio.edu') THEN
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
      VALUES (
        RPAD(i::text, 8, i::text) || '-2222-2222-2222-222222222222', 
        'aux' || i || '@colegio.edu', 
        crypt('Prueba123!', gen_salt('bf')), 
        now(), 'authenticated', 'authenticated'
      );
      
      INSERT INTO usuarios (id, nombre_completo, email, dni, rol)
      VALUES (
        RPAD(i::text, 8, i::text) || '-2222-2222-2222-222222222222', 
        'Auxiliar ' || i, 
        'aux' || i || '@colegio.edu', 
        '1000000' || i, 
        'auxiliar'
      );
    END IF;
  END LOOP;
END $$;

-- 2. ASIGNACIÓN DE SECCIONES A AUXILIARES
-- Aux 1 -> 1° Grado (todas las secciones)
INSERT INTO auxiliar_secciones (usuario_id, seccion_id)
SELECT '11111111-2222-2222-2222-222222222222', s.id FROM secciones s JOIN grados g ON s.grado_id = g.id WHERE g.nivel = 1
ON CONFLICT DO NOTHING;

-- 3. GENERACIÓN DE ESTUDIANTES (10 por grado aleatorio)
INSERT INTO estudiantes (nombre_completo, dni, seccion_id)
SELECT 
  'Estudiante ' || i,
  (80000000 + i)::text,
  (SELECT id FROM secciones ORDER BY random() LIMIT 1)
FROM generate_series(1, 50) i
ON CONFLICT (dni) DO NOTHING;
