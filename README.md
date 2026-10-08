# Proyecto de Procesos de Ingeniería del Software curso 26-27

Arquitectura base de una aplicación SaaS con gestión de usuarios (Sprint 1).

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
    usecases/                         Un caso de uso por operación
    entities/                         Usuario
    enums/                            EstadoUsuario, RolUsuario, OrigenUsuario, TipoError
    errores/                          ErrorSistema
    autorizacion/                     Autorizacion (comprueba el rol en el servidor)
    validaciones/                     ValidadorEmail, ValidadorClave
    servicios/                        ServicioHash (bcrypt)
    mappers/                          UsuarioMapper (datos públicos del usuario)
  datos/                              Capa de acceso a datos
    cad.js                            Implementación con MongoDB
    cadMemoria.js                     Implementación en memoria (pruebas y desarrollo sin MONGO_URI)
  log/Log.js                          Registro de actividad
  pruebas/                            Pruebas unitarias de la capa lógica (un spec por caso de uso)
cliente/
  index.html                          SPA
  comunicacion/clienteRest.js         Cliente de comunicación con el API REST
  presentacion/                       Capa de presentación del cliente (GUI)
    controlWeb.js                     Coordina los componentes y usa ClienteRest
    componentes/                      Un componente visual por fichero
    utilidades/                       Html (escapado de texto)
```

En el servidor, una petición recorre `Rutas → middleware → handler → Sistema (modelo.js) → caso de uso → cad`. La capa lógica recibe la capa de acceso a datos como dependencia (`new Sistema({ cad: ... })`), así se podrá sustituir la implementación en memoria por una base de datos sin modificar la lógica.

En el cliente, los componentes solo pintan HTML y avisan de los eventos; `controlWeb.js` decide qué mostrar y es el único que llama a `clienteRest.js`, que es el único que hace peticiones AJAX.

### Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/registrarUsuario` | Público | Registro local (`email`, `password`, `nick`) |
| POST | `/iniciarSesion` | Público | Inicio de sesión local (`email`, `password`) |
| GET | `/usuarioSesion` | Público | Usuario de la sesión actual o `null` |
| POST | `/cerrarSesion` | Público | Cierra la sesión |
| GET | `/obtenerUsuarios` | Administrador | Lista de usuarios (email, rol y estado) |
| GET | `/numeroUsuarios` | Administrador | Número de usuarios |
| GET | `/usuarioActivo/:email` | Administrador | Indica si el usuario está activo |
| DELETE | `/eliminarUsuario/:email` | Administrador o el propio usuario | Elimina un usuario |

Las rutas con sesión responden `401` si no hay una sesión válida. Si el usuario de la sesión ha sido eliminado, la sesión se invalida en la siguiente petición. Listar usuarios, contarlos y comprobar si uno está activo responden `403` si quien pide no es administrador. Un usuario normal solo puede eliminar su propia cuenta.

El primer administrador es el email (o la lista separada por comas) de `ADMIN_EMAIL`. Al registrarse o al iniciar sesión recibe el rol `admin`. No hay contraseñas de administrador en el repositorio.

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

## Flujo de trabajo y CI/CD

- Se sigue GitHub Flow: una rama por cambio, pruebas en local y pull request a `main`.
- `.github/workflows/ci.yml` ejecuta `npm test` en cada pull request y en cada push a `main`.
- `.github/workflows/despliegue.yml` despliega en Cloud Run en cada push a `main`. Necesita en GitHub el secreto `GCP_SA_KEY` (clave JSON de una cuenta de servicio con permisos de Cloud Run, Cloud Build y Artifact Registry) y las variables `CLOUD_RUN_SERVICE` y `CLOUD_RUN_REGION`.
