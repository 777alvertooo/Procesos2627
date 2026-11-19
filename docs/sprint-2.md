---
type: Sprint
title: Sprint 2
description: Primer incremento, cartelera con lista de pendientes y reseñas.
timestamp: 2026-10-29
---

# Sprint 2

## Objetivo

Una persona con sesión puede ver una cartelera de películas en cines y en plataforma, guardar las que quiere ver y puntuarlas. Un administrador, además, crea, edita y borra películas. En la ficha se ven la nota media sobre 5, el número de comentarios y lo que han escrito los demás, también antes de puntuar. Like, dislike y respuesta siguen pidiendo haber dejado la propia puntuación. El acceso (registro, login, sesión y roles) sigue siendo el del Sprint 1. Admin y usuario usan la cartelera con las mismas reglas.

## Primer incremento

| ID | Requisito | Estado | Evidencia |
|---|---|---|---|
| CAT-01 | Catálogo en dos filas (cines y plataforma), con póster, título, marcador, filtros y búsqueda | hecho | `CatalogoPeliculas.js`; `GET /obtenerPeliculas`; `peliculasSpec.js` |
| CAT-02 | Ficha con sinopsis y tráiler; en cines lista las salas y en plataforma solo la plataforma | hecho | `FichaPelicula.js`; `PeliculaMapper.js`; `catalogoPeliculas.js` |
| CAT-03 | Lista de pendientes con quitar (papelera) y botón Puntuar; al comentar, sale de la lista | hecho | `ListaPendientes.js`; `ValorarPelicula.js`; `POST /anadirPendiente` |
| CAT-04 | Puntuación del 1 al 5 y comentario, las veces que se quiera | hecho | `ValorarPelicula.js`; `POST /valorarPelicula` |
| CAT-05 | Nota media sobre 5, número de comentarios y formulario de puntuación en la ficha, visibles para admin y usuario | hecho | `ObtenerPelicula.js`; `FichaPelicula.js`; `ValorarPelicula.js` |
| CAT-06 | Un admin crea, edita y borra películas; un usuario no | hecho | `CrearPelicula.js`; `ActualizarPelicula.js`; `EliminarPelicula.js`; `FormularioPelicula.js` |

El catálogo de arranque tiene 54 películas en `servidor/datos/catalogoPeliculas.js`.

## Requisitos que pasan del Sprint 1

Según [requisitos.md](requisitos.md), el único ítem no cerrado al 100 % es:

| ID | Estado en Sprint 1 | Qué falta / arrastre |
|---|---|---|
| PRO-01 | parcial | Evitar commits directos a `main` (caso `835b7d9`). Valorar etiquetas git por hito. Revisar en la pestaña Pull requests que todo cambio futuro entre solo por PR. |

No hay requisitos de la tabla OKF del Sprint 1 en estado **pendiente**.
