-- =====================
-- USUARIOS
-- =====================
INSERT INTO USUARIOS (nombres, apellidos, username, email, password, is_deleted) VALUES
--Contraseña: UsuarioGarcia
('Carlos',  'García López',  'cgarcia',    'carlos.garcia@timescope.es',   '$2a$10$0BrI0ndP1P5tUiIirUgOeeQZICTwy72AHcGNeJ84soWiwx1aLRACm', false),
--Contraseña: MartinezMartinez
('María',   'Martínez Ruiz', 'mmartinez',  'maria.martinez@timescope.es',  '$2a$10$i/c4xUSoVKJumxz4D2Kqn.O1UMJvqfLh1Te7PiMV/Z8qUVA0gwgFe', false),
--Contraseña: JuanElDestructorDeMundos
('Juan',    'Pérez Sánchez', 'jperez',     'juan.perez@timescope.es',      '$2a$10$gTqKcJDeIL9nWV/CLHa1ku5AETa0Khes.C1E6EP.Ked7jaA1X/Io6', false),
--Contraseña: DragonVampirico2090@@@@
('Laura',   'Fernández Gil', 'lfernandez', 'laura.fernandez@timescope.es', '$2a$10$vjHYe2EDllMbd8nMraSXGule6lBYxkNdkOtGZEQ0Kb4Rp1Djax50u', false),
--Contraseña: MeGustanLosGatos3000@
('Andrés',  'López Torres',  'alopez',     'andres.lopez@timescope.es',    '$2a$10$e4kQAPpvlFxInkd2ZIpbX.h49bqvsiXoJGXJnpA5dCoGI7X7sbgO2', false),
--Contraseña: admin123
('admin',   'Administrador', 'admin',      'admin@timescope.es',           '$2b$10$PKM9iai6W/I1neYmVUs5t.Fb5rWzlakR1MYPjP8fIF6ZaqbiRzfIe', false);

-- =====================
-- USUARIO_ROLES (roles globales)
-- =====================
INSERT INTO USUARIO_ROLES (user_id, roles) VALUES
(1, 'DESARROLLADOR'),  -- cgarcia
(2, 'LIDER'),          -- mmartinez (gestora de proyectos en TechCorp)
(3, 'LIDER'),          -- jperez
(4, 'DIRECTOR'),       -- lfernandez
(5, 'DESARROLLADOR'),  -- alopez
(6, 'LIDER'),
(6, 'DIRECTOR');       -- admin: todos los roles

-- =====================
-- ORGANIZACIONES
-- Solo puede ser admin quien tiene DIRECTOR en esa org.
-- =====================
INSERT INTO ORGANIZACION (nombre, admin_id, is_deleted) VALUES
('TechCorpSolutions',  6, false),  -- Admin: admin (DIRECTOR en TechCorp)
('InnovatechDigital',  6, false),  -- Admin: admin (DIRECTOR en Innovatech)
('CloudSystemPro',     4, false),  -- Admin: lfernandez (DIRECTOR en CloudSystem)
('DataDriveAnalytics', 6, false),  -- Admin: admin (DIRECTOR en DataDrive)
('WebMasterAgency',    6, false),  -- Admin: admin
('SecureNetSecurity',  6, false),  -- Admin: admin
('StreamFlowStartup',  6, false),  -- Admin: admin
('CoreTechEnterprise', 6, false);  -- Admin: admin

-- =====================
-- ROLES POR ORGANIZACIÓN (tabla ternaria USUARIO_ORG_ROL)
-- =====================
INSERT INTO USUARIO_ORG_ROL (user_id, org_id, rol) VALUES
(1, 1, 'DESARROLLADOR'),  -- cgarcia    → DESARROLLADOR en TechCorp
(2, 1, 'LIDER'),          -- mmartinez  → LIDER en TechCorp
(3, 2, 'LIDER'),          -- jperez     → LIDER en Innovatech
(4, 3, 'DIRECTOR'),       -- lfernandez → DIRECTOR en CloudSystem
(5, 4, 'DESARROLLADOR'),  -- alopez     → DESARROLLADOR en DataDrive
(6, 1, 'DIRECTOR'),       -- admin      → DIRECTOR en TechCorp
(6, 2, 'DIRECTOR'),       -- admin      → DIRECTOR en Innovatech
(6, 3, 'DIRECTOR'),       -- admin      → DIRECTOR en CloudSystem
(6, 4, 'DIRECTOR'),       -- admin      → DIRECTOR en DataDrive
(6, 5, 'DIRECTOR'),       -- admin      → DIRECTOR en WebMaster
(6, 6, 'DIRECTOR'),       -- admin      → DIRECTOR en SecureNet
(6, 7, 'DIRECTOR'),       -- admin      → DIRECTOR en StreamFlow
(6, 8, 'DIRECTOR');       -- admin      → DIRECTOR en CoreTech

-- =====================
-- DIRECTORES POR ORGANIZACIÓN (tabla ORGANIZACION_DIRECTORES)
-- =====================
INSERT INTO ORGANIZACION_DIRECTORES (org_id, user_id) VALUES
(1, 6),   -- TechCorp    → admin
(2, 6),   -- Innovatech  → admin
(3, 4),   -- CloudSystem → lfernandez (DIRECTOR nativo)
(3, 6),   -- CloudSystem → admin
(4, 6),   -- DataDrive   → admin
(5, 6),   -- WebMaster   → admin
(6, 6),   -- SecureNet   → admin
(7, 6),   -- StreamFlow  → admin
(8, 6);   -- CoreTech    → admin

-- =====================
-- USUARIOS → ORGANIZACIÓN
-- =====================
UPDATE USUARIOS SET organizacion_id = 1 WHERE id = 1;  -- cgarcia    → TechCorp
UPDATE USUARIOS SET organizacion_id = 1 WHERE id = 2;  -- mmartinez  → TechCorp
UPDATE USUARIOS SET organizacion_id = 2 WHERE id = 3;  -- jperez     → Innovatech
UPDATE USUARIOS SET organizacion_id = 3 WHERE id = 4;  -- lfernandez → CloudSystem
UPDATE USUARIOS SET organizacion_id = 4 WHERE id = 5;  -- alopez     → DataDrive
UPDATE USUARIOS SET organizacion_id = 1 WHERE id = 6;  -- admin      → TechCorp

-- =====================
-- PROYECTOS
-- =====================
INSERT INTO PROYECTOS (nombre, descripcion, estado, organizacion_id, is_deleted) VALUES
-- Org 1: TechCorpSolutions
('TimeScope v1',      'Desarrollo de la primera versión de la plataforma TimeScope.',     'ACTIVO',     1, false),
('App Móvil',         'Aplicación móvil complementaria para la gestión de tareas.',       'ACTIVO',     1, false),
('Portal Admin',      'Panel de administración interno para supervisores.',               'SUSPENDIDO', 1, false),
('API Gateway',       'Diseño e implementación del gateway central de la API REST.',      'COMPLETADO', 1, false),
('Refactor Backend',  'Limpieza de arquitectura hexagonal y servicios de dominio.',       'ACTIVO',     1, false),
-- Org 2: InnovatechDigital
('QA Automatizada',   'Cobertura de pruebas end-to-end y regresión automatizada.',       'ACTIVO',     2, false),
('DevOps Pipeline',   'Automatización de build, test y despliegue continuo.',            'ACTIVO',     2, false),
('Analytics BI',      'Paneles de indicadores para productividad y tiempos de entrega.', 'ACTIVO',     2, false),
-- Org 3: CloudSystemPro
('Gestor Incidencias','Módulo para seguimiento de incidencias internas y externas.',     'ACTIVO',     3, false),
('Integracion ERP',   'Sincronización de usuarios y tareas con sistema ERP.',            'SUSPENDIDO', 3, false),
('Notificaciones Push','Servicio de alertas para tareas próximas a vencer.',             'ACTIVO',     3, false),
-- Org 4: DataDriveAnalytics
('Migracion Cloud',   'Migración progresiva de infraestructura a entorno cloud.',        'ACTIVO',     4, false),
('Onboarding Web',    'Flujo de onboarding para nuevos empleados en la plataforma.',     'COMPLETADO', 4, false),
('Seguridad App',     'Hardening de autenticación, permisos y auditoría.',               'ACTIVO',     4, false),
-- Org 5: WebMasterAgency
('Soporte Clientes',  'Portal de soporte para clientes y gestión de tickets.',           'ACTIVO',     5, false),
('Optimizacion SQL',  'Optimización de consultas pesadas y tuning de índices.',          'ACTIVO',     5, false);

-- =====================
-- PROYECTO_USUARIO (N:M)
-- Cada usuario solo aparece en proyectos de su organización.
-- Admin tiene acceso a todas las orgs como DIRECTOR.
-- =====================
INSERT INTO PROYECTO_USUARIO (proyecto_id, usuario_id) VALUES
-- Org 1 — TechCorp: cgarcia(1), mmartinez(2), admin(6)
(1, 1), (1, 2), (1, 6),
(2, 1), (2, 2), (2, 6),
(3, 1), (3, 2), (3, 6),
(4, 1), (4, 2), (4, 6),
(5, 6),
-- Org 2 — Innovatech: jperez(3), admin(6)
(6, 3), (6, 6),
(7, 3), (7, 6),
(8, 3), (8, 6),
-- Org 3 — CloudSystem: lfernandez(4), admin(6)
(9,  4), (9,  6),
(10, 4), (10, 6),
(11, 4), (11, 6),
-- Org 4 — DataDrive: alopez(5), admin(6)
(12, 5), (12, 6),
(13, 5), (13, 6),
(14, 5), (14, 6),
-- Org 5 — WebMaster: admin(6)
(15, 6),
(16, 6);

-- =====================
-- TAREAS
-- usuario_id debe pertenecer a la misma org que el proyecto al que se asignará.
-- =====================
INSERT INTO TAREAS (nombre, descripcion, estado, horas_estimadas, fecha_limite, usuario_id) VALUES
-- TechCorp: cgarcia(1) y mmartinez(2)
('Diseño BD',             'Diseñar el esquema relacional de la base de datos.',           'COMPLETADO', 4.0,  '2026-05-15 18:00:00', 1),
('Modelos JPA',           'Crear las entidades JPA con sus relaciones.',                  'ABIERTO',    5.0,  '2026-05-12 18:00:00', 1),
('Endpoints REST',        'Implementar los controladores REST del módulo usuarios.',      'ABIERTO',    6.0,  '2026-05-10 18:00:00', 2),
('Autenticación JWT',     'Integrar Spring Security con JWT para login y registro.',      'ACTIVO',     3.0,  '2026-05-08 18:00:00', 2),
-- CloudSystem: lfernandez(4)
('UI Login',              'Diseñar pantallas de inicio de sesión en la app móvil.',       'ACTIVO',     2.5,  '2026-05-11 18:00:00', 4),
-- Innovatech: jperez(3)
('Pruebas API',           'Ejecutar pruebas de integración sobre los endpoints.',        'ABIERTO',    4.0,  '2026-05-13 18:00:00', 3),
-- DataDrive: alopez(5)
('Documentación',         'Documentar los endpoints con Swagger/OpenAPI.',               'ACTIVO',     3.5,  '2026-05-14 18:00:00', 5),
-- Admin(6) — distribuidas por todos sus proyectos
('Maquetar Dashboard',    'Ajustar grid y componentes del dashboard corporativo.',        'ACTIVO',     2.0,  '2026-05-09 18:00:00', 6),
('Perfil Usuario UX',     'Mejorar experiencia visual y responsiva del perfil.',          'ABIERTO',    1.5,  '2026-05-17 18:00:00', 6),
('Refactor CSS Global',   'Unificar variables, espacios y tipografías en toda la app.',  'ACTIVO',     5.0,  '2026-06-02 18:00:00', 6),
('Tabla Usuarios',        'Optimizar tabla de usuarios con estilos consistentes.',        'ABIERTO',    2.5,  '2026-05-19 18:00:00', 6),
('Tabla Proyectos',       'Añadir filtros y ordenar columnas de proyectos.',             'ACTIVO',     3.0,  '2026-05-27 18:00:00', 6),
('Tabla Tareas',          'Mejorar estados visuales y mensajes vacíos.',                 'ACTIVO',     3.5,  '2026-05-29 18:00:00', 6),
('Calendario Mensual',    'Corregir navegación y densidad visual del calendario.',        'ACTIVO',     4.0,  '2026-06-04 18:00:00', 6),
('Integrar Favicon',      'Incorporar favicon de marca en cabecera principal.',           'ABIERTO',    0.5,  '2026-05-11 18:00:00', 6),
('Test Login',            'Validar flujo de autenticación con credenciales inválidas.',  'SUSPENDIDO', 2.0,  '2026-06-10 18:00:00', 6),
('Roles Permisos',        'Revisar permisos por rol en endpoints críticos.',             'ACTIVO',     3.0,  '2026-05-13 18:00:00', 6),
('Auditoria Seguridad',   'Registrar trazas de acceso y cambios sensibles.',             'ABIERTO',    4.0,  '2026-05-31 18:00:00', 6),
('Limpieza Datos',        'Eliminar registros inconsistentes en staging.',                'COMPLETADO', 1.5,  '2026-05-07 18:00:00', 6),
('Backups Nocturnos',     'Configurar política de backups nocturnos.',                   'ACTIVO',     2.5,  '2026-06-06 18:00:00', 6),
('Monitoreo API',         'Activar alertas de latencia y errores HTTP 5xx.',             'ABIERTO',    2.0,  '2026-05-23 18:00:00', 6),
('Cobertura Unit Tests',  'Subir cobertura mínima del servicio de tareas.',              'ACTIVO',     5.0,  '2026-06-08 18:00:00', 6),
('Soporte Incidencia #214','Resolver problema de login en móvil iOS.',                   'COMPLETADO', 1.0,  '2026-05-04 18:00:00', 6),
('Soporte Incidencia #227','Corregir desfase horario en fecha límite.',                  'ABIERTO',    1.25, '2026-05-15 18:00:00', 6),
('Reporte Semanal',       'Preparar resumen semanal para dirección.',                    'COMPLETADO', 2.0,  '2026-05-01 18:00:00', 6),
('Mantenimiento DB',      'Ejecutar mantenimiento preventivo de la base.',               'ACTIVO',     3.0,  '2026-05-21 18:00:00', 6),
('Onboarding Junior',     'Acompañar incorporación de nuevo desarrollador.',             'ACTIVO',     4.0,  '2026-06-12 18:00:00', 6),
('Review Sprint',         'Revisión y cierre de objetivos del sprint actual.',           'ACTIVO',     2.5,  '2026-05-25 18:00:00', 6),
('Roadmap Q3',            'Definir roadmap técnico para el tercer trimestre.',           'ACTIVO',     3.0,  '2026-06-14 18:00:00', 6),
('Revisión UX Final',     'Aplicar ajustes visuales de alto impacto.',                  'ABIERTO',    2.0,  '2026-05-09 18:00:00', 6),
('Microcopy UI',          'Pulir textos de interfaz y estados del sistema.',             'COMPLETADO', 1.5,  '2026-05-04 18:00:00', 6),
('Integración Correo',    'Conectar proveedor SMTP para notificaciones.',                'ACTIVO',     3.5,  '2026-05-20 18:00:00', 6);

-- =====================
-- TAREAS → PROYECTOS
-- proyecto_id debe coincidir con la org del usuario asignado.
-- =====================

-- Org 1 — TechCorp
UPDATE TAREAS SET proyecto_id = 1 WHERE id IN (1, 2, 3);              -- cgarcia/mmartinez → TimeScope v1
UPDATE TAREAS SET proyecto_id = 2 WHERE id = 4;                       -- mmartinez → App Móvil
UPDATE TAREAS SET proyecto_id = 5 WHERE id IN (8, 9, 10, 11, 12, 25, 28, 30, 31); -- admin → Refactor Backend

-- Org 2 — Innovatech
UPDATE TAREAS SET proyecto_id = 6 WHERE id = 6;                       -- jperez → QA Automatizada
UPDATE TAREAS SET proyecto_id = 6 WHERE id IN (13, 14, 15);           -- admin → QA Automatizada
UPDATE TAREAS SET proyecto_id = 7 WHERE id IN (16, 29);               -- admin → DevOps Pipeline
UPDATE TAREAS SET proyecto_id = 8 WHERE id = 22;                      -- admin → Analytics BI

-- Org 3 — CloudSystem
UPDATE TAREAS SET proyecto_id = 11 WHERE id = 5;                      -- lfernandez → Notificaciones Push
UPDATE TAREAS SET proyecto_id = 9  WHERE id = 21;                     -- admin → Gestor Incidencias
UPDATE TAREAS SET proyecto_id = 11 WHERE id = 32;                     -- admin → Notificaciones Push

-- Org 4 — DataDrive
UPDATE TAREAS SET proyecto_id = 12 WHERE id = 7;                      -- alopez → Migracion Cloud
UPDATE TAREAS SET proyecto_id = 14 WHERE id IN (17, 18);              -- admin → Seguridad App
UPDATE TAREAS SET proyecto_id = 13 WHERE id = 27;                     -- admin → Onboarding Web

-- Org 5 — WebMaster
UPDATE TAREAS SET proyecto_id = 15 WHERE id IN (23, 24);              -- admin → Soporte Clientes
UPDATE TAREAS SET proyecto_id = 16 WHERE id IN (19, 20, 26);          -- admin → Optimizacion SQL
