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
(2, 'COORDINADOR'),
(3, 'LIDER'),
(4, 'DIRECTOR'),
(5, 'DESARROLLADOR'),
(6, 'COORDINADOR'),
(6, 'LIDER'),
(6, 'DIRECTOR'),
(6, 'DESARROLLADOR');

-- ORGANIZACIONES CON ADMINS
INSERT INTO ORGANIZACION (nombre, admin_id, is_deleted) VALUES
('TechCorpSolutions', 2, false),           -- Admin: María (COORDINADOR)
('InnovatechDigital', 3, false),           -- Admin: Juan (LIDER)
('CloudSystemPro', 4, false),              -- Admin: Laura (DIRECTOR)
('DataDriveAnalytics', 5, false),          -- Admin: Andrés (LIDER)
('WebMasterAgency', 6, false),             -- Admin: admin (DIRECTOR)
('SecureNetSecurity', 6, false),           -- Admin: admin (DIRECTOR)
('StreamFlowStartup', 6, false),           -- Admin: admin (DIRECTOR)
('CoreTechEnterprise', 6, false);          -- Admin: admin (DIRECTOR)

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

-- TAREAS
INSERT INTO TAREAS (nombre, descripcion, estado, usuario_id) VALUES
('Diseño BD',   'Diseñar el esquema relacional de la base de datos.',   'COMPLETADO', 1),
('Modelos JPA', 'Crear las entidades JPA con sus relaciones.','COMPLETADO', 1),
('Endpoints REST','Implementar los controladores REST del módulo usuarios.','ACTIVO', 2),
('Autenticación JWT', 'Integrar Spring Security con JWT para login y registro.','ACTIVO', 2),
('UI Login','Diseñar pantallas de inicio de sesión en la app móvil.', 'ACTIVO', 4),
('Pruebas API', 'Ejecutar pruebas de integración sobre los endpoints.', 'SUSPENDIDO', 3),
('Documentación', 'Documentar los endpoints con Swagger/OpenAPI.',  'ACTIVO', 5),
('Maquetar Dashboard', 'Ajustar grid y componentes del dashboard corporativo.', 'ACTIVO', 6),
('Perfil Usuario UX', 'Mejorar experiencia visual y responsiva del perfil.', 'ACTIVO', 6),
('Refactor CSS Global', 'Unificar variables, espacios y tipografías en toda la app.', 'ACTIVO', 6),
('Tabla Usuarios', 'Optimizar tabla de usuarios con estilos consistentes.', 'COMPLETADO', 6),
('Tabla Proyectos', 'Añadir filtros y ordenar columnas de proyectos.', 'ACTIVO', 6),
('Tabla Tareas', 'Mejorar estados visuales y mensajes vacíos.', 'ACTIVO', 6),
('Calendario Mensual', 'Corregir navegación y densidad visual del calendario.', 'ACTIVO', 6),
('Integrar Favicon', 'Incorporar favicon de marca en cabecera principal.', 'COMPLETADO', 6),
('Test Login', 'Validar flujo de autenticación con credenciales inválidas.', 'SUSPENDIDO', 6),
('Roles Permisos', 'Revisar permisos por rol en endpoints críticos.', 'ACTIVO', 6),
('Auditoria Seguridad', 'Registrar trazas de acceso y cambios sensibles.', 'ACTIVO', 6),
('Limpieza Datos', 'Eliminar registros inconsistentes en staging.', 'COMPLETADO', 6),
('Backups Nocturnos', 'Configurar política de backups nocturnos.', 'ACTIVO', 6),
('Monitoreo API', 'Activar alertas de latencia y errores HTTP 5xx.', 'ACTIVO', 6),
('Cobertura Unit Tests', 'Subir cobertura mínima del servicio de tareas.', 'ACTIVO', 6),
('Soporte Incidencia #214', 'Resolver problema de login en móvil iOS.', 'COMPLETADO', 6),
('Soporte Incidencia #227', 'Corregir desfase horario en fecha límite.', 'ACTIVO', 6),
('Reporte Semanal', 'Preparar resumen semanal para dirección.', 'COMPLETADO', 6),
('Mantenimiento DB', 'Ejecutar mantenimiento preventivo de la base.', 'ACTIVO', 6),
('Onboarding Junior', 'Acompañar incorporación de nuevo desarrollador.', 'ACTIVO', 6),
('Review Sprint', 'Revisión y cierre de objetivos del sprint actual.', 'ACTIVO', 6),
('Roadmap Q3', 'Definir roadmap técnico para el tercer trimestre.', 'ACTIVO', 6),
('Revisión UX Final', 'Aplicar ajustes visuales de alto impacto.', 'ACTIVO', 6),
('Microcopy UI', 'Pulir textos de interfaz y estados del sistema.', 'COMPLETADO', 6),
('Integración Correo', 'Conectar proveedor SMTP para notificaciones.', 'ACTIVO', 6);