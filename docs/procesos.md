---
type: Proceso
title: Flujo de trabajo y CI/CD
description: GitHub Flow, integración continua y despliegue continuo del repositorio.
timestamp: 2026-10-28
---

# Procesos

Resumen en el [README](../README.md#flujo-de-trabajo-y-cicd).

## Flujo de trabajo (GitHub Flow)

- Desarrollo habitual en rama `Sprint-1` (y ramas puntuales como `PruebaTecnicaSP1`).
- Integración a `main` mediante pull request (confirmado con `gh pr list`: **16** merged).
- Desviación: commit `835b7d9` («Se añade el Readme») aparece en first-parent de `main` sin mensaje de merge de PR (ver [log.md](log.md)).
- No hay etiquetas git de hitos (`git tag` vacío).
- Tablero Donetonic: no uso.

## Integración continua

Archivo: `.github/workflows/ci.yml`.

- Disparadores: `pull_request` y `push` a `main`.
- Pasos: checkout → Node 22 → `npm ci` → `npm test`.
- Comando local documentado: `npm test` (Unix/CI) y `npm run testW` (Windows) en el README.
- Historial reciente (`gh run list --limit 100`): **47** ejecuciones listadas; de ellas, en el listado textual, **40** con éxito y **7** con fallo (fallos tempranos de CI/despliegue en hitos 3–4, luego mayoritariamente verdes).

## Despliegue continuo

Archivo: `.github/workflows/despliegue.yml`.

- Disparador: `push` a `main`.
- Autenticación GCP con secreto `GCP_SA_KEY`; variables `CLOUD_RUN_SERVICE` y `CLOUD_RUN_REGION`.
- Acción `deploy-cloudrun` con `source: ./` (build a partir del `Dockerfile`).
- URL pública documentada en el README (sin repetir aquí credenciales ni rutas internas).

El CI y el despliegue son workflows independientes (la especificación no exige que el deploy espere al CI).
