---
type: Requisitos
title: Requisitos Sprint 1
description: Estado de cada requisito de la especificación frente al código en main.
timestamp: 2026-10-28
---

# Requisitos

Comparación con la especificación del Sprint 1 (`Especificaciones/especificacion-proyecto-sprint1-vf.pdf`).
Evidencias en rutas del repo; pruebas: `npm run testW` → **57** tests, **111** assertions, **0** failures (2026-10-28).

| ID | Requisito | Estado | Evidencia |
|---|---|---|---|
| ARQ-01 | Separación cliente-servidor y mismo origen | hecho | `index.js` sirve `/cliente`; API en `servidor/presentacion/Rutas.js`; cliente solo vía `cliente/comunicacion/clienteRest.js` |
| ARQ-02 | Capas del backend: API, lógica y datos | hecho | `servidor/presentacion`, `servidor/logica`, `servidor/datos`; fachada `servidor/logica/modelo.js` |
| ARQ-03 | Capas del frontend: presentación y comunicación | hecho | `cliente/presentacion/` vs `cliente/comunicacion/clienteRest.js` (README) |
| RF-01 | Registro de usuario local | hecho | `servidor/logica/usecases/RegistrarUsuario.js`; `POST /registrarUsuario`; `servidor/pruebas/registrarUsuarioSpec.js` |
| RF-02 | Confirmación de cuenta por correo | hecho | `ConfirmarUsuario.js`; `ServicioCorreo.js` (SMTP si hay vars); `GET /confirmarUsuario/:token`; `confirmarUsuarioSpec.js`. Sin SMTP configurado el envío falla con error explícito (no sustituye el correo por un enlace solo en log) |
| RF-03 | Inicio de sesión local | hecho | `IniciarSesion.js`; `POST /iniciarSesion`; `iniciarSesionSpec.js` |
| RF-04 | Inicio de sesión con OAuth | hecho | `ClienteGoogle.js`, `AutenticarGoogle.js`; `/auth/google` y callback; `autenticarGoogleSpec.js` |
| RF-05 | Cierre de sesión | hecho | `GestorSesion.cerrar`; `POST /cerrarSesion`; `CerrarSesionHandler.js` |
| RF-06 | Mantenimiento de la sesión entre recargas | hecho | `express-session` + `connect-mongo` (README, `index.js`); `GET /usuarioSesion` |
| RF-07 | Listar usuarios (administrador) | hecho | `ObtenerUsuarios.js` + `autorizacion.exigirAdmin`; `GET /obtenerUsuarios`; `obtenerUsuariosSpec.js` / `rolesSpec.js` |
| RF-08 | Comprobar si un usuario está activo (administrador) | hecho | `UsuarioActivo.js` (estado `activo`); `GET /usuarioActivo/:email`; `usuarioActivoSpec.js` |
| RF-09 | Eliminar usuario | hecho | `EliminarUsuario.js` (admin o propio; soft-delete); `DELETE /eliminarUsuario/:email`; `eliminarUsuarioSpec.js` / `rolesSpec.js` |
| RF-10 | Creación del primer administrador | hecho | Variable `ADMIN_EMAIL` (`.env.example`, README); asignación de rol en registro/login/OAuth |
| RNF-01 | Persistencia en una base de datos real | hecho | `servidor/datos/cad.js` con `MONGO_URI`; sin URI usa memoria y avisa en log (`index.js`) |
| RNF-02 | Secretos fuera del código y `.env.example` | hecho | `.env.example` solo nombres; README lista variables |
| RNF-03 | Hash seguro de contraseñas | hecho | `ServicioHash.js` (bcryptjs); usado en registro/login |
| RNF-04 | Rutas protegidas por sesión y rol | hecho | `HaIniciadoSesion.js`; `Autorizacion.js` en listado/activo/eliminar |
| RNF-05 | Despliegue en cloud con URL pública | hecho | `Dockerfile`; `.github/workflows/despliegue.yml`; URL en README |
| RNF-06 | Pruebas unitarias de la lógica (5 o más) | hecho | Jasmine en `servidor/pruebas/*Spec.js`; **57** tests (`npm run testW`); incluye casos de error (p. ej. `iniciarSesionSpec`, `rolesSpec`) |
| RNF-07 | Manejo de errores con feedback al usuario | hecho | `RespuestaHttp.js` + `TipoError`; mensajes en `cliente/presentacion/componentes/Mensajes.js` / `controlWeb.js` |
| RNF-08 | Registro de actividad (log) | hecho | `servidor/log/Log.js`; uso en casos de uso; var `LOG_FICHERO` |
| PRO-01 | Flujo de trabajo GitHub Flow | parcial | Casi todo entra por PR a `main` (16 merges). Falta: commit `835b7d9` en first-parent de `main` sin merge de PR («Se añade el Readme»). Sin etiquetas git de hitos (`git tag` vacío) |
| PRO-02 | Integración continua | hecho | `.github/workflows/ci.yml` (`npm test` en PR y push a `main`); historial `gh run list` |
| PRO-03 | Despliegue continuo | hecho | `.github/workflows/despliegue.yml` en cada push a `main` |

Los parciales/pendientes se listan en [sprint-2.md](sprint-2.md).
