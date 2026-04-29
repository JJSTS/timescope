# ProyectoServicesImpl

Implementación del servicio `ProyectoServices` encargada de la lógica de negocio relacionada con la entidad `Proyecto`.

## Dependencias

* `ProyectosRepository`: acceso a datos de proyectos.
* `UsuariosRepository`: acceso a usuarios.
* `ProyectosMapper`: conversión entre entidades y DTOs.

## Anotaciones relevantes

* `@Service`: define el servicio como componente de Spring.
* `@RequiredArgsConstructor`: inyección de dependencias automática.
* `@Slf4j`: habilita logging.
* `@CacheConfig(cacheNames = {"proyectos"})`: configuración base para caché.

---

## Métodos públicos

### findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable)

**Descripción**
Obtiene una lista paginada de proyectos aplicando filtros dinámicos.

**Filtros**

* `id`: coincidencia exacta.
* `nombre`: búsqueda parcial (no sensible a mayúsculas).
* `isDeleted`: estado lógico de borrado.

**Comportamiento**

* Construye `Specification` dinámicas según los parámetros presentes.
* Si un filtro no está presente, no se aplica.
* Combina todos los filtros con `AND`.
* Ejecuta la consulta paginada.
* Convierte cada resultado a DTO.

**Retorno**

* `Page<ProyectoResponseDto>`

**Uso recomendado**

* Listados con búsqueda avanzada y paginación.

---

### findByEstado(Estado estado, Pageable pageable)

**Descripción**
Obtiene proyectos filtrados por su estado.

**Comportamiento**

* Llama directamente al repositorio (`findByEstado`).
* Registra la operación en logs.

**Retorno**

* `Page<Proyecto>`

**Uso recomendado**

* Consultas específicas por estado del proyecto.

**Nota**

* Devuelve entidad, no DTO (puede generar inconsistencia con otros métodos).

---

### findByUsuarioId(Long usuarioId, Pageable pageable)

**Descripción**
Obtiene proyectos asociados a un usuario.

**Comportamiento**

* Consulta el repositorio por `usuarioId`.
* Convierte los resultados a DTO.

**Retorno**

* `Page<ProyectoResponseDto>`

**Uso recomendado**

* Obtener proyectos en los que participa un usuario.

---

### save(ProyectoCreateDto proyectoCreateDto)

**Descripción**
Crea y guarda un nuevo proyecto.

**Comportamiento**

1. Valida los usuarios asociados mediante `checkUsuarios`.
2. Convierte el DTO a entidad (`Proyecto`) usando el mapper.
3. Guarda el proyecto en base de datos.
4. Convierte el resultado a DTO.

**Retorno**

* `ProyectoResponseDto`

**Uso recomendado**

* Creación de proyectos con usuarios asociados.

---

### deleteById(Long id)

**Descripción**
Elimina un proyecto por ID.

**Comportamiento**

* Verifica si el proyecto existe:

    * Si no existe, lanza `ProyectoNotFoundException`.
* Elimina el proyecto mediante el repositorio.

**Retorno**

* `void`

**Uso recomendado**

* Eliminación segura con validación previa.

---

## Método privado

### checkUsuarios(List<Long> usuariosIds)

**Descripción**
Valida y recupera los usuarios asociados a un proyecto.

**Comportamiento**

* Si la lista es `null`, devuelve una lista vacía.
* Itera sobre los IDs de usuarios:

    * Busca cada usuario.
    * Si no existe o está marcado como eliminado:

        * lanza `ProyectoBadRequestException`.
    * Si es válido, lo añade a la lista.
* Devuelve la lista de usuarios válidos.

**Retorno**

* `List<Usuario>`

**Uso recomendado**

* Validar relaciones antes de crear o actualizar proyectos.

---
## Reutilización

Este servicio puede reutilizarse para:

* Controladores REST de gestión de proyectos.
* Lógica de negocio en otras capas.
* Validación de usuarios en operaciones relacionadas con proyectos.
