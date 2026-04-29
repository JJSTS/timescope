# SolicitudServicesImpl

Implementación del servicio `SolicitudServices` encargada de la gestión de solicitudes entre usuarios.

## Dependencias

* `SolicitudRepository`: acceso a datos de solicitudes.
* `UsuariosRepository`: acceso a usuarios.
* `SolicitudMapper`: conversión entre entidad y DTO.

## Anotaciones relevantes

* `@Service`: define el servicio en Spring.
* `@RequiredArgsConstructor`: inyección automática de dependencias.
* `@Slf4j`: logging.
* `@CacheConfig(cacheNames = {"solicitud"})`: configuración base de caché.

---

## Métodos públicos

### enviarSolicitud(String username)

**Descripción**
Crea y envía una solicitud a un usuario.

**Comportamiento**

1. Busca el usuario emisor por `username`.
2. Verifica que emisor y receptor no sean el mismo.
3. Comprueba si ya existe una solicitud pendiente entre ambos.
4. Recupera el usuario receptor.
5. Construye una nueva `Solicitud`.
6. La guarda en base de datos.
7. Devuelve el resultado en DTO.

**Retorno**

* `SolicitudResponseDto`

**Uso recomendado**

* Envío de solicitudes entre usuarios (amistad, acceso, etc.).

**Observaciones importantes**

* Hay inconsistencias en la lógica de emisor/receptor.
* Se están reutilizando IDs incorrectamente.
* La validación actual no distingue correctamente entre emisor y receptor.

---

### aceptarSolicitud(Long id, Long receptorId)

**Descripción**
Acepta una solicitud pendiente.

**Comportamiento**

1. Valida la solicitud mediante `validarSolicitud`.
2. Cambia el estado a `ACEPTADA`.
3. Guarda los cambios.
4. Devuelve el DTO.

**Retorno**

* `SolicitudResponseDto`

**Uso recomendado**

* Aceptación de solicitudes por parte del receptor.

---

### rechazarSolicitud(Long id, Long receptorId)

**Descripción**
Rechaza una solicitud pendiente.

**Comportamiento**

1. Valida la solicitud.
2. Cambia el estado a `RECHAZADA`.
3. Guarda los cambios.
4. Devuelve el DTO.

**Retorno**

* `SolicitudResponseDto`

**Uso recomendado**

* Rechazo de solicitudes.

---

### cancelarSolicitud(Long id, Long emisorId)

**Descripción**
Cancela (elimina) una solicitud existente.

**Comportamiento**

1. Busca la solicitud por ID.
2. Valida permisos (aunque con lógica incorrecta, ver observaciones).
3. Elimina la solicitud.
4. Registra la operación.

**Retorno**

* `void`

**Uso recomendado**

* Cancelación de solicitudes por el emisor.

---

### solicitudesPendientes(Long receptorId)

**Descripción**
Obtiene las solicitudes pendientes de un usuario.

**Comportamiento**

* Busca solicitudes con:

    * `receptorId`
    * estado `PENDIENTE`
* Convierte los resultados a DTO.

**Retorno**

* `List<SolicitudResponseDto>`

**Uso recomendado**

* Listar solicitudes pendientes de un usuario.

---

## Método auxiliar

### validarSolicitud(Long id, Long receptorId)

**Descripción**
Valida que una solicitud exista, pertenezca al receptor y esté pendiente.

**Comportamiento**

1. Busca la solicitud por ID.
2. Verifica que el receptor coincide.
3. Verifica que el estado sea `PENDIENTE`.
4. Si alguna condición falla, lanza excepción.

**Retorno**

* `Solicitud`

**Uso recomendado**

* Reutilizar en operaciones que requieren validación previa (aceptar/rechazar).

---

## Problemas detectados

### 1. Lógica incorrecta en enviarSolicitud

* El emisor y receptor se obtienen de forma incorrecta:

    * Se usa el mismo `username` para ambos.
    * Se reutilizan IDs sin sentido (`emisor.getId()` para receptor).
* Variable redundante:

  ```java
  Usuario emisors = ...
  ```

  no se utiliza.

### 2. Validación incorrecta de duplicados

```java
existsByEmisorIdAndReceptorIdAndEstado(emisor.getId(), emisor.getId(), Estado.PENDIENTE)
```

* Se están usando los mismos IDs para emisor y receptor.

### 3. cancelarSolicitud con validación incorrecta

```java
validarSolicitud(emisorId, emisorId);
```

* Parámetros incorrectos:

    * `id` debería ser el ID de la solicitud.
    * Se está usando el ID del usuario.

### 4. Falta validación clara de permisos

* No se distingue correctamente:

    * quién puede aceptar (receptor)
    * quién puede cancelar (emisor)

---

## Reutilización

Este servicio puede reutilizarse para:

* Sistemas de solicitudes (amistad, invitaciones, acceso).
* Flujos de aprobación/rechazo.
* Gestión de relaciones entre usuarios.
