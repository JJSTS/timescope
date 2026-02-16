**Funcionalidad:**

Directos de proyecto puede crear proyectos y asignar tareas a los empleados.

Director puede ver el cargos de los empleados y todos los proyectos.

Supervisor puede cambiar las horas activas de los empleados(En casos de que vaya la luz o internet en la empresa)

Usuario(Director de Proyecto, Empleado, Supervisor) --> login;

Usuario puede ver sus proyectos activos, tareas completadas o activos y tiempo total invertido en todos los proyectos(estadísticas)



**Funciones del proyecto:**

La cantidad de personas en el proyecto.

Fecha límite de cada proyecto.

Tareas completadas del proyecto.

Horas totales de cada miembro



**Entidades:**



Usuario(
Id Long,
Nombres String,
Apellidos String,
Email String,
Contraseña String,
Rol (roles: Supervisor, Director, Empleado) ENUM,
(Opcional: Grupos),
TiempoEnProyecto DateTime)



Proyectos(
Id Long,
Nombre String,
descripción String,
estado(Rol: Completado,En producción,Suspendido) ENUM,
Usuarios(List <Usuarios>));



Tareas(
Id Long,
nombre String,
descripción String,
estado(Rol: Completado,Pendiente, Suspendido) ENUM,
fechaCreada DateTime,
CreadoPor(Directo o supervisor quien lo crea) Usuario);





**Posibles ideas:**

Un Empleado puede pertenecer a varios grupos y un grupo puede tener varios empleados(Ejm: Marketing, Finanzas, Desarrollo de Aplicaciones).

Grupos: (Id, Miembros(List), NombreDelGrupo)

Director o supervisor puede ver las horas de cada grupo(Marketing, Finanzas, Desarrollo de Aplicaciones), Nº de empleados de dicho grupo/horas totales = hora

