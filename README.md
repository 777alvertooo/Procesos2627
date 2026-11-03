# Proyecto de Procesos de Ingeniería del Software curso 26-27

Arquitectura base de una aplicación SaaS con gestión de usuarios (Sprint 1) y, en el Sprint 2, cartelera de películas y series, lista de pendientes, valoraciones, top semanal y el juego Match.

- Aplicación desplegada: (https://procesos2627-git-902626220875.europe-west1.run.app)

## Tecnologías

| Tecnología | Justificación |
|---|---|
| Node.js + npm | Permite usar JavaScript tanto en el cliente como en el servidor y gestionar dependencias de forma sencilla. |
| Express | Framework HTTP minimalista con el que se define el API REST con un Router y un handler por endpoint. |
| express-session + connect-mongo | Gestiona la sesión con una cookie `httpOnly` y la guarda en MongoDB, así se mantiene entre recargas y reinicios. |
| MongoDB (driver oficial) | Base de datos documental. En local y en Cloud Run se usa Atlas; la cadena de conexión va en variables de entorno. |
| dotenv | Carga las variables de entorno desde `.env` en local, sin secretos en el código. |
| bcryptjs | Hash de contraseñas con bcrypt en JavaScript puro, sin compilar módulos nativos en el despliegue. |
| nodemailer | Envía el email de confirmación de cuenta por SMTP (Brevo u otro proveedor). |
| jQuery | Simplifica la manipulación del DOM y las peticiones AJAX del cliente. |
| Bootstrap 4 + Popper.js | Diseño responsive mobile-first y componentes (alertas, modal) sin escribir CSS propio. |
| Jasmine (jasmine-node) | Framework de pruebas unitarias que se ejecuta en el servidor con un script de npm. |
| GitHub Actions | CI que ejecuta las pruebas en cada pull request y en cada cambio en `main`. |
| Google Cloud Run | Despliegue del servicio con capa gratuita y URL pública. |

## Arquitectura

```
index.js                              Punto de entrada: crea Express y une las tres capas
servidor/
  presentacion/                       Capa de presentación (API REST)
    Rutas.js                          Router con los endpoints públicos y protegidos
    RespuestaHttp.js                  Convierte los resultados en respuestas HTTP
    GestorSesion.js                   Abrir, cerrar y consultar la sesión
    middlewares/                      SesionMiddleware, HaIniciadoSesion
    handlers/                         Un handler por endpoint
  logica/                             Capa lógica
    modelo.js                         Sistema: punto de entrada de la capa lógica
    usecases/                         Un caso de uso por operación (usuarios, catálogo, TopSemanal, SesionMatch)
    entities/                         Usuario
    enums/                            EstadoUsuario, RolUsuario, OrigenUsuario, TipoError
    errores/                          ErrorSistema
    autorizacion/                     Autorizacion, exigirSesion
    validaciones/                     ValidadorEmail, ValidadorClave
    servicios/                        ServicioHash, ServicioCorreo, ServicioToken, ClienteGoogle, DatosPelicula, Identificador
    mappers/                          UsuarioMapper, PeliculaMapper
  datos/                              Capa de acceso a datos
    cad.js                            Implementación con MongoDB
    cadMemoria.js                     Implementación en memoria (pruebas y desarrollo sin MONGO_URI)
    catalogoPeliculas.js              Películas de arranque
    catalogoSeries.js                 Series de arranque
    catalogoAmpliacion.js             Ampliación del catálogo (películas y series)
  log/Log.js                          Registro de actividad
  pruebas/                            Pruebas unitarias de la capa lógica (un spec por caso de uso)
cliente/
  index.html                          SPA
  comunicacion/clienteRest.js         Cliente de comunicación con el API REST
  presentacion/                       Capa de presentación del cliente (GUI)
    controlWeb.js                     Coordina los componentes y usa ClienteRest
    componentes/                      Acceso, inicio, catálogo, ficha, pendientes, cuenta y Match
    utilidades/                       Html (escapado de texto)
```

En el servidor, una petición recorre `Rutas → middleware → handler → Sistema (modelo.js) → caso de uso → cad`. La capa lógica recibe la capa de acceso a datos como dependencia (`new Sistema({ cad: ... })`), así se podrá sustituir la implementación en memoria por una base de datos sin modificar la lógica.

En el cliente, los componentes solo pintan HTML y avisan de los eventos; `controlWeb.js` decide qué mostrar y es el único que llama a `clienteRest.js`, que es el único que hace peticiones AJAX.

### Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/registrarUsuario` | Público | Registro local (`email`, `password`, `nick`); deja la cuenta pendiente hasta confirmar el email |
| GET | `/confirmarUsuario/:token` | Público | Activa la cuenta con el enlace del email |
| POST | `/iniciarSesion` | Público | Inicio de sesión local (`email`, `password`); rechaza pendientes y eliminados |
| GET | `/auth/google` | Público | Redirige a Google OAuth |
| GET | `/auth/google/callback` | Público | Callback de Google; crea o activa la sesión |
| POST | `/solicitarRestablecerClave` | Público | Envía un email con enlace para nueva contraseña (`email`) |
| POST | `/restablecerClave` | Público | Cambia la contraseña con el token del email |
| GET | `/usuarioSesion` | Público | Usuario de la sesión actual o `null` |
| POST | `/cerrarSesion` | Público | Cierra la sesión |
| GET | `/obtenerUsuarios` | Administrador | Lista de usuarios (email, rol y estado) |
| GET | `/numeroUsuarios` | Administrador | Número de usuarios |
| GET | `/usuarioActivo/:email` | Administrador | Indica si el usuario está activo |
| DELETE | `/eliminarUsuario/:email` | Administrador o el propio usuario | Elimina un usuario |
| PUT | `/actualizarPerfil` | Usuario autenticado | Actualiza nick y, opcionalmente, la contraseña |
| PUT | `/actualizarUsuario/:email` | Administrador | Edita nick y email (y opcionalmente contraseña) de un usuario no admin |
| GET | `/obtenerPeliculas` | Usuario autenticado | Catálogo de películas y series, pendientes aún no comentados e ids ya puntuados |
| GET | `/obtenerTopSemanal` | Usuario autenticado | Top 5 de películas y top 5 de series de los últimos 7 días |
| GET | `/obtenerPelicula/:id` | Usuario autenticado | Ficha con sinopsis, tráiler, nota media sobre 5, número de comentarios y el formulario si aún no ha puntuado |
| GET | `/obtenerPendientes` | Usuario autenticado | Lista de títulos pendientes de ver |
| POST | `/anadirPendiente` | Usuario autenticado | Añade un título a pendientes (`peliculaId`); no admite uno ya comentado |
| DELETE | `/quitarPendiente/:id` | Usuario autenticado | Quita un título de pendientes |
| POST | `/valorarPelicula` | Usuario autenticado | Puntuación de 1 a 5 y comentario; se puede repetir |
| POST | `/responderComentario` | Usuario autenticado | Respuesta a un comentario; exige haber puntuado ese título |
| POST | `/reaccionarComentario` | Usuario autenticado | Like o dislike; el mismo tipo otra vez lo retira. Exige haber puntuado |
| POST | `/crearPelicula` | Administrador | Crea una película (cine o plataforma) o una serie |
| PUT | `/actualizarPelicula/:id` | Administrador | Edita título, sinopsis, cartel, tráiler y dónde verla |
| DELETE | `/eliminarPelicula/:id` | Administrador | Borra el título y sus pendientes, puntuaciones y respuestas |
| POST | `/crearSesionMatch` | Usuario autenticado | Crea una sala de Match y devuelve el código |
| POST | `/unirseSesionMatch` | Usuario autenticado | Entra en una sala con el código |
| GET | `/obtenerSesionMatch/:codigo` | Usuario autenticado | Estado de la sala para quien participa |
| POST | `/elegirMatch` | Usuario autenticado | Elige uno de los dos títulos de la ronda |
| POST | `/reiniciarSesionMatch` | Usuario autenticado | Vuelve a empezar la partida |
| POST | `/cerrarSesionMatch` | Usuario autenticado | Cierra la sala |

Las rutas con sesión responden `401` si no hay una sesión válida. Si el usuario de la sesión ha sido eliminado, la sesión se invalida en la siguiente petición. Listar usuarios, contarlos, comprobar si uno está activo y crear, editar o borrar títulos responden `403` si quien pide no es administrador. Un usuario normal solo puede eliminar su propia cuenta.

El primer administrador es el email (o la lista separada por comas) de `ADMIN_EMAIL`. Al registrarse o al iniciar sesión recibe el rol `admin`. No hay contraseñas de administrador en el repositorio.

## Catálogo, inicio y Match

Tras iniciar sesión se abre Inicio. Muestra el top 5 de películas y el top 5 de series de los últimos 7 días: primero por nota media, luego por número de votos y, si no hay suficientes valoraciones en la semana, completa hasta cinco con el resto del catálogo. Películas y Series comparten búsqueda; en Películas hay filtros Todas, En cines y En plataforma. El botón con el nombre abre la cuenta (el administrador ve la gestión de usuarios y el resto su perfil). Cerrar sesión está en esa pantalla.

El catálogo de arranque tiene 180 películas (30 en cines y 150 en plataforma) y 150 series, repartidas entre Netflix, Prime Video, Disney+, Max y Filmin. Pendientes, ficha, puntuación, respuestas y reacciones valen igual para películas y series. Like, dislike y respuesta piden haber puntuado ese título.

En Match, quien crea la sala elige película o serie. Si es película, elige cine o plataforma; en cine no se pide nada más y en plataforma se elige una (o «da igual»). En series se elige la plataforma directamente. Hacen falta al menos dos títulos con ese filtro. La sala devuelve un código de 6 caracteres para que entre la otra persona. Cada ronda muestra dos títulos y los dos tienen que elegir. Hay 10 rondas; si coinciden, se muestra el título elegido. Crear una sala cierra las otras salas abiertas de esa persona.

## Ejecutar en local

```bash
npm install
npm start
```

La aplicación queda en `http://localhost:3000`.

## Pruebas

```bash
npm test          # Linux, macOS y CI
npm run testW     # Windows (PowerShell / cmd)
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (opcional, por defecto 3000; Cloud Run lo define solo) |
| `NODE_ENV` | `production` en el despliegue (la cookie de sesión solo viaja por HTTPS) |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión (si falta se genera uno aleatorio al arrancar) |
| `MONGO_URI` | Cadena de conexión de MongoDB |
| `MONGO_DB` | Nombre de la base de datos |
| `ADMIN_EMAIL` | Email (o lista separada por comas) con rol de administrador |
| `LOG_FICHERO` | Ruta opcional del fichero de log (por defecto `logs/actividad.log`) |
| `URL_BASE` | URL pública sin barra final (local o Cloud Run); se usa en el email y en el callback de Google |
| `GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google |
| `GOOGLE_CLIENT_SECRET` | Secreto del cliente OAuth de Google |
| `SMTP_HOST` | Servidor SMTP (p. ej. `smtp-relay.brevo.com`) |
| `SMTP_PORT` | Puerto SMTP (p. ej. `587`) |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Clave SMTP |
| `EMAIL_FROM` | Remitente de los emails de confirmación |

## Flujo de trabajo y CI/CD

- Se sigue GitHub Flow: una rama por cambio, pruebas en local y pull request a `main`.
- `.github/workflows/ci.yml` ejecuta `npm test` en cada pull request y en cada push a `main`.
- `.github/workflows/despliegue.yml` despliega en Cloud Run en cada push a `main`. Necesita en GitHub el secreto `GCP_SA_KEY` (clave JSON de una cuenta de servicio con permisos de Cloud Run, Cloud Build y Artifact Registry) y las variables `CLOUD_RUN_SERVICE` y `CLOUD_RUN_REGION`.
