-- =====================
-- USUARIOS
-- =====================
INSERT INTO USUARIOS (nombres, apellidos, username, email, password, tiempo_proyecto, is_deleted) VALUES
('Carlos',   'García López','cgarcia',   'carlos.garcia@timescope.es',   'hashed_pass_1', 120, false),
('María','Martínez Ruiz',   'mmartinez', 'maria.martinez@timescope.es',  'hashed_pass_2', 90,  false),
('Juan', 'Pérez Sánchez',   'jperez','juan.perez@timescope.es','hashed_pass_3', 200, false),
('Laura','Fernández Gil',   'lfernandez', 'laura.fernandez@timescope.es','hashed_pass_4', 60,  false),
('Andrés',   'López Torres','alopez','andres.lopez@timescope.es','hashed_pass_5', 150, false);

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


-- PROYECTOS
INSERT INTO PROYECTOS (nombre, descripcion, estado, is_deleted) VALUES
('TimeScope v1',  'Desarrollo de la primera versión de la plataforma TimeScope.',  'ACTIVO', 1, false),
('App Móvil', 'Aplicación móvil complementaria para la gestión de tareas.','ACTIVO', 1, false),
('Portal Admin',  'Panel de administración interno para supervisores.', 'SUSPENDIDO', 1, false),
('API Gateway',   'Diseño e implementación del gateway central de la API REST.',   'COMPLETADO', 1, false),
('Refactor Backend', 'Limpieza de arquitectura hexagonal y servicios de dominio.', 'ACTIVO', 1, false),
('QA Automatizada', 'Cobertura de pruebas end-to-end y regresión automatizada.', 'ACTIVO', 1, false),
('DevOps Pipeline', 'Automatización de build, test y despliegue continuo.', 'ACTIVO', false),
('Analytics BI', 'Paneles de indicadores para productividad y tiempos de entrega.', 'ACTIVO', 1, false),
('Gestor Incidencias', 'Módulo para seguimiento de incidencias internas y externas.', 'ACTIVO', 1, false),
('Integracion ERP', 'Sincronización de usuarios y tareas con sistema ERP.', 'SUSPENDIDO', 1,false),
('Notificaciones Push', 'Servicio de alertas para tareas próximas a vencer.', 'ACTIVO', 1, false),
('Migracion Cloud', 'Migración progresiva de infraestructura a entorno cloud.', 'ACTIVO', 1, false),
('Onboarding Web', 'Flujo de onboarding para nuevos empleados en la plataforma.', 'COMPLETADO', 1, false),
('Seguridad App', 'Hardening de autenticación, permisos y auditoría.', 'ACTIVO', false),
('Soporte Clientes', 'Portal de soporte para clientes y gestión de tickets.', 'ACTIVO', 1, false),
('Optimizacion SQL', 'Optimización de consultas pesadas y tuning de índices.', 'ACTIVO', 1, false);


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