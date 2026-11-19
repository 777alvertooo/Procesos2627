---
type: Decisiones
title: Decisiones de diseño
description: Decisiones detectadas en README, código e historial del Sprint 1.
timestamp: 2026-10-28
---

# Decisiones

## D-01 — Stack Node.js + Express + SPA jQuery/Bootstrap

- **Qué se decidió:** Backend Node/Express; cliente SPA con jQuery y Bootstrap 4; pruebas Jasmine; CI GitHub Actions; despliegue Cloud Run.
- **Por qué:** Justificaciones por tecnología en el [README](../README.md#tecnologías).
- **Estado:** vigente.

## D-02 — Tres capas en servidor y dos en cliente

- **Qué se decidió:** Presentación / lógica / datos en servidor; presentación / comunicación en cliente.
- **Por qué:** Exigido por la especificación (§3) y descrito en el [README](../README.md#arquitectura).
- **Estado:** vigente.

## D-03 — CAD intercambiable (memoria vs MongoDB)

- **Qué se decidió:** Misma interfaz de CAD; `cadMemoria.js` para pruebas/local sin `MONGO_URI`; `cad.js` con MongoDB cuando hay URI.
- **Por qué:** README: la lógica recibe el CAD por dependencia para sustituir implementaciones. `index.js` elige según `MONGO_URI`.
- **Estado:** vigente.

## D-04 — Hash de contraseñas con bcryptjs

- **Qué se decidió:** `ServicioHash` usa bcryptjs.
- **Por qué:** README: «Hash de contraseñas con bcrypt en JavaScript puro, sin compilar módulos nativos en el despliegue».
- **Estado:** vigente.

## D-05 — Sesión con cookie httpOnly y store en Mongo

- **Qué se decidió:** `express-session` + `connect-mongo` cuando hay Mongo.
- **Por qué:** README: mantener sesión entre recargas y reinicios.
- **Estado:** vigente.

## D-06 — Primer administrador vía `ADMIN_EMAIL`

- **Qué se decidió:** El rol admin se asigna al email (o lista) de la variable `ADMIN_EMAIL` en registro, login u OAuth.
- **Por qué:** README: «El primer administrador es el email… de `ADMIN_EMAIL`». La especificación deja libre el mecanismo (§4.2) y pide poder justificarlo.
- **Estado:** vigente.

## D-07 — Soft-delete y estados de cuenta

- **Qué se decidió:** Estados `pendiente` / `activo` / `eliminado`; eliminar no borra el documento; login rechaza pendiente y eliminado.
- **Por qué:** Así se cumple que un eliminado no pueda entrar y, además, se puede reutilizar el mismo email más adelante (re-registro) sin perder el historial del documento. Un borrado físico obligaría a recrear todo desde cero y complica la auditoría.
- **Estado:** vigente.

## D-08 — Confirmación por correo vía SMTP (nodemailer)

- **Qué se decidió:** Envío real con nodemailer cuando hay `SMTP_*`; si no hay transportador, error «Servicio de correo no configurado».
- **Por qué:** README menciona nodemailer y SMTP. Código: `ServicioCorreo.js`.
- **Estado:** vigente.

## D-09 — OAuth con Google

- **Qué se decidió:** Proveedor externo Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
- **Por qué:** Google es un proveedor OAuth habitual, tiene capa gratuita y documentación clara de callback; encajaba con el objetivo del hito 4 (un login externo) sin añadir otro servicio de identidad.
- **Estado:** vigente.

## D-10 — Despliegue automático a Cloud Run desde `main`

- **Qué se decidió:** Workflow `despliegue.yml` en cada push a `main`; imagen vía Dockerfile Node 22.
- **Por qué:** README: Cloud Run con capa gratuita y URL pública; workflow en el repo.
- **Estado:** vigente.

## D-11 — Comentarios y nota media visibles antes de puntuar

- **Qué se decidió:** Cualquier usuario con sesión ve en la ficha la nota media sobre 5, el número de comentarios y el texto de cada uno. El formulario de puntuación está siempre encima de los comentarios y se puede volver a enviar. Like, dislike y respuesta siguen exigiendo haber puntuado esa película al menos una vez.
- **Por qué:** La cartelera enseña la opinión de los demás y, a la vez, deja dejar la propia. Admin y usuario usan las mismas reglas (`ObtenerPelicula`).
- **Estado:** vigente.

## D-12 — Catálogo inicial sembrado en la capa de datos

- **Qué se decidió:** El catálogo de arranque vive en `servidor/datos/catalogoPeliculas.js`. Mongo inserta cada título solo si ese id todavía no existe. Si ya existe, solo actualiza la sinopsis. La memoria de pruebas carga la lista al crear el CAD.
- **Por qué:** La cartelera necesita póster, sinopsis, dónde verla y tráiler. No reescribir el resto evita pisar una edición de título, cartel o cines hecha por un admin. La sinopsis sí se refresca cuando el catálogo de arranque la amplía.
- **Estado:** vigente.

## D-13 — Alta, edición y borrado de películas solo para admin

- **Qué se decidió:** Crear, editar y borrar una película exige sesión de administrador. Borrar también quita pendientes, puntuaciones, respuestas y reacciones de esa película.
- **Por qué:** El catálogo deja de ser solo de lectura y el usuario normal no debe cambiar la cartelera.
- **Estado:** vigente.
