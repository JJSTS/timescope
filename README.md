# TimeScope

Aplicación web de gestión de proyectos y tareas orientada a equipos empresariales con soporte multi-organización, roles jerárquicos y notificaciones en tiempo real.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Java (JDK) | **21** |
| Maven | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |

> El backend usa Spring Boot 4.0.1, que requiere **Java 21** obligatoriamente.

---

## Arrancar en local

### 1. Backend (Spring Boot)

```bash
# Desde la raíz del proyecto
./mvnw spring-boot:run
```

O con Maven instalado en el sistema:

```bash
mvn spring-boot:run
```

El servidor arranca en `http://localhost:8080`.  
En desarrollo usa una base de datos **H2 en memoria** — no hace falta instalar nada más.  
La consola H2 está disponible en `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:timescope`, usuario: `sa`, sin contraseña).

### 2. Frontend (React)

```bash
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Arrancar servidor de desarrollo
npm start
```

La aplicación abre en `http://localhost:3000`.  
Las peticiones al backend se redirigen automáticamente a `localhost:8080` gracias al proxy configurado en `package.json`.

### Usuarios de prueba (datos precargados)

| Username | Contraseña | Rol | Organización |
|---|---|---|---|
| `admin` | `admin123` | DIRECTOR | TechCorpSolutions |
| `mmartinez` | `MartinezMartinez` | LIDER | TechCorpSolutions |
| `cgarcia` | `UsuarioGarcia` | DESARROLLADOR | TechCorpSolutions |
| `jperez` | `JuanElDestructorDeMundos` | LIDER | InnovatechDigital |
| `lfernandez` | `DragonVampirico2090@@@@` | DIRECTOR | CloudSystemPro |

---

## Scripts disponibles (frontend)

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilar para producción (genera `/build`) |
| `npm test` | Ejecutar tests |

---

## Variables de entorno

### Backend

Crea un archivo `src/main/resources/application-prod.properties` o define estas variables en el entorno:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto `8080`) |
| `JDBC_URL` | URL de conexión PostgreSQL en formato `jdbc:postgresql://host:5432/db` |
| `DB_USERNAME` | Usuario de base de datos |
| `DB_PASSWORD` | Contraseña de base de datos |
| `JWT_SECRET` | Clave para firmar los tokens JWT (cadena larga y aleatoria) |
| `MAIL_USERNAME` | Usuario SMTP de tu proveedor de correo |
| `MAIL_PASSWORD` | Contraseña SMTP |
| `MAIL_FROM` | Dirección remitente (ej: `info@timescope.org`) |
| `URL` | URL del frontend (para emails y CORS) |

### Frontend

Crea un archivo `frontend/.env.production`:

```env
REACT_APP_API_URL=https://tu-backend.up.railway.app/api/v1
REACT_APP_WS_URL=https://tu-backend.up.railway.app
```

> Las variables `REACT_APP_*` se inyectan en **tiempo de build**, no en runtime. Deben estar definidas antes de ejecutar `npm run build`.

---

## Despliegue en producción

La aplicación está desplegada con **Railway** (backend + PostgreSQL) y **Vercel** (frontend).

### Orden de pasos (importante)

El orden es crítico porque el frontend necesita la URL del backend y el backend necesita la URL del frontend para CORS.

```
1. Desplegar backend en Railway
2. Copiar la URL pública de Railway
3. Configurar variables de entorno en Vercel con esa URL
4. Desplegar frontend en Vercel
5. Copiar la URL de producción de Vercel
6. Actualizar CORS_ORIGINS en Railway con la URL de Vercel
7. Redesplegar Railway
```

---

### Backend — Railway

#### Configuración del repositorio

Railway detecta automáticamente el proyecto Maven. Para forzar Java 21, crea el archivo `nixpacks.toml` en la raíz:

```toml
[phases.setup]
nixPkgs = ["jdk21"]
```

#### Variables de entorno en Railway

| Variable | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JDBC_URL` | `jdbc:postgresql://viaduct.proxy.rlwy.net:PORT/railway?user=postgres&password=XXX` |
| `JWT_SECRET` | Cadena aleatoria larga |
| `MAIL_USERNAME` | Usuario Mailtrap |
| `MAIL_PASSWORD` | Contraseña Mailtrap |
| `CORS_ORIGINS` | URL exacta de Vercel (ej: `https://timescope.vercel.app`) |

> La URL de la base de datos de Railway tiene formato `postgresql://...`. Para JDBC debe ser `jdbc:postgresql://...`. Usa la URL pública (`viaduct.proxy.rlwy.net`), no la interna (`postgres.railway.internal`).

> Si el proyecto no tiene Spring Actuator, elimina cualquier bloque `healthcheck` de `railway.json`; de lo contrario Railway marcará el deploy como fallido aunque el servidor esté corriendo.

---

### Frontend — Vercel

1. Importar el repositorio en Vercel.
2. Establecer **Root Directory** a `frontend`.
3. Añadir las variables de entorno antes del primer deploy:

| Variable | Valor |
|---|---|
| `REACT_APP_API_URL` | `https://tu-app.up.railway.app/api/v1` |
| `REACT_APP_WS_URL` | `https://tu-app.up.railway.app` |

4. Desplegar. Vercel ejecuta `npm run build` automáticamente.

> Vercel usa la URL de dominio fija en **Settings → Domains** para producción. Los preview deploys generan URLs con hash que cambian en cada push — usa siempre el dominio fijo para configurar CORS en Railway.

> Todos los usos de variables de entorno en el código deben usar backticks:
> `` `${process.env.REACT_APP_API_URL}/ruta` ``  
> Si están entre comillas simples o dobles, ESLint lanza `no-template-curly-in-string` y el build falla.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | Spring Boot | 4.0.1 |
| Lenguaje | Java | 21 |
| Persistencia | Spring Data JPA + Hibernate | — |
| Seguridad | Spring Security + JWT (Auth0) | 6.x + 4.5.0 |
| WebSocket | Spring WebSocket + STOMP | — |
| BD desarrollo | H2 (en memoria) | — |
| BD producción | PostgreSQL | — |
| Email | Mailtrap (SMTP sandbox) | — |
| Frontend | React + TypeScript | 18.2 + 4.9 |
| Routing | React Router | 6.10 |
| HTTP client | Axios | 1.3.4 |
| WebSocket client | SockJS + STOMP.js | 1.6.1 + 7.3.0 |
