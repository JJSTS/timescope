# TareasServicesImpl

Implementación del servicio `TareasServices` encargado de la gestión de tareas dentro del sistema.

## Dependencias

* `TareasRepository`: acceso a datos de tareas.
* `TareasMapper`: conversión entre entidad y DTO.
* `UsuariosRepository`: acceso a usuarios.
* `ProyectosRepository`: acceso a proyectos (actualmente no utilizado en los métodos mostrados).

## Anotaciones relevantes

* `@Service`: define el servicio como componente de Spring.
* `@RequiredArgsConstructor`: inyección de dependencias por constructor.
* `@Slf4j`: logging.
* `@CacheConfig(cacheNames = {"tareas"})`: configuración base de caché.
* `@Cacheable`: cacheo de resultados en métodos específicos.

---

## Métodos públicos

### findAll(Optional<String> usuario, Optional<String> estado, Pageable pageable)

**Descripción**
Obtiene una lista paginada de tareas aplicando filtros dinámicos.

**Filtros**

* `usuario`: filtra por username del usuario asignado a la tarea.
* `estado`: filtra por estado de la tarea.

**Comportamiento**

* Construye `Specification` dinámicas:

    * `usuario`: realiza join con entidad `Usuario` y filtra por username (case insensitive).
    * `estado`: filtro por coincidencia parcial del estado.
* Si un filtro no está presente, no se aplica.
* Combina ambos filtros con `Specification.allOf`.
* Ejecuta la consulta paginada.
* Convierte resultados a DTO.

**Retorno**

* `Page<TareaResponseDto>`

**Uso recomendado**

* Listados de tareas con filtros dinámicos en interfaces de usuario o APIs.

---

### findByUsuarioId(Long usuarioId, Pageable pageable)

**Descripción**
Obtiene tareas asociadas a un usuario de forma paginada.

**Comportamiento**

* Consulta el repositorio por `usuarioId`.
* Aplica paginación.
* Convierte resultados a DTO.

**Cache**

* `@Cacheable(key = "#id")` (nota: el parámetro no coincide con el método, posible error).

**Retorno**

* `Page<TareaResponseDto>`

**Uso recomendado**

* Consultar tareas de un usuario específico con paginación.

---

### findById(Long id)

**Descripción**
Obtiene una tarea por su ID.

**Comportamiento**

* Busca la tarea en el repositorio.
* Si no existe, devuelve `null`.
* Convierte la entidad a DTO.

**Retorno**

* `TareaResponseDto`

**Uso recomendado**

* Consulta individual de tareas.

**Observación**

* No lanza excepción si no existe la tarea (puede generar problemas en capas superiores).

---

### findByUsuarioId(Long usuarioId)

**Descripción**
Obtiene todas las tareas de un usuario sin paginación.

**Comportamiento**

* Llama directamente al repositorio.
* Devuelve lista de entidades `Tarea`.

**Retorno**

* `List<Tarea>`

**Uso recomendado**

* Operaciones internas donde no se requiere paginación ni DTO.

---
## Problemas detectados

### 1. Inconsistencia en cache

```java
@Cacheable(key = "#id")
```

* El método usa `usuarioId`, no `id`.
* Esto puede generar colisiones o cache incorrecta.

---

### 2. findById devuelve null

```java
tareasRepository.findById(id).orElse(null)
```

* Riesgo de `NullPointerException` en el mapper.
* No hay control de error ni excepción.

---

### 3. Duplicación de método

```java
findByUsuarioId(Long usuarioId, Pageable pageable)
findByUsuarioId(Long usuarioId)
```

* Dos métodos con el mismo nombre pero distinto retorno.
* Puede generar confusión en el servicio.

---

### 4. Filtros poco estrictos

* `estado` usa `like` en lugar de igualdad exacta.
* Puede generar resultados inesperados si `estado` es un enum.

---

## Reutilización

Este servicio es útil para:

* Gestión de tareas por usuario.
* Sistemas de seguimiento de actividades.
* Paneles de control con filtros dinámicos.
