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
('Andrés','López Torres','alopez','andres.lopez@timescope.es','$2a$10$e4kQAPpvlFxInkd2ZIpbX.h49bqvsiXoJGXJnpA5dCoGI7X7sbgO2', false);

-- USUARIO_ROLES
INSERT INTO USUARIO_ROLES (user_id, roles) VALUES
(1, 'DESARROLLADOR'),
(2, 'COORDINADOR'),
(3, 'LIDER'),
(4, 'DIRECTOR');

-- PROYECTOS
INSERT INTO PROYECTOS (nombre, descripcion, estado, is_deleted) VALUES
('TimeScope v1',  'Desarrollo de la primera versión de la plataforma TimeScope.',  'ACTIVO', false),
('App Móvil', 'Aplicación móvil complementaria para la gestión de tareas.','ACTIVO', false),
('Portal Admin',  'Panel de administración interno para supervisores.', 'SUSPENDIDO', false),
('API Gateway',   'Diseño e implementación del gateway central de la API REST.',   'COMPLETADO', false);

-- PROYECTO_USUARIO
INSERT INTO PROYECTO_USUARIO (proyecto_id, usuario_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 2),
(2, 4),
(3, 1),
(3, 5),
(4, 3),
(4, 5);

-- TAREAS
INSERT INTO TAREAS (nombre, descripcion, estado, usuario_id) VALUES
('Diseño BD',   'Diseñar el esquema relacional de la base de datos.',   'COMPLETADO', 1),
('Modelos JPA', 'Crear las entidades JPA con sus relaciones.','COMPLETADO', 1),
('Endpoints REST','Implementar los controladores REST del módulo usuarios.','ACTIVO', 2),
('Autenticación JWT', 'Integrar Spring Security con JWT para login y registro.','ACTIVO', 2),
('UI Login','Diseñar pantallas de inicio de sesión en la app móvil.', 'ACTIVO', 4),
('Pruebas API', 'Ejecutar pruebas de integración sobre los endpoints.', 'SUSPENDIDO', 3),
('Documentación', 'Documentar los endpoints con Swagger/OpenAPI.',  'ACTIVO', 5);