# TimeScope — Registro de Cambios

> Formato: `[FECHA] — Descripción breve del cambio y archivos afectados.`

---

### [2026-05-08] — Implementación de roles y permisos

**1. Auto-asignación de DIRECTOR al crear organización**
- `OrganizacionServicesImpl.create()`: el usuario autenticado recibe el rol `DIRECTOR` y se establece como admin de la org.

**2. Endpoint para ceder el puesto de admin**
- Nuevo método `cederAdmin(Long orgId, String username)` en `OrganizacionServices` + impl.
- Nuevo endpoint `PUT /api/v1/organizaciones/{id}/ceder-admin?username=xxx`.

**3. Jerarquía de asignación de roles**
- DIRECTOR → cualquier rol · COORDINADOR → hasta LIDER · LIDER → solo LIDER.
- `UsuariosRestController`: `@PreAuthorize` ampliado para incluir `LIDER`.

**4. Endpoint cambiar estado de proyecto**
- `PATCH /api/v1/proyectos/{id}/estado?estado=ACTIVO`. LIDER solo en sus proyectos.

**5. Visibilidad filtrada de proyectos por rol**
- `findAll()` y `findByEstado()`: LIDER/DESARROLLADOR ven solo sus proyectos (Specifications).

**6. Restricción de edición de tareas para DESARROLLADOR**
- `updateTarea()`: DESARROLLADOR solo edita las suyas.
- `addTarea()`: restringido a DIRECTOR/COORDINADOR/LIDER.

**7. Corrección query ProyectosRepository**
- `findByUsuarioId`: `JOIN Usuario` → `JOIN p.usuarios`.

**8. Seguridad en organizaciones**
- `DELETE /organizaciones/{id}`: añadido `@PreAuthorize("hasRole('DIRECTOR')")`.

---

### [2026-05-08] — Seguridad en GET /usuarios

- `GET /usuarios` requiere DIRECTOR/COORDINADOR/LIDER.
- Nuevo `GET /usuarios/me` (isAuthenticated()) → devuelve el usuario autenticado sin paginación.
- `UserProfile.tsx` actualizado para usar `/usuarios/me`.

---

### [2026-05-08] — Roles por organización (tabla USUARIO_ORG_ROL)

- Nueva entidad `UsuarioOrgRol` + repositorio.
- `JwtService`: sobrecarga `generateToken(UserDetails, Long orgId)` + `extractOrgId()`.
- `JwtAuthenticationFilter`: carga roles de `USUARIO_ORG_ROL` si token lleva `orgId`.
- `AuthUtils`: `callerHasRole()`, `getCallerOrgId()`, `getCallerRoles()`.
- Nuevo endpoint `PATCH /organizaciones/{orgId}/usuarios/{usuarioId}/rol?rol=X`.

---

### [2026-05-08] — Limpieza TaskCalendar.tsx

- Eliminadas variables `taskDate`/`formattedDate` y `<span className="task-date">`.

---

### [2026-05-08/09] — Redistribución fechas límite en data.sql

- Tareas del admin redistribuidas con 2 días de separación.

---

### [2026-05-09] — Fix: calendario de tamaño consistente entre perfiles

- `UserProfile.css`: `1fr` → `minmax(0, 1fr)`.
- `TaskCalendar.css`: eliminado `min-height` conflictivo con `aspect-ratio`.

---

### [2026-05-09] — Modal detalle al clic en tarea del calendario

- Modal con: nombre, estado, descripción, proyecto, horas, fecha límite, creación.
- Borde superior coloreado según estado. Animación `fade-in` + `slide-up`.
- Archivos: `TaskCalendar.tsx`, `TaskCalendar.css`.

---

### [2026-05-09] — Equipo muestra miembros de la organización

- `UsuarioResponseDto`: añadido `organizacionId`.
- Nuevo endpoint `GET /organizaciones/{id}/miembros`.
- `UserProfile.tsx`: usa `user.organizacionId` para cargar el equipo.

---

### [2026-05-09] — SearchBar siempre visible

- Input fijo 260px. Lupa decorativa a la izquierda. Eliminada lógica `isOpen`.

---

### [2026-05-09] — Modal de perfil al clic en miembro del equipo

- Nuevo `GET /usuarios/{id}` (isAuthenticated()) → `UsuarioInfoResponse`.
- Modal: avatar iniciales, nombre, @username, roles, email, proyectos, tareas.

---

### [2026-05-09] — Botones contraseña/perfil movidos al dropdown de sesión

- Eliminados del header de `UserProfile`; añadidos en dropdown del avatar de `Dashboard.tsx`.
- "Cerrar sesión" en rojo (`dropdown-item--danger`).

---

### [2026-05-09] — Nombre de organización en el centro del header

- `Dashboard.tsx`: fetch `/usuarios/me` → org id → nombre. Centrado con `position: absolute`.

---

### [2026-05-09] — Restricción: un usuario solo puede pertenecer a una organización

- `OrganizacionServicesImpl.create()`: lanza 400 si el usuario ya tiene org.
- `SolicitudServicesImpl.enviarSolicitud()`: ídem.

---

### [2026-05-09] — Fix: rol mostrado en frontend tras crear organización

- `UsuarioServiceImpl.getMe()` ahora usa `authUtils.getCallerRoles()` en vez de `usuario.getRoles()`.
- Archivos: `AuthUtils.java`, `UsuariosMapper.java`, `UsuarioServiceImpl.java`.

---

### [2026-05-09] — Login requiere nombre de organización

- `UserSignInRequest`: `Long orgId` → `String orgNombre`.
- `signIn()`: busca org por nombre, verifica membresía, genera JWT con orgId.
- `LoginForm.tsx`: nuevo input "Organización" obligatorio.

---

### [2026-05-09] — Modales de creación Proyectos y Tareas

- `ProyectoCreateModal` (solo DIRECTOR, borde verde) + `TareaCreateModal` (DIRECTOR/COORDINADOR/LIDER, borde naranja).
- Integrados en `ProyectosList` y `TareasList` con botones en el header.

---

### [2026-05-09] — Fix: deserialización Jackson en DTOs con @Builder

- Añadidos `@NoArgsConstructor` + `@AllArgsConstructor` a `ProyectoCreateDto` y `TareaCreateDto`.

---

### [2026-05-09] — Fix: TareasMapper no copiaba horasEstimadas ni fechaLimite

- `toTarea(TareaCreateDto, Proyecto)` corregido para incluir ambos campos.

---

### [2026-05-09] — Coherencia completa de data.sql

- Admins de org corregidos, asignaciones cruzadas eliminadas, ORGANIZACION_DIRECTORES saneado.

---

### [2026-05-10] — Fix: login valida membresía del usuario en la org indicada

- `signIn()`: verifica `user.getOrganizacion().getId() == org.getId()` → 403 si no coincide.

---

### [2026-05-10] — Fix: mensaje claro en contraseña incorrecta

- `signIn()`: captura `BadCredentialsException` → 401 "Usuario o contraseña incorrectos".

---

### [2026-05-10] — TareaCreateModal: desplegable de proyectos

- Nuevo `GET /organizaciones/{id}/proyectos` → lista proyectos de la org.
- `TareaCreateModal` usa select en lugar de input numérico. `TareasList` pasa `organizacionId`.

---

### [2026-05-10] — Asignación de proyectos a tareas en data.sql

- Tareas 33–38 añadidas y asignadas a proyectos 3, 4 y 10.

---

### [2026-05-10] — Fix: addUsuario solo permite usuarios de la misma organización

- Validación usa `authUtils.getCallerOrgId()`. `save()` asigna `caller.getOrganizacion()` al nuevo proyecto.

---

### [2026-05-10] — ProyectoDetail: información completa y añadir miembro

- Tabs: Información · Equipo (asignar rol) · Tareas.
- Tareas cargadas con `GET /tareas/proyecto/{id}` (lazy). Skeleton animado.
- CSS con prefijo `pd-` para evitar colisiones.

---

### [2026-05-10] — Modal detalle al clic en card de ProyectosList

- `ProyectoDetailModal`: badge estado, nombre, ID, descripción, líder, métricas.
- Sin fetch adicional — usa datos ya cargados en la lista.
- Archivos creados: `ProyectoDetailModal.tsx`, `ProyectoDetailModal.css`.
