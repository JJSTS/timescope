# Roles y permisos de la organización



## Al crearse la organización

Cuando se crea una organización nueva:

- El usuario que la crea pasa a ser automáticamente el **ADMIN**.
- A este usuario se le asigna el rol de **DIRECTOR**.

### Sobre el ADMIN

- El rol de ADMIN **no puede ser modificado ni eliminado por otros usuarios**.
- El ADMIN sí puede **ceder su puesto de ADMIN a otro usuario** cuando lo necesite.
- Si se cede el puesto, el antiguo ADMIN mantiene su rol de **DIRECTOR** (o el que se le asigne después de forma manual) pero pierde el puesto de admin.

---

## DIRECTOR

Es el rol con más permisos dentro de la organización.

### Puede:

- Crear y gestionar usuarios.
- Ver todos los usuarios de la organización.
- Ver todos los proyectos.
- Crear, editar y eliminar la organización.
- Crear proyectos.
- Cambiar el estado de cualquier proyecto.
- Crear y gestionar tareas.
- Asignar roles a usuarios (excepto modificar el ADMIN).

---

## COORDINADOR

Rol intermedio con funciones de gestión.

### Puede:

- Crear proyectos.
- Cambiar el estado de proyectos.
- Asignar usuarios a proyectos.
- Crear y gestionar tareas.
- Cambiar el estado de tareas.
- Ver usuarios de la organización.
- Ver todos los proyectos.
- Asignar roles a usuarios, pero **sin poder llegar a DIRECTOR**.

---

## LÍDER

Se encarga de proyectos concretos.

### Puede:

- Solo tiene acceso a los proyectos en los que está asignado.
- Asignar usuarios a sus proyectos.
- Modificar proyectos donde participa.
- Crear y editar tareas dentro de esos proyectos.

---

## DESARROLLADOR

Rol más enfocado al trabajo en tareas.

### Puede:

- Crear tareas dentro de los proyectos asignados.
- Editar sus tareas.
- Cambiar el estado de sus tareas.
- Solo tiene acceso a los proyectos en los que participa.

---

### Nota
Cada ROL tiene menos permisos que el anterior, siguiendo una jerarquia estricata y nunca pueden asignar un rol superior al suyo a otro usuario, pero si el mismo, si considerais adecuado que LIDER pueda asignar a otros lideres de proyecto esta bien.