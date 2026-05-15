# 📋 Módulo Solicitud - TimeScope

## Descripción General

El módulo **Solicitud** gestiona el proceso de solicitud de adhesión de usuarios a organizaciones en TimeScope. Permite que los usuarios soliciten unirse a una organización, y que los administradores acepten o rechacen estas solicitudes.

---

## 📊 Estructura del Módulo

```
Solicitud/
├── controllers/
│   └── SolicitudRestController.java
├── models/
│   ├── Solicitud.java
│   └── Estado.java
├── dto/
│   ├── SolicitudResponseDto.java
│   └── SolicitudCreatedDto.java
├── services/
│   ├── SolicitudServices.java (Interface)
│   └── SolicitudServicesImpl.java (Implementación)
├── repositories/
│   └── SolicitudRepository.java
├── mappers/
│   └── SolicitudMapper.java
├── exceptions/
│   ├── SolicitudException.java
│   ├── SolicitudNotFound.java
│   ├── SolicitudExist.java
│   ├── EmisorAndReceptorEquals.java
│   └── EmisorOrReceptorNotFound.java
└── SOLICITUD_MODULE.md (Este archivo)
```

---

## 🏗️ Componentes

### 1. **Modelo - Solicitud.java**

Define la entidad JPA que representa una solicitud en la base de datos.

**Atributos:**
- `id` (Long) - Identificador único (Auto-generado)
- `usuario` (Usuario) - Usuario que envía la solicitud (ManyToOne)
- `organizacion` (Organizacion) - Organización a la que se solicita adhesión (ManyToOne)
- `estado` (Estado) - Estado actual de la solicitud (PENDIENTE, ACEPTADA, RECHAZADA)
- `fechaCreacion` (LocalDateTime) - Marca temporal de creación (Timestamp)

**Características:**
- Utiliza Lombok `@Builder`, `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`
- Estado por defecto: **PENDIENTE**
- FechaCreación por defecto: **Timestamp actual**

---

### 2. **Enum - Estado.java**

Define los posibles estados de una solicitud:

```java
public enum Estado {
    PENDIENTE,      // Solicitud en espera de respuesta
    ACEPTADA,       // Solicitud aprobada
    RECHAZADA       // Solicitud denegada
}
```

---

### 3. **DTOs**

#### **SolicitudResponseDto.java**
Objeto de transporte para respuestas al cliente.

**Atributos:**
- `id` (Long) - Identificador de la solicitud
- `usuario` (String) - Nombre de usuario del solicitante
- `organizacion` (String) - Nombre de la organización
- `estado` (Estado) - Estado actual
- `fechaCreacion` (LocalDateTime) - Fecha de creación

#### **SolicitudCreatedDto.java**
(Archivos disponible en la carpeta dto)

---

### 4. **Repository - SolicitudRepository.java**

Proporciona acceso a datos a la base de datos.

**Métodos Personalizados:**

```java
// Obtiene todas las solicitudes pendientes de una organización
List<Solicitud> findByOrganizacionIdAndEstado(Long organizacionId, Estado estado);

// Verifica si existe una solicitud pendiente entre usuario y organización
boolean existsByUsuarioIdAndOrganizacionIdAndEstado(
    Long usuarioId, 
    Long organizacionId, 
    Estado estado
);
```

---

### 5. **Mapper - SolicitudMapper.java**

Convierte entidades `Solicitud` a DTOs.

**Métodos:**

```java
// Convierte una solicitud a DTO
SolicitudResponseDto toResponseDto(Solicitud solicitud);

// Convierte lista de solicitudes a lista de DTOs
List<SolicitudResponseDto> toResponseDtoList(List<Solicitud> solicitudes);
```

---

### 6. **Servicios**

#### **SolicitudServices.java (Interface)**
Define el contrato de operaciones disponibles.

```java
public interface SolicitudServices {
    SolicitudResponseDto enviarSolicitud(String organizacionNombre);
    SolicitudResponseDto aceptarSolicitud(Long id);
    SolicitudResponseDto rechazarSolicitud(Long id);
    void cancelarSolicitud(Long id);
    List<SolicitudResponseDto> solicitudesPendientes(Long organizacionId);
}
```

#### **SolicitudServicesImpl.java (Implementación)**

Implementa la lógica de negocio del módulo.

**Funciones Principales:**

##### 1. **enviarSolicitud(String organizacionNombre)**
- **Descripción:** Un usuario envía una solicitud de adhesión a una organización
- **Proceso:**
  1. Obtiene el usuario autenticado actual
  2. Busca la organización por nombre
  3. Valida que no exista una solicitud PENDIENTE previa
  4. Crea una nueva solicitud con estado PENDIENTE
  5. Envía notificación a la organización
  6. Guarda y retorna la solicitud
- **Excepciones:** `SolicitudExist`, `OrganizacionNotFound`

##### 2. **aceptarSolicitud(Long id)**
- **Descripción:** Administrador acepta una solicitud pendiente
- **Proceso:**
  1. Valida que la solicitud exista y esté PENDIENTE
  2. Cambia estado a ACEPTADA
  3. Asigna la organización al usuario
  4. Envía notificación de aceptación al usuario
  5. Guarda cambios en BD
- **Excepciones:** `SolicitudNotFound`, `SolicitudExist`

##### 3. **rechazarSolicitud(Long id)**
- **Descripción:** Administrador rechaza una solicitud pendiente
- **Proceso:**
  1. Valida que la solicitud exista y esté PENDIENTE
  2. Cambia estado a RECHAZADA
  3. Envía notificación de rechazo al usuario
  4. No modifica la afiliación del usuario
- **Excepciones:** `SolicitudNotFound`, `SolicitudExist`

##### 4. **cancelarSolicitud(Long id)**
- **Descripción:** Usuario cancela su propia solicitud pendiente
- **Proceso:**
  1. Busca la solicitud por ID
  2. Valida che el usuario autenticado es el emisor
  3. Verifica que el estado sea PENDIENTE
  4. Elimina la solicitud de la BD
  5. Log de cancelación
- **Excepciones:** `SolicitudNotFound`, `EmisorOrReceptorNotFound`, `SolicitudExist`

##### 5. **solicitudesPendientes(Long organizacionId)**
- **Descripción:** Obtiene todas las solicitudes pendientes de una organización
- **Retorno:** Lista de DTOs de solicitudes en estado PENDIENTE
- **Uso:** Para mostrar bandeja de solicitudes a administradores

---

### 7. **Controller - SolicitudRestController.java**

Expone los endpoints REST del módulo.

**Ruta Base:** `api/v1/solicitud`

#### **Endpoints:**

| Método | Endpoint | Función | Rol Requerido |
|--------|----------|---------|---------------|
| **POST** | `/enviar/{organizacion}` | Enviar solicitud de adhesión | Usuario autenticado |
| **PUT** | `/{id}/aceptar` | Aceptar solicitud | Administrador/Coordinador |
| **PUT** | `/{id}/rechazar` | Rechazar solicitud | Administrador/Coordinador |
| **DELETE** | `/{id}/cancelar` | Cancelar solicitud | Usuario solicitante |
| **GET** | `/pendientes/{organizacionId}` | Listar solicitudes pendientes | Administrador/Coordinador |

**Manejo de Errores:**
- Exception Handler para `MethodArgumentNotValidException`
- Retorna `ProblemDetail` con detalles de errores de validación

---

### 8. **Excepciones Personalizadas**

Located in `exceptions/` folder:

1. **SolicitudException.java** - Excepción base del módulo
2. **SolicitudNotFound.java** - Solicitud no encontrada (404)
3. **SolicitudExist.java** - Solicitud ya existe o estado inválido
4. **EmisorAndReceptorEquals.java** - Usuario intenta interactuar consigo mismo
5. **EmisorOrReceptorNotFound.java** - Usuario o receptor no autorizado

---

## 🔄 Flujo de Solicitud Típico

```
┌─────────────────────────────────────────────────────────────┐
│                   USUARIO SOLICITA ADHESIÓN                  │
│                                                              │
│ 1. POST /api/v1/solicitud/enviar/{organizacion}            │
│    └─> Usuario autenticado envía solicitud                  │
│                                                              │
│ 2. Backend valida:                                          │
│    ├─> Usuario existe ✓                                     │
│    ├─> Organización existe ✓                                │
│    └─> No hay solicitud pendiente previa ✓                  │
│                                                              │
│ 3. Sistema crea Solicitud(estado=PENDIENTE)                │
│                                                              │
│ 4. Envía notificación a organización:                       │
│    "Juan Pérez ha enviado una solicitud para unirse!"       │
│                                                              │
│ Respuesta: SolicitudResponseDto (201 CREATED)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           ADMINISTRADOR ACEPTA/RECHAZA SOLICITUD             │
│                                                              │
│ ACEPTAR:                                                    │
│ 1. PUT /api/v1/solicitud/{id}/aceptar                       │
│    └─> Admin acepta solicitud pendiente                     │
│                                                              │
│ 2. Sistema:                                                 │
│    ├─> Valida que existe y está PENDIENTE                   │
│    ├─> Cambia estado a ACEPTADA                            │
│    ├─> Asigna organización al usuario                       │
│    └─> Envía notificación: "¡Ha sido aceptado!"            │
│                                                              │
│ RECHAZAR:                                                   │
│ 1. PUT /api/v1/solicitud/{id}/rechazar                      │
│    └─> Admin rechaza solicitud pendiente                    │
│                                                              │
│ 2. Sistema:                                                 │
│    ├─> Valida que existe y está PENDIENTE                   │
│    ├─> Cambia estado a RECHAZADA                           │
│    └─> Envía notificación: "La solicitud fue rechazada"    │
│                                                              │
│ Respuesta: SolicitudResponseDto (200 OK)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              USUARIO CANCELA SU SOLICITUD                    │
│                                                              │
│ 1. DELETE /api/v1/solicitud/{id}/cancelar                   │
│    └─> Usuario cancela su solicitud PENDIENTE               │
│                                                              │
│ 2. Sistema valida:                                          │
│    ├─> Solicitud existe ✓                                   │
│    ├─> Usuario es el solicitante ✓                          │
│    └─> Estado es PENDIENTE ✓                                │
│                                                              │
│ 3. Sistema elimina solicitud de BD                          │
│                                                              │
│ Respuesta: 204 NO CONTENT                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          ADMINISTRADOR VE SOLICITUDES PENDIENTES             │
│                                                              │
│ 1. GET /api/v1/solicitud/pendientes/{organizacionId}        │
│    └─> Obtiene todas las solicitudes PENDIENTES de la org   │
│                                                              │
│ Respuesta: List<SolicitudResponseDto> (200 OK)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad y Validaciones

**Validaciones Implementadas:**

✅ Usuario autenticado requerido para enviar solicitud  
✅ Prevención de solicitudes duplicadas (solo una PENDIENTE por usuario-org)  
✅ Solo el usuario puede cancelar su solicitud  
✅ Solo administradores pueden aceptar/rechazar  
✅ Validación de que solicitud esté PENDIENTE antes de cambiar estado  
✅ Notificaciones en tiempo real sobre cambios de estado  

---

## 📱 Integración con Otros Módulos

**Dependencias:**
- **Usuarios** - Información de usuarios solicitantes
- **Organizaciones** - Información de organizaciones objetivo
- **Notificaciones** - Envío de notificaciones (Sistema basado en Tipo: SOLICITUD_RECIBIDA, SOLICITUD_ACEPTADA, SOLICITUD_RECHAZADA)
- **Auth** (AuthUtils) - Obtener usuario autenticado

---

## 💾 Ejemplo de Base de Datos

```sql
CREATE TABLE SOLICITUD (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    emisor_id BIGINT NOT NULL REFERENCES USUARIO(id),
    organizacion_id BIGINT NOT NULL REFERENCES ORGANIZACION(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pending_request 
        UNIQUE(emisor_id, organizacion_id, estado)
);
```

---

## 🧪 Ejemplo de Uso (HTTP Requests)

```http
### Enviar solicitud
POST http://localhost:8080/api/v1/solicitud/enviar/TechCorp
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

### Respuesta (201 Created)
{
  "id": 1,
  "usuario": "juan.perez",
  "organizacion": "TechCorp",
  "estado": "PENDIENTE",
  "fechaCreacion": "2026-04-29T10:30:00"
}

---

### Aceptar solicitud (Admin)
PUT http://localhost:8080/api/v1/solicitud/1/aceptar
Authorization: Bearer {JWT_TOKEN_ADMIN}
Content-Type: application/json

### Respuesta (200 OK)
{
  "id": 1,
  "usuario": "juan.perez",
  "organizacion": "TechCorp",
  "estado": "ACEPTADA",
  "fechaCreacion": "2026-04-29T10:30:00"
}

---

### Rechazar solicitud (Admin)
PUT http://localhost:8080/api/v1/solicitud/1/rechazar
Authorization: Bearer {JWT_TOKEN_ADMIN}
Content-Type: application/json

### Respuesta (200 OK)
{
  "id": 1,
  "usuario": "juan.perez",
  "organizacion": "TechCorp",
  "estado": "RECHAZADA",
  "fechaCreacion": "2026-04-29T10:30:00"
}

---

### Cancelar solicitud (Usuario)
DELETE http://localhost:8080/api/v1/solicitud/1/cancelar
Authorization: Bearer {JWT_TOKEN}

### Respuesta (204 No Content)

---

### Obtener solicitudes pendientes
GET http://localhost:8080/api/v1/solicitud/pendientes/1
Authorization: Bearer {JWT_TOKEN_ADMIN}

### Respuesta (200 OK)
[
  {
    "id": 2,
    "usuario": "maria.garcia",
    "organizacion": "TechCorp",
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-04-29T11:00:00"
  },
  {
    "id": 3,
    "usuario": "carlos.lopez",
    "organizacion": "TechCorp",
    "estado": "PENDIENTE",
    "fechaCreacion": "2026-04-29T11:15:00"
  }
]
```

---

## 🎯 Resumen de Funcionalidades

| Funcionalidad | Descripción | Endpoint | Método |
|---------------|-------------|----------|--------|
| **Enviar Solicitud** | Usuario solicita adhesión a organización | `/enviar/{organizacion}` | POST |
| **Aceptar Solicitud** | Administrador aprueba solicitud | `/{id}/aceptar` | PUT |
| **Rechazar Solicitud** | Administrador deniega solicitud | `/{id}/rechazar` | PUT |
| **Cancelar Solicitud** | Usuario cancela su solicitud | `/{id}/cancelar` | DELETE |
| **Listar Pendientes** | Obtiene solicitudes pendientes de una org | `/pendientes/{organizacionId}` | GET |

---

## 📌 Notas Importantes

⚠️ **Estado PENDIENTE es el único estado editable** - Una solicitud ACEPTADA o RECHAZADA no puede cambiar de estado  
⚠️ **Una solicitud ACEPTADA asigna automáticamente la organización al usuario**  
⚠️ **Solo se permite una solicitud PENDIENTE por usuario-organización** - Previene spam de solicitudes  
⚠️ **Las notificaciones se integran con el módulo Notificación** - Uso de tipos SOLICITUD_RECIBIDA, _ACEPTADA, _RECHAZADA  

---
