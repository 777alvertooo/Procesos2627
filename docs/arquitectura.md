---
type: Arquitectura
title: Arquitectura del sistema
description: Capas del backend y del frontend, frontera entre capas y endpoints.
timestamp: 2026-10-28
---

# Arquitectura

Detalle y justificación de tecnologías: [README](../README.md).

## Backend

| Capa | Carpeta / archivos | Responsabilidad |
|---|---|---|
| Presentación (API) | `servidor/presentacion/` (`Rutas.js`, `handlers/`, `middlewares/`, `GestorSesion.js`, `RespuestaHttp.js`) | HTTP: rutas, sesión, códigos de respuesta |
| Lógica | `servidor/logica/` (`modelo.js`, `usecases/`, `entities/`, `autorizacion/`, `servicios/`, …) | Reglas de negocio; fachada `Sistema` |
| Datos | `servidor/datos/` (`cad.js`, `cadMemoria.js`) | Persistencia (MongoDB o memoria) |
| Log | `servidor/log/Log.js` | Registro de actividad |

Entrada: `index.js` cablea Express, CAD, sesión y `Sistema`.

## Frontend

| Capa | Carpeta / archivos | Responsabilidad |
|---|---|---|
| Presentación (GUI) | `cliente/presentacion/` (`controlWeb.js`, `componentes/`, `utilidades/`) | DOM, pantallas, orquestación UI |
| Comunicación | `cliente/comunicacion/clienteRest.js` | Únicas peticiones AJAX al API |

Estáticos servidos en `/cliente` (mismo origen).

## Frontera entre capas

- **Cliente → servidor:** solo vía API REST (`clienteRest.js`). El cliente no accede a la base de datos ni ejecuta reglas de negocio.
- **Presentación servidor → lógica:** handlers llaman a `sistema.*` (`modelo.js`); no usan el CAD directamente.
- **Lógica → datos:** casos de uso reciben el CAD por inyección; pueden usar `cad.js` o `cadMemoria.js` sin cambiar la lógica.
- **GUI → comunicación:** componentes avisan a `controlWeb`; solo `controlWeb` llama a `clienteRest`.

## Endpoints

Tabla alineada con el [README](../README.md#endpoints). Quién puede: según código en `Rutas.js` + middlewares/casos de uso.

| Método | Ruta | Quién puede |
|---|---|---|
| GET | `/` | Público (SPA) |
| POST | `/registrarUsuario` | Público |
| GET | `/confirmarUsuario/:token` | Público |
| POST | `/iniciarSesion` | Público |
| GET | `/auth/google` | Público |
| GET | `/auth/google/callback` | Público |
| POST | `/solicitarRestablecerClave` | Público |
| POST | `/restablecerClave` | Público |
| GET | `/usuarioSesion` | Público (devuelve usuario o `null`) |
| POST | `/cerrarSesion` | Público |
| GET | `/obtenerUsuarios` | Sesión + administrador |
| GET | `/numeroUsuarios` | Sesión + administrador |
| GET | `/usuarioActivo/:email` | Sesión + administrador |
| DELETE | `/eliminarUsuario/:email` | Sesión + (admin u propio usuario) |
| PUT | `/actualizarPerfil` | Sesión (usuario autenticado) |
| PUT | `/actualizarUsuario/:email` | Sesión + administrador |
| POST | `/api/prueba/bloqueo` | Público (endpoint de prueba técnica) |

Sin sesión válida en rutas con `HaIniciadoSesion`: HTTP 401. Sin rol admin donde se exige: HTTP 403 (`Autorizacion` / casos de uso).
