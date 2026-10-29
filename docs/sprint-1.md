---
type: Sprint
title: Sprint 1
description: Hitos orientativos, entregas por PR y retrospectiva del Sprint 1.
timestamp: 2026-10-28
---

# Sprint 1

Especificación: `Especificaciones/especificacion-proyecto-sprint1-vf.pdf` (§10 hitos orientativos).
Tablero Donetonic: no uso.

No hay etiquetas git (`git tag` vacío). Los hitos se asocian por títulos de PR y commits en la rama `Sprint-1`.

## Hito 1 — Esqueleto y backend

- **Objetivo (especificación §10):** repositorio y flujo con PR; CI/CD desde el inicio; capa lógica de usuarios en memoria + API + pruebas.
- **Qué se hizo:** estructura Express; CAD memoria; capa lógica; API; CI (commits/PR iniciales).
- **PR / etiqueta:** [PR #2](https://github.com/777alvertooo/Procesos2627/pull/2), [PR #3](https://github.com/777alvertooo/Procesos2627/pull/3). Sin etiqueta git.
- **Desviaciones:** commit inicial `835b7d9` en `main` sin merge de PR (antes del flujo estable de PRs).

## Hito 2 — Frontend y sesión

- **Objetivo:** interfaz y cliente de comunicación; registro/login con hash; cierre y sesión entre recargas; rutas protegidas (datos aún en memoria según especificación).
- **Qué se hizo:** sesión, hash, SPA, cliente REST, pruebas de registro/login/sesión (título PR «Hito 2»).
- **PR / etiqueta:** [PR #4](https://github.com/777alvertooo/Procesos2627/pull/4). Sin etiqueta git.
- **Desviaciones:** ninguna adicional confirmada con `gh` en este hito.

## Hito 3 — Persistencia y roles

- **Objetivo:** CAD contra BD real; secretos en entorno; roles y restricciones en servidor; log.
- **Qué se hizo:** MongoDB, connect-mongo, roles, autorización, soft-delete, UI por rol, log, README hito 3; corrección de prueba admin.
- **PR / etiqueta:** [PR #5](https://github.com/777alvertooo/Procesos2627/pull/5) («Hito 3»), [PR #6](https://github.com/777alvertooo/Procesos2627/pull/6). Sin etiqueta git.
- **Desviaciones:** ejecuciones de CI/despliegue en rojo justo tras el merge del Hito 3 (`gh run list`: fallos asociados a PR #5/#6), corregidas en PRs posteriores.

## Hito 4 — Servicios externos y cierre

- **Objetivo:** OAuth; confirmación por correo; feedback de errores; README y revisión.
- **Qué se hizo:** Dockerfile/Cloud Run; email de confirmación; login Google; ajustes README/URL; mejoras posteriores (recuperación de clave, perfil, UX) en PRs #11–#15.
- **PR / etiqueta:** [PR #7](https://github.com/777alvertooo/Procesos2627/pull/7)–[PR #10](https://github.com/777alvertooo/Procesos2627/pull/10) (núcleo hito 4); mejoras [PR #11](https://github.com/777alvertooo/Procesos2627/pull/11)–[PR #15](https://github.com/777alvertooo/Procesos2627/pull/15). Sin etiqueta git.
- **Desviaciones:** PR #16 cerrado sin merge; trabajo de bloqueo integrado vía [PR #17](https://github.com/777alvertooo/Procesos2627/pull/17) (prueba técnica, no hito §10).

## Retrospectiva

### Hechos

- First-parent de `main`: **17** commits (16 merges de PR + `835b7d9`).
- Pull requests: **16** merged, **1** closed sin merge (#16) — `gh pr list`.
- Pruebas en local (2026-10-28): `npm run testW` → **57** tests, **111** assertions, **0** failures.
- CI listado (`gh run list --limit 100`): **47** runs; **40** success y **7** failure en ese listado.
- Tip `main` documentado: `9ca2432`.

### Qué funcionó

Dividir el trabajo en hitos con PRs a `main` y CI en cada integración detectó fallos pronto (sobre todo al meter Mongo, roles y el despliegue). Mantener las reglas en la capa lógica (y no solo en la UI) simplificó las pruebas Jasmine y evitó depender de ocultar botones.

### Qué cambiaría

No volver a dejar commits directos en `main`, etiquetar los hitos en git y usar un checklist de variables de entorno (SMTP, OAuth, Mongo, `URL_BASE`) antes de cada despliegue en Cloud Run, porque ahí se perdía más tiempo que en la lógica.
