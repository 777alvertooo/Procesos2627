# Proyecto de Procesos de Ingeniería del Software curso 26-27

Arquitectura base de una aplicación SaaS con gestión de usuarios (Sprint 1).

- Aplicación desplegada: _pendiente de añadir la URL pública de Cloud Run_

## Tecnologías

| Tecnología | Justificación |
|---|---|
| Node.js + npm | Permite usar JavaScript tanto en el cliente como en el servidor y gestionar dependencias de forma sencilla. |
| Express | Framework HTTP minimalista con el que se define el API REST en un único archivo. |
| Bootstrap 4 | Diseño responsive mobile-first sin escribir CSS propio. |
| Jasmine (jasmine-node) | Framework de pruebas unitarias que se ejecuta en el servidor con un script de npm. |
| GitHub Actions | CI que ejecuta las pruebas en cada pull request y en cada cambio en `main`. |
| Google Cloud Run | Despliegue del servicio con capa gratuita y URL pública. |

## Arquitectura

```
index.js                              Punto de entrada: crea Express y une las tres capas
servidor/
  presentacion/                       Capa de presentación (API REST)
    Rutas.js                          Router con los endpoints
    RespuestaHttp.js                  Convierte los resultados en respuestas HTTP
    handlers/                         Un handler por endpoint
  logica/                             Capa lógica
    modelo.js                         Sistema: punto de entrada de la capa lógica
    usecases/                         Un caso de uso por operación
    entities/                         Usuario
    enums/                            EstadoUsuario, TipoError
    errores/                          ErrorSistema
    validaciones/                     ValidadorEmail
    mappers/                          UsuarioMapper (datos públicos del usuario)
  datos/                              Capa de acceso a datos
    cadMemoria.js                     Implementación en memoria
  pruebas/                            Pruebas unitarias de la capa lógica (un spec por caso de uso)
cliente/
  index.html                          Página del cliente
```

El flujo de una petición es `Rutas → handler → Sistema (modelo.js) → caso de uso → cad`. La capa lógica recibe la capa de acceso a datos como dependencia (`new Sistema({ cad: ... })`), así se podrá sustituir la implementación en memoria por una base de datos sin modificar la lógica.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/agregarUsuario/:email?nick=...` | Agrega un usuario |
| GET | `/obtenerUsuarios` | Lista de usuarios |
| GET | `/numeroUsuarios` | Número de usuarios |
| GET | `/usuarioActivo/:email` | Indica si el usuario está activo |
| GET | `/eliminarUsuario/:email` | Elimina un usuario |

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

## Flujo de trabajo y CI/CD

- Se sigue GitHub Flow: una rama por cambio, pruebas en local y pull request a `main`.
- `.github/workflows/ci.yml` ejecuta `npm test` en cada pull request y en cada push a `main`.
- `.github/workflows/despliegue.yml` despliega en Cloud Run en cada push a `main`. Necesita en GitHub el secreto `GCP_SA_KEY` (clave JSON de una cuenta de servicio con permisos de Cloud Run, Cloud Build y Artifact Registry) y las variables `CLOUD_RUN_SERVICE` y `CLOUD_RUN_REGION`.
