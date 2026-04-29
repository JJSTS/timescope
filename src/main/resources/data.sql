-- =====================
-- USUARIOS
-- =====================
INSERT INTO USUARIOS (nombres, apellidos, username, email, password, tiempo_proyecto, is_deleted) VALUES
('Carlos',   'García López','cgarcia',   'carlos.garcia@timescope.es',   'hashed_pass_1', 120, false),
('María','Martínez Ruiz',   'mmartinez', 'maria.martinez@timescope.es',  'hashed_pass_2', 90,  false),
('Juan', 'Pérez Sánchez',   'jperez','juan.perez@timescope.es','hashed_pass_3', 200, false),
('Laura','Fernández Gil',   'lfernandez', 'laura.fernandez@timescope.es','hashed_pass_4', 60,  false),
('Andrés',   'López Torres','alopez','andres.lopez@timescope.es','hashed_pass_5', 150, false);

-- =====================
-- USUARIO_ROLES
-- =====================
INSERT INTO USUARIO_ROLES (user_id, roles) VALUES
(1, 'director'),
(2, 'supervisor'),
(3, 'empleado'),
(4, 'empleado'),
(5, 'supervisor');

-- =====================
-- PROYECTOS
-- =====================
INSERT INTO PROYECTOS (nombre, descripcion, estado, organizacion_id, is_deleted) VALUES
('TimeScope v1',  'Desarrollo de la primera versión de la plataforma TimeScope.',  'ACTIVO', 1, false),
('App Móvil', 'Aplicación móvil complementaria para la gestión de tareas.','ACTIVO', 1, false),
('Portal Admin',  'Panel de administración interno para supervisores.', 'SUSPENDIDO', 2, false),
('API Gateway',   'Diseño e implementación del gateway central de la API REST.',   'COMPLETADO', 2, false);

-- =====================
-- PROYECTO_USUARIO (relación N:M)
-- =====================
INSERT INTO PROYECTO_USUARIO (proyecto_id, usuario_id) VALUES
(1, 1),  -- Carlos→ TimeScope v1
(1, 2),  -- María → TimeScope v1
(1, 3),  -- Juan→ TimeScope v1
(2, 2),  -- María → App Móvil
(2, 4),  -- Laura → App Móvil
(3, 1),  -- Carlos→ Portal Admin
(3, 5),  -- Andrés→ Portal Admin
(4, 3),  -- Juan→ API Gateway
(4, 5);  -- Andrés→ API Gateway

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
('Documentación', 'Documentar los endpoints con Swagger/OpenAPI.',  'ACTIVO', 5);