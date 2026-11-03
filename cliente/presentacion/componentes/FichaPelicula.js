function FichaPelicula(selector) {
    this.mostrar = function (datos, acciones) {
        let pelicula = datos.pelicula;
        let embed = embedSeguro(pelicula.trailerEmbed);
        let enlace = enlaceYoutube(pelicula.trailerUrl);
        let cadena = '<article class="ficha">';
        cadena = cadena + '<button type="button" id="btnVolverFicha" class="btn-volver" aria-label="Volver">';
        cadena = cadena + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4-1.4 1.4L5.2 12 14 3.2z"></path></svg>';
        cadena = cadena + "</button>";
        cadena = cadena + '<div class="ficha-grid">';
        cadena = cadena + '<img class="ficha-cartel" src="' + Html.escapar(pelicula.cartel) + '" alt="Cartel de ' + Html.escapar(pelicula.titulo) + '">';
        cadena = cadena + "<div>";
        cadena = cadena + "<h1>" + Html.escapar(pelicula.titulo) + "</h1>";
        cadena = cadena + dondeVerHtml(pelicula);
        cadena = cadena + '<h2 class="titulo-sinopsis">Sinopsis</h2>';
        cadena = cadena + '<p class="ficha-sinopsis">' + Html.escapar(pelicula.sinopsis) + "</p>";
        cadena = cadena + temporadasHtml(pelicula);
        cadena = cadena + '<div class="ficha-acciones">';
        if (!datos.yaValorada) {
            cadena = cadena + '<button type="button" id="btnListaFicha" class="btn btn-outline-oliva btn-sm">';
            cadena = cadena + (datos.enLista ? "Quitar de pendientes" : "Añadir a pendientes");
            cadena = cadena + "</button>";
        }
        if (enlace) {
            cadena = cadena + '<a class="btn btn-oliva btn-sm" href="' + Html.escapar(enlace) + '" target="_blank" rel="noopener noreferrer">Ver tráiler en YouTube</a>';
        }
        if (acciones.esAdmin) {
            cadena = cadena + '<button type="button" id="btnEditarPelicula" class="btn btn-outline-oliva btn-sm">Editar</button>';
            cadena = cadena + '<button type="button" id="btnBorrarPelicula" class="btn btn-outline-oliva btn-sm">Borrar</button>';
        }
        cadena = cadena + "</div>";
        if (embed) {
            cadena = cadena + '<div class="trailer"><iframe src="' + Html.escapar(embed) + '" title="Tráiler de ' + Html.escapar(pelicula.titulo) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
        }
        cadena = cadena + "</div></div>";
        cadena = cadena + zonaOpinion(datos);
        cadena = cadena + "</article>";
        $(selector).html(cadena);

        $("#btnVolverFicha").on("click", acciones.alVolver);
        if (!datos.yaValorada) {
            $("#btnListaFicha").on("click", function () {
                acciones.alAlternarLista(pelicula.id, datos.enLista);
            });
        }
        if (acciones.esAdmin) {
            $("#btnEditarPelicula").on("click", function () {
                acciones.alEditar(pelicula.id);
            });
            $("#btnBorrarPelicula").on("click", function () {
                acciones.alBorrar(pelicula.id, pelicula.titulo);
            });
        }
        $("#btnValorar").on("click", function () {
            acciones.alValorar(puntuacionElegida(), $("#textoValoracion").val());
        });
        $(".btn-estrella").on("click", function () {
            let valor = Number($(this).attr("data-valor"));
            $(".btn-estrella").each(function () {
                $(this).toggleClass("activa", Number($(this).attr("data-valor")) <= valor);
            });
            $("#textoValoracion").data("puntuacion", valor);
        });
        $(".btn-reaccion").on("click", function () {
            acciones.alReaccionar($(this).attr("data-id"), $(this).attr("data-tipo"));
        });
        $(".btn-abrir-respuesta").on("click", function () {
            $(this).closest(".comentario").find(".form-respuesta").toggleClass("d-none");
        });
        $(".btn-enviar-respuesta").on("click", function () {
            let caja = $(this).closest(".form-respuesta");
            acciones.alResponder($(this).attr("data-id"), caja.find("textarea").val());
        });

        if (acciones.enfocarOpinion) {
            let destino = document.getElementById("formularioValoracion");
            if (destino && destino.scrollIntoView) destino.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    this.habilitarValoracion = function (activo) {
        $("#btnValorar").prop("disabled", !activo);
    };
}

function puntuacionElegida() {
    return Number($("#textoValoracion").data("puntuacion")) || 0;
}

function zonaOpinion(datos) {
    let comentarios = datos.comentarios || [];
    let cadena = formularioValoracion();
    cadena = cadena + '<section id="zonaComentarios" class="zona-opinion">';
    cadena = cadena + "<h2>Comentarios</h2>";
    cadena = cadena + '<p class="media-peli">Nota media: <strong>' + formatearMedia(datos.media) + "</strong> / 5</p>";
    cadena = cadena + '<p class="media-peli">' + textoComentarios(datos.numeroComentarios) + "</p>";
    if (!comentarios.length) {
        cadena = cadena + '<p class="texto-vista">Todavía no hay comentarios.</p>';
    }
    comentarios.forEach(function (comentario) {
        cadena = cadena + comentarioHtml(comentario, datos.yaValorada, true);
    });
    cadena = cadena + "</section>";
    return cadena;
}

function temporadasHtml(pelicula) {
    if (pelicula.medio !== "serie") return "";
    let lista = pelicula.temporadas || [];
    if (!lista.length) return "";
    let total = lista.length;
    let cadena = '<h2 class="titulo-sinopsis">Temporadas</h2>';
    cadena = cadena + '<p class="ficha-temporadas">' + total + (total === 1 ? " temporada" : " temporadas") + "</p>";
    cadena = cadena + '<ul class="lista-temporadas">';
    lista.forEach(function (temporada) {
        let capitulos = Number(temporada.capitulos) || 0;
        cadena = cadena + "<li>Temporada " + Html.escapar(String(temporada.numero));
        cadena = cadena + " · " + capitulos + (capitulos === 1 ? " capítulo" : " capítulos") + "</li>";
    });
    cadena = cadena + "</ul>";
    return cadena;
}

function dondeVerHtml(pelicula) {
    if (pelicula.tipo === "cine") return bloqueCines(pelicula.cines);
    return '<p class="ficha-dato"><span>Dónde verla</span> ' + Html.escapar(pelicula.dondeVer) + "</p>";
}

function bloqueCines(cines) {
    let lista = cines || [];
    if (!lista.length) return "";
    let cadena = '<div class="ficha-dato"><span>Cines</span><ul class="lista-cines">';
    lista.forEach(function (cine) {
        cadena = cadena + "<li>" + Html.escapar(cine) + "</li>";
    });
    cadena = cadena + "</ul></div>";
    return cadena;
}

function formularioValoracion() {
    let cadena = '<div id="formularioValoracion" class="formulario-valoracion">';
    cadena = cadena + "<h3>Tu puntuación</h3>";
    cadena = cadena + '<div class="selector-estrellas" role="group" aria-label="Puntuación de 1 a 5">';
    let i;
    for (i = 1; i <= 5; i++) {
        cadena = cadena + '<button type="button" class="btn-estrella" data-valor="' + i + '" aria-label="' + i + ' de 5">★</button>';
    }
    cadena = cadena + "</div>";
    cadena = cadena + '<textarea id="textoValoracion" class="campo-comentario" maxlength="500" placeholder="Qué te ha parecido"></textarea>';
    cadena = cadena + '<button type="button" id="btnValorar" class="btn btn-oliva">Publicar puntuación</button>';
    cadena = cadena + "</div>";
    return cadena;
}

function textoComentarios(numero) {
    let total = Number(numero) || 0;
    if (total === 1) return "1 comentario";
    return total + " comentarios";
}

function comentarioHtml(comentario, puedeParticipar, esHilo) {
    let cadena = '<div class="comentario' + (comentario.esMio ? " comentario-mio" : "") + '">';
    cadena = cadena + '<p class="comentario-autor">' + Html.escapar(comentario.nick);
    if (comentario.esMio) cadena = cadena + ' <span class="etiqueta-mia">Tú</span>';
    cadena = cadena + "</p>";
    if (comentario.puntuacion) {
        cadena = cadena + '<p class="comentario-estrellas" aria-label="' + comentario.puntuacion + ' de 5">' + estrellas(comentario.puntuacion) + "</p>";
    }
    cadena = cadena + "<p>" + Html.escapar(comentario.texto) + "</p>";
    cadena = cadena + '<p class="comentario-fecha">' + Html.escapar(fechaLegible(comentario.fecha)) + "</p>";
    if (puedeParticipar) {
        cadena = cadena + '<div class="comentario-acciones">';
        cadena = cadena + botonReaccion(comentario, "like", "Me gusta");
        cadena = cadena + botonReaccion(comentario, "dislike", "No me gusta");
        if (esHilo) {
            cadena = cadena + '<button type="button" class="btn btn-outline-oliva btn-sm btn-abrir-respuesta">Responder</button>';
        }
        cadena = cadena + "</div>";
        if (esHilo) {
            cadena = cadena + '<div class="form-respuesta d-none">';
            cadena = cadena + '<textarea class="campo-comentario" maxlength="500" placeholder="Escribe tu respuesta"></textarea>';
            cadena = cadena + '<button type="button" class="btn btn-oliva btn-sm btn-enviar-respuesta" data-id="' + Html.escapar(comentario.id) + '">Publicar respuesta</button>';
            cadena = cadena + "</div>";
        }
    }
    if (esHilo) {
        (comentario.respuestas || []).forEach(function (respuesta) {
            cadena = cadena + '<div class="respuesta">' + comentarioHtml(respuesta, puedeParticipar, false) + "</div>";
        });
    }
    cadena = cadena + "</div>";
    return cadena;
}

function botonReaccion(comentario, tipo, texto) {
    let cuenta = tipo === "like" ? comentario.likes : comentario.dislikes;
    let activa = comentario.miReaccion === tipo ? " activa" : "";
    return '<button type="button" class="btn-reaccion' + activa + '" data-id="' + Html.escapar(comentario.id) + '" data-tipo="' + tipo + '">'
        + texto + " (" + cuenta + ")</button>";
}

function estrellas(n) {
    let cadena = "";
    let i;
    for (i = 1; i <= 5; i++) cadena = cadena + (i <= n ? "★" : "☆");
    return cadena;
}

function formatearMedia(media) {
    if (media === null || media === undefined) return "—";
    return String(media).replace(".", ",");
}

function fechaLegible(iso) {
    let fecha = new Date(iso);
    if (isNaN(fecha.getTime())) return "";
    return fecha.toLocaleDateString("es-ES");
}

function embedSeguro(url) {
    if (typeof url === "string" && url.indexOf("https://www.youtube.com/embed/") === 0) return url;
    return "";
}

function enlaceYoutube(url) {
    if (typeof url === "string" && url.indexOf("https://www.youtube.com/watch?v=") === 0) return url;
    return "";
}
