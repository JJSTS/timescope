-- =====================
-- USUARIOS
INSERT INTO USUARIOS (nombres, apellidos, username, email, password, is_deleted) VALUES
--Contraseña: UsuarioGarcia
('Carlos',   'García López','cgarcia',   'carlos.garcia@timescope.es',   '$2a$10$0BrI0ndP1P5tUiIirUgOeeQZICTwy72AHcGNeJ84soWiwx1aLRACm', false),
--Contraseña: MartinezMartinez
('María','Martínez Ruiz',   'mmartinez', 'maria.martinez@timescope.es',  '$2a$10$i/c4xUSoVKJumxz4D2Kqn.O1UMJvqfLh1Te7PiMV/Z8qUVA0gwgFe',  false),
--Contraseña: JuanElDestructorDeMundos
('Juan', 'Pérez Sánchez',   'jperez','juan.perez@timescope.es','$2a$10$gTqKcJDeIL9nWV/CLHa1ku5AETa0Khes.C1E6EP.Ked7jaA1X/Io6', false),
--Contraseña: DragonVampirico2090@@@@
('Laura','Fernández Gil',   'lfernandez', 'laura.fernandez@timescope.es','$2a$10$vjHYe2EDllMbd8nMraSXGule6lBYxkNdkOtGZEQ0Kb4Rp1Djax50u', false),
--Contraseña: MeGustanLosGatos3000@
('Andrés','López Torres','alopez','andres.lopez@timescope.es','$2a$10$e4kQAPpvlFxInkd2ZIpbX.h49bqvsiXoJGXJnpA5dCoGI7X7sbgO2', false),
--Contraseña: admin123
('admin','Administrador','admin','admin@timescope.es','$2b$10$PKM9iai6W/I1neYmVUs5t.Fb5rWzlakR1MYPjP8fIF6ZaqbiRzfIe', false);

-- USUARIO_ROLES
INSERT INTO USUARIO_ROLES (user_id, roles) VALUES
(1, 'DESARROLLADOR'),
(2, 'DESARROLLADOR'),
(3, 'LIDER'),
(4, 'DIRECTOR'),
(5, 'DESARROLLADOR'),
(6, 'LIDER'),
(6, 'DIRECTOR'),
(6, 'DESARROLLADOR');

-- ORGANIZACIONES CON ADMINS
INSERT INTO ORGANIZACION (nombre, admin_id, is_deleted) VALUES
('TechCorpSolutions', 2, false),           -- Admin: María (DESARROLLADOR)
('InnovatechDigital', 3, false),           -- Admin: Juan (LIDER)
('CloudSystemPro', 4, false),              -- Admin: Laura (DIRECTOR)
('DataDriveAnalytics', 5, false),          -- Admin: Andrés (LIDER)
('WebMasterAgency', 6, false),             -- Admin: admin (DIRECTOR)
('SecureNetSecurity', 6, false),           -- Admin: admin (DIRECTOR)
('StreamFlowStartup', 6, false),           -- Admin: admin (DIRECTOR)
('CoreTechEnterprise', 6, false);          -- Admin: admin (DIRECTOR)

-- DIRECTORES POR ORGANIZACIÓN
INSERT INTO ORGANIZACION_DIRECTORES (org_id, user_id) VALUES
(1, 2),  -- TechCorp → mmartinez
(2, 3),  -- Innovatech → jperez
(3, 4),  -- CloudSystem → lfernandez
(4, 5),  -- DataDrive → alopez
(5, 6),  -- WebMaster → admin
(6, 6),  -- SecureNet → admin
(7, 6),  -- StreamFlow → admin
(8, 6);  -- CoreTech → admin

-- RELACIÓN USUARIOS - ORGANIZACIONES
UPDATE USUARIOS SET organizacion_id = 1 WHERE id = 1;  -- Carlos → TechCorp
UPDATE USUARIOS SET organizacion_id = 1 WHERE id = 2;  -- María → TechCorp (ADMIN)
UPDATE USUARIOS SET organizacion_id = 2 WHERE id = 3;  -- Juan → Innovatech (ADMIN)
UPDATE USUARIOS SET organizacion_id = 3 WHERE id = 4;  -- Laura → CloudSystem (ADMIN)
UPDATE USUARIOS SET organizacion_id = 4 WHERE id = 5;  -- Andrés → DataDrive (ADMIN)
UPDATE USUARIOS SET organizacion_id = 1 WHERE id = 6;  -- admin → TechCorp (SUPER ADMIN)


-- PROYECTOS
INSERT INTO PROYECTOS (nombre, descripcion, estado, organizacion_id, is_deleted) VALUES
('TimeScope v1',  'Desarrollo de la primera versión de la plataforma TimeScope.',  'ACTIVO', 1, false),
('App Móvil', 'Aplicación móvil complementaria para la gestión de tareas.','ACTIVO', 1, false),
('Portal Admin',  'Panel de administración interno para supervisores.', 'SUSPENDIDO', 1, false),
('API Gateway',   'Diseño e implementación del gateway central de la API REST.',   'COMPLETADO', 1, false),
('Refactor Backend', 'Limpieza de arquitectura hexagonal y servicios de dominio.', 'ACTIVO', 1, false),
('QA Automatizada', 'Cobertura de pruebas end-to-end y regresión automatizada.', 'ACTIVO', 2, false),
('DevOps Pipeline', 'Automatización de build, test y despliegue continuo.', 'ACTIVO', 2, false),
('Analytics BI', 'Paneles de indicadores para productividad y tiempos de entrega.', 'ACTIVO', 2, false),
('Gestor Incidencias', 'Módulo para seguimiento de incidencias internas y externas.', 'ACTIVO', 3, false),
('Integracion ERP', 'Sincronización de usuarios y tareas con sistema ERP.', 'SUSPENDIDO', 3, false),
('Notificaciones Push', 'Servicio de alertas para tareas próximas a vencer.', 'ACTIVO', 3, false),
('Migracion Cloud', 'Migración progresiva de infraestructura a entorno cloud.', 'ACTIVO', 4, false),
('Onboarding Web', 'Flujo de onboarding para nuevos empleados en la plataforma.', 'COMPLETADO', 4, false),
('Seguridad App', 'Hardening de autenticación, permisos y auditoría.', 'ACTIVO', 4, false),
('Soporte Clientes', 'Portal de soporte para clientes y gestión de tickets.', 'ACTIVO', 5, false),
('Optimizacion SQL', 'Optimización de consultas pesadas y tuning de índices.', 'ACTIVO', 5, false);


-- PROYECTO_USUARIO (relación N:M)
INSERT INTO PROYECTO_USUARIO (proyecto_id, usuario_id) VALUES
(1, 1),  -- Carlos→ TimeScope v1
(1, 2),  -- María → TimeScope v1
(1, 3),  -- Juan→ TimeScope v1
(2, 2),  -- María → App Móvil
(2, 4),  -- Laura → App Móvil
(3, 1),  -- Carlos→ Portal Admin
(3, 5),  -- Andrés→ Portal Admin
(4, 3),  -- Juan→ API Gateway
(4, 5),  -- Andrés→ API Gateway
(5, 6),
(6, 6),
(7, 6),
(8, 6),
(9, 6),
(10, 6),
(11, 6),
(12, 6),
(13, 6),
(14, 6),
(15, 6),
(16, 4),
(16, 6);

-- =====================
-- TAREAS
-- =====================
INSERT INTO TAREAS (nombre, descripcion, estado, horas_estimadas, fecha_limite, usuario_id) VALUES
('Diseño BD',   'Diseñar el esquema relacional de la base de datos.',   'COMPLETADO', 4.0, '2026-05-15 18:00:00', 1),
('Modelos JPA', 'Crear las entidades JPA con sus relaciones.','ABIERTO', 5.0, '2026-05-12 18:00:00', 1),
('Endpoints REST','Implementar los controladores REST del módulo usuarios.','ABIERTO', 6.0, '2026-05-10 18:00:00', 2),
('Autenticación JWT', 'Integrar Spring Security con JWT para login y registro.','ACTIVO', 3.0, '2026-05-09 18:00:00', 2),
('UI Login','Diseñar pantallas de inicio de sesión en la app móvil.', 'ACTIVO', 2.5, '2026-05-11 18:00:00', 4),
('Pruebas API', 'Ejecutar pruebas de integración sobre los endpoints.', 'ABIERTO', 4.0, '2026-05-13 18:00:00', 3),
('Documentación', 'Documentar los endpoints con Swagger/OpenAPI.',  'ACTIVO', 3.5, '2026-05-14 18:00:00', 5),
('Maquetar Dashboard', 'Ajustar grid y componentes del dashboard corporativo.', 'ACTIVO', 2.0, '2026-05-08 18:00:00', 6),
('Perfil Usuario UX', 'Mejorar experiencia visual y responsiva del perfil.', 'ABIERTO', 1.5, '2026-05-09 18:00:00', 6),
('Refactor CSS Global', 'Unificar variables, espacios y tipografías en toda la app.', 'ACTIVO', 5.0, '2026-05-16 18:00:00', 6),
('Tabla Usuarios', 'Optimizar tabla de usuarios con estilos consistentes.', 'ABIERTO', 2.5, '2026-05-10 18:00:00', 6),
('Tabla Proyectos', 'Añadir filtros y ordenar columnas de proyectos.', 'ACTIVO', 3.0, '2026-05-11 18:00:00', 6),
('Tabla Tareas', 'Mejorar estados visuales y mensajes vacíos.', 'ACTIVO', 3.5, '2026-05-12 18:00:00', 6),
('Calendario Mensual', 'Corregir navegación y densidad visual del calendario.', 'ACTIVO', 4.0, '2026-05-17 18:00:00', 6),
('Integrar Favicon', 'Incorporar favicon de marca en cabecera principal.', 'ABIERTO', 0.5, '2026-05-08 18:00:00', 6),
('Test Login', 'Validar flujo de autenticación con credenciales inválidas.', 'SUSPENDIDO', 2.0, '2026-05-20 18:00:00', 6),
('Roles Permisos', 'Revisar permisos por rol en endpoints críticos.', 'ACTIVO', 3.0, '2026-05-09 18:00:00', 6),
('Auditoria Seguridad', 'Registrar trazas de acceso y cambios sensibles.', 'ABIERTO', 4.0, '2026-05-15 18:00:00', 6),
('Limpieza Datos', 'Eliminar registros inconsistentes en staging.', 'COMPLETADO', 1.5, '2026-05-07 18:00:00', 6),
('Backups Nocturnos', 'Configurar política de backups nocturnos.', 'ACTIVO', 2.5, '2026-05-18 18:00:00', 6),
('Monitoreo API', 'Activar alertas de latencia y errores HTTP 5xx.', 'ABIERTO', 2.0, '2026-05-14 18:00:00', 6),
('Cobertura Unit Tests', 'Subir cobertura mínima del servicio de tareas.', 'ACTIVO', 5.0, '2026-05-19 18:00:00', 6),
('Soporte Incidencia #214', 'Resolver problema de login en móvil iOS.', 'COMPLETADO', 1.0, '2026-05-06 18:00:00', 6),
('Soporte Incidencia #227', 'Corregir desfase horario en fecha límite.', 'ABIERTO', 1.25, '2026-05-10 18:00:00', 6),
('Reporte Semanal', 'Preparar resumen semanal para dirección.', 'COMPLETADO', 2.0, '2026-05-05 18:00:00', 6),
('Mantenimiento DB', 'Ejecutar mantenimiento preventivo de la base.', 'ACTIVO', 3.0, '2026-05-12 18:00:00', 6),
('Onboarding Junior', 'Acompañar incorporación de nuevo desarrollador.', 'ACTIVO', 4.0, '2026-05-21 18:00:00', 6),
('Review Sprint', 'Revisión y cierre de objetivos del sprint actual.', 'ACTIVO', 2.5, '2026-05-08 18:00:00', 6),
('Roadmap Q3', 'Definir roadmap técnico para el tercer trimestre.', 'ACTIVO', 3.0, '2026-05-22 18:00:00', 6),
('Revisión UX Final', 'Aplicar ajustes visuales de alto impacto.', 'ABIERTO', 2.0, '2026-05-09 18:00:00', 6),
('Microcopy UI', 'Pulir textos de interfaz y estados del sistema.', 'COMPLETADO', 1.5, '2026-05-04 18:00:00', 6),
('Integración Correo', 'Conectar proveedor SMTP para notificaciones.', 'ACTIVO', 3.5, '2026-05-20 18:00:00', 6);

-- ASIGNACIÓN DE TAREAS A PROYECTOS
UPDATE TAREAS SET proyecto_id = 1 WHERE id IN (1, 2, 3);   -- cgarcia/mmartinez → TimeScope v1
UPDATE TAREAS SET proyecto_id = 2 WHERE id IN (4, 5);       -- mmartinez/lfernandez → App Móvil
UPDATE TAREAS SET proyecto_id = 6 WHERE id = 6;             -- jperez → QA Automatizada
UPDATE TAREAS SET proyecto_id = 3 WHERE id = 7;             -- alopez → Portal Admin
UPDATE TAREAS SET proyecto_id = 5 WHERE id IN (8, 9, 10, 11, 12, 25, 28, 30, 31); -- admin → Refactor Backend
UPDATE TAREAS SET proyecto_id = 6 WHERE id IN (13, 14, 15); -- admin → QA Automatizada
UPDATE TAREAS SET proyecto_id = 7 WHERE id IN (16, 29);     -- admin → DevOps Pipeline
UPDATE TAREAS SET proyecto_id = 14 WHERE id IN (17, 18);    -- admin → Seguridad App
UPDATE TAREAS SET proyecto_id = 16 WHERE id IN (19, 20, 26);-- admin → Optimizacion SQL
UPDATE TAREAS SET proyecto_id = 9 WHERE id = 21;            -- admin → Gestor Incidencias
UPDATE TAREAS SET proyecto_id = 8 WHERE id = 22;            -- admin → Analytics BI
UPDATE TAREAS SET proyecto_id = 15 WHERE id IN (23, 24);    -- admin → Soporte Clientes
UPDATE TAREAS SET proyecto_id = 13 WHERE id = 27;           -- admin → Onboarding Web
UPDATE TAREAS SET proyecto_id = 11 WHERE id = 32;           -- admin → Notificaciones Push