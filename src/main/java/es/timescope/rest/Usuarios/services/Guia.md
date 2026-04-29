# UsuarioServiceImpl

Implementación del servicio `UsuariosService` encargado de la gestión de usuarios dentro del sistema.

## Dependencias

* `UsuariosRepository`: acceso a datos de usuarios.
* `UsuariosMapper`: conversión entre entidad y DTO.

## Anotaciones relevantes

* `@Service`: define el servicio como componente de Spring.
* `@Slf4j`: logging.
* `@RequiredArgsConstructor`: inyección por constructor.
* `@CacheConfig(cacheNames = {"usuarios"})`: configuración base de caché.
* `@Transactional`: control de transacciones en operaciones de borrado.

---

## Métodos públicos

### findAll(Optional<String> username, Optional<String> email, Optional<Boolean> isDeleted, Pageable pageable)

**Descripción**
Obtiene una lista paginada de usuarios aplicando filtros dinámicos.

**Filtros**

* `username`: búsqueda parcial (case insensitive).
* `email`: búsqueda parcial (case insensitive).
* `isDeleted`: estado lógico del usuario.

**Comportamiento**

* Construye `Specification` dinámicas:

    * username → filtro por coincidencia parcial.
    * email → filtro por coincidencia parcial.
    * isDeleted → filtro por estado lógico.
* Si un filtro no está presente, no se aplica.
* Combina todos los filtros con `Specification.allOf`.
* Ejecuta consulta paginada.
* Convierte resultados a DTO.

**Retorno**

* `Page<UsuarioResponseDto>`

**Uso recomendado**

* Listados de usuarios con filtros combinados en APIs o paneles.

---

### findById(Long id)

**Descripción**
Obtiene información detallada de un usuario.

**Comportamiento**

1. Busca el usuario por ID (lanza excepción si no existe).
2. Obtiene proyectos asociados.
3. Obtiene tareas asociadas.
4. Extrae únicamente los nombres de proyectos y tareas.
5. Construye un DTO enriquecido con información adicional.

**Retorno**

* `UsuarioInfoResponse`

**Cache**

* `@Cacheable(key = "#id")`

**Uso recomendado**

* Perfil de usuario con información ampliada.

---

### save(UsuarioCreateDto usuarioCreateDto)

**Descripción**
Crea un nuevo usuario.

**Comportamiento**

1. Verifica si existe un usuario con mismo username o email.
2. Si existe, lanza excepción.
3. Convierte DTO a entidad.
4. Guarda el usuario.
5. Devuelve DTO.

**Cache**

* `@CachePut(key = "#result.id")`

**Retorno**

* `UsuarioResponseDto`

**Uso recomendado**

* Registro de nuevos usuarios.

---

### update(Long id, UsuarioCreateDto userRequest)

**Descripción**
Actualiza un usuario existente.

**Comportamiento**

1. Verifica existencia del usuario.
2. Comprueba duplicados de username o email.

    * Permite coincidencia si es el mismo usuario.
3. Convierte DTO a entidad con ID.
4. Guarda cambios.
5. Devuelve DTO actualizado.

**Retorno**

* `UsuarioResponseDto`

**Uso recomendado**

* Actualización de datos de usuario.

---

### deleteById(Long id)

**Descripción**
Elimina un usuario (borrado lógico o físico).

**Comportamiento**

1. Busca el usuario.
2. Comprueba si tiene proyectos o tareas asociadas:

    * Si tiene ambos → borrado lógico (`isDeleted = true`).
    * Si no tiene dependencias → borrado físico.
3. Ejecuta la acción correspondiente.

**Retorno**

* `void`

**Uso recomendado**

* Eliminación segura de usuarios con control de dependencias.

---

### findAllActiveUsuarios()

**Descripción**
Obtiene todos los usuarios activos (no eliminados).

**Comportamiento**

* Filtra usuarios con `isDeleted = false`.

**Retorno**

* `List<Usuario>`

**Uso recomendado**

* Selección de usuarios activos para asignaciones o relaciones.

---

### findByUsuarioname(String username)

**Descripción**
Busca un usuario por username.

**Comportamiento**

* Delegación directa al repositorio.

**Retorno**

* `Optional<Usuario>`

**Uso recomendado**

* Autenticación o búsqueda rápida por username.

---

### save(Usuario user)

**Descripción**
Guarda una entidad `Usuario` directamente.

**Comportamiento**

* Persistencia directa sin mapeo.

**Retorno**

* `void`

**Uso recomendado**

* Uso interno del sistema (no recomendado para API pública).

---

## Problemas detectados

### 1. Método redundante save(Usuario)

* Duplica funcionalidad con el método principal de creación.
* Puede generar confusión en el uso del servicio.

---

### 2. findById acoplado a lógica de negocio

* El servicio mezcla:

    * usuario
    * proyectos
    * tareas
* Esto rompe separación de responsabilidades.

---

### 3. deleteById con lógica compleja en servicio

* Decisión de borrado lógico/físico está acoplada al servicio.
* Podría delegarse a una capa de dominio o policy.

---

### 4. Posible inconsistencia en caché

* No hay invalidación explícita en update/delete.

---

## Reutilización

Este servicio es clave para:

* Gestión de usuarios en el sistema.
* Autenticación y perfiles.
* Asignación de tareas y proyectos.
* Administración de estados de usuario.
