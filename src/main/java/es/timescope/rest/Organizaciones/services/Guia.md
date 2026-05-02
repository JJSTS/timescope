# OrganizacionServicesImpl

Implementación del servicio `OrganizacionServices` encargada de la lógica de negocio relacionada con la entidad `Organizacion`.

## Dependencias

* `OrganizacionesRepository`: acceso a datos de organizaciones.
* `ProyectosRepository`: acceso a proyectos.
* `UsuariosRepository`: acceso a usuarios.
* `OrganizacionesMapper`: conversión entre entidades y DTOs.

---

## Método privado

### getEntity(Long id)

**Descripción**
Obtiene una entidad `Organizacion` a partir de su ID.

**Comportamiento**

* Busca la organización en el repositorio.
* Si no existe, lanza `OrganizacionNotFoundException`.

**Retorno**

* `Organizacion`

**Uso recomendado**

* Centralizar la validación de existencia de organizaciones.
* Reutilizar en cualquier método que necesite una entidad válida.

---

## Métodos públicos

### findAll(Optional<Long> id, Optional<String> nombre, Optional<Boolean> isDeleted, Pageable pageable)

**Descripción**
Obtiene una lista paginada de organizaciones aplicando filtros dinámicos.

**Filtros**

* `id`: coincidencia exacta.
* `nombre`: búsqueda parcial (no sensible a mayúsculas).
* `isDeleted`: estado lógico de borrado.

**Comportamiento**

* Construye `Specification` dinámicas según los parámetros presentes.
* Si un filtro no está presente, se ignora.
* Combina los filtros con operador AND.
* Convierte los resultados a DTO.

**Retorno**

* `Page<OrganizacionResponseDto>`

**Uso recomendado**

* Listados con búsqueda avanzada.
* Integración directa en endpoints con paginación.

---

### create(OrganizacionCreateDto dto)

**Descripción**
Crea una nueva organización.

**Comportamiento**

* Instancia una nueva entidad `Organizacion`.
* Asigna el nombre desde el DTO.
* Si `empresaMatrizId` está presente:

    * Recupera la organización matriz.
    * Establece la relación.
* Guarda la entidad.
* Convierte a DTO.

**Retorno**

* `OrganizacionResponseDto`

**Uso recomendado**

* Creación de organizaciones.
* Soporte para estructuras jerárquicas.

---

### delete(Long id)

**Descripción**
Elimina una organización por ID.

**Comportamiento**

* Ejecuta `repository.deleteById(id)`.

**Consideraciones**

* No valida si la organización existe previamente.

**Uso recomendado**

* Usar junto con validación previa si se requiere control de errores.

---

### getFiliales(Long id)

**Descripción**
Obtiene las organizaciones filiales de una organización.

**Comportamiento**

* Recupera la organización principal.
* Obtiene la lista de filiales.
* Convierte cada filial a DTO.

**Retorno**

* `List<OrganizacionResponseDto>`

**Uso recomendado**

* Navegación jerárquica descendente.

---

### getEmpresaMatriz(Long id)

**Descripción**
Obtiene la empresa matriz de una organización.

**Comportamiento**

* Recupera la organización.
* Obtiene su empresa matriz.
* Si existe, la convierte a DTO.
* Si no existe, devuelve `null`.

**Retorno**

* `OrganizacionResponseDto` o `null`

**Uso recomendado**

* Navegación jerárquica ascendente.

---

### addProyecto(Long orgId, Long proyectoId)

**Descripción**
Asocia un proyecto a una organización.

**Comportamiento**

* Recupera la organización.
* Recupera el proyecto.
* Establece relación bidireccional:

    * `proyecto.setOrganizacion(org)`
    * añade el proyecto a la lista de la organización.
* Guarda la organización.
* Convierte a DTO.

**Retorno**

* `OrganizacionResponseDto`

**Consideraciones**

* No valida duplicados.

**Uso recomendado**

* Asignación de proyectos desde lógica de negocio.

---

### addUsuario(Long orgId, Long usuarioId)

**Descripción**
Asocia un usuario a una organización.

**Comportamiento**

* Recupera la organización.
* Recupera el usuario.
* Establece relación bidireccional:

    * `usuario.setOrganizacion(org)`
    * añade el usuario a la lista de la organización.
* Guarda la organización.
* Convierte a DTO.

**Retorno**

* `OrganizacionResponseDto`

**Consideraciones**

* No valida duplicados.

**Uso recomendado**

* Asignación de usuarios a organizaciones.