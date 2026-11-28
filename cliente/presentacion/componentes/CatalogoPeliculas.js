function CatalogoPeliculas(selector) {
    let peliculas = [];
    let pendientes = [];
    let vistas = [];
    let alAbrir = function () {};
    let alMarcar = function () {};
    let filtro = "todas";
    let consulta = "";
    let pestana = "pelicula";
    // Filtros que resuelve el servidor; se conservan al volver al catálogo.
    let filtrosServidor = {};
    let opciones = { plataformas: [], generos: [] };
    let alFiltrar = null;

    this.generosDisponibles = function () {
        return (opciones.generos || []).slice();
    };

    this.filtrosActivos = function () {
        return Object.assign({}, filtrosServidor);
    };

    this.mostrar = function (datos, abrir, marcar, crear, filtrar) {
        peliculas = datos.peliculas || [];
        pendientes = datos.idsPendientes || [];
        vistas = datos.idsVistas || [];
        alAbrir = abrir;
        alMarcar = marcar;
        alFiltrar = filtrar || null;
        opciones = datos.opcionesFiltro || opciones;
        filtrosServidor = Object.assign({}, datos.filtros || {});
        filtro = "todas";
        consulta = "";
        pestana = datos.pestana === "serie" ? "serie" : "pelicula";
        let cadena = '<div class="catalogo">';
        cadena = cadena + '<div class="barra-catalogo">';
        cadena = cadena + '<div class="busqueda-catalogo">';
        cadena = cadena + '<input type="search" id="buscarPelicula" class="campo-busqueda" placeholder="Buscar película" aria-label="Buscar película">';
        cadena = cadena + '<svg class="icono-buscar" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"></path></svg>';
        cadena = cadena + "</div>";
        cadena = cadena + '<div class="filtros-catalogo" role="group" aria-label="Filtrar cartelera">';
        cadena = cadena + botonFiltro("todas", "Todas", true);
        cadena = cadena + botonFiltro("cine", "En cines", false);
        cadena = cadena + botonFiltro("plataforma", "En plataforma", false);
        if (datos.esAdmin) {
            cadena = cadena + '<button type="button" id="btnNuevaPelicula" class="btn btn-oliva btn-sm">Nueva película</button>';
        }
        cadena = cadena + "</div></div>";
        cadena = cadena + filtrosCombinados(opciones, filtrosServidor);
        cadena = cadena + '<div id="rejillaCatalogo"></div>';
        cadena = cadena + "</div>";
        $(selector).html(cadena);
        aplicarPestana();
        actualizarQuitar();
        pintarFilas();

        $(selector).find("#buscarPelicula").on("input", function () {
            consulta = $(this).val();
            actualizarQuitar();
            pintarFilas();
        });
        $(selector).find(".filtro-catalogo").on("click", function () {
            filtro = $(this).attr("data-filtro");
            $(selector).find(".filtro-catalogo").removeClass("activo").attr("aria-pressed", "false");
            $(this).addClass("activo").attr("aria-pressed", "true");
            pintarFilas();
        });
        $(selector).find("#btnNuevaPelicula").on("click", function () {
            if (crear) crear();
        });
        $(selector).find(".selector-filtro").on("change", function () {
            filtrosServidor = leerFiltros();
            pedirFiltrado();
        });
        $(selector).find("#btnQuitarFiltros").on("click", function () {
            $(selector).find(".selector-filtro").val("");
            $(selector).find("#buscarPelicula").val("");
            consulta = "";
            filtrosServidor = {};
            pedirFiltrado();
        });
    };

    function leerFiltros() {
        let filtros = {};
        let plataforma = $(selector).find("#filtroPlataforma").val();
        let genero = $(selector).find("#filtroGenero").val();
        let valoracion = $(selector).find("#filtroValoracion").val();
        if (plataforma) filtros.plataforma = plataforma;
        if (genero) filtros.genero = genero;
        if (valoracion) filtros.valoracionMinima = valoracion;
        return filtros;
    }

    function pedirFiltrado() {
        actualizarQuitar();
        if (!alFiltrar) return pintarFilas();
        $(selector).find(".selector-filtro").prop("disabled", true);
        alFiltrar(filtrosServidor, function (datos) {
            $(selector).find(".selector-filtro").prop("disabled", false);
            if (!datos || !datos.peliculas) return;
            peliculas = datos.peliculas;
            pendientes = datos.idsPendientes || [];
            vistas = datos.idsVistas || [];
            pintarFilas();
        });
    }

    function actualizarQuitar() {
        let hay = Object.keys(filtrosServidor).length > 0 || !!consulta;
        $(selector).find("#btnQuitarFiltros").prop("hidden", !hay);
    }

    this.marcar = function (id, enLista) {
        let boton = $(selector).find('.marca-lista[data-id="' + id + '"]');
        boton.attr("data-en-lista", enLista ? "si" : "no");
        boton.toggleClass("en-lista", enLista);
        boton.attr("aria-pressed", enLista ? "true" : "false");
        boton.attr("aria-label", enLista ? "Quitar de pendientes" : "Añadir a pendientes");
    };

    this.pestana = function () {
        return pestana;
    };

    function aplicarPestana() {
        let series = pestana === "serie";
        $(selector).find("#buscarPelicula")
            .attr("placeholder", series ? "Buscar serie" : "Buscar película")
            .attr("aria-label", series ? "Buscar serie" : "Buscar película");
        $(selector).find(".filtro-catalogo").toggle(!series);
        $(selector).find("#btnNuevaPelicula").text(series ? "Nueva serie" : "Nueva película");
    }

    function pintarFilas() {
        let texto = normalizar(consulta);
        let dePestana = peliculas.filter(function (pelicula) {
            let esSerie = pelicula.medio === "serie";
            return pestana === "serie" ? esSerie : !esSerie;
        });
        let visibles = dePestana.filter(function (pelicula) {
            if (pestana === "pelicula" && filtro !== "todas" && pelicula.tipo !== filtro) return false;
            if (!texto) return true;
            return normalizar(pelicula.titulo).indexOf(texto) !== -1;
        });
        let cadena = "";
        let resumen = visibles.length + (pestana === "serie"
            ? (visibles.length === 1 ? " serie" : " series")
            : (visibles.length === 1 ? " película" : " películas"));
        $(selector).find("#resultadoFiltros").text(resumen);
        if (!visibles.length) {
            cadena = '<p class="texto-vista">' + (pestana === "serie"
                ? "Ninguna serie coincide con la búsqueda y los filtros."
                : "Ninguna película coincide con la búsqueda y los filtros.") + "</p>";
        } else if (pestana === "serie" || filtro === "plataforma") {
            cadena = gruposPlataforma(visibles, pendientes, vistas);
        } else if (filtro === "cine") {
            cadena = fila("En cines", visibles, pendientes, vistas);
        } else {
            let cines = visibles.filter(function (pelicula) { return pelicula.tipo === "cine"; });
            let plataformas = visibles.filter(function (pelicula) { return pelicula.tipo === "plataforma"; });
            if (cines.length) cadena = cadena + fila("En cines", cines, pendientes, vistas);
            cadena = cadena + gruposPlataforma(plataformas, pendientes, vistas);
        }
        $(selector).find("#rejillaCatalogo").html(cadena);
        $(selector).find(".cartel-abrir").on("click", function () {
            alAbrir($(this).attr("data-id"));
        });
        $(selector).find(".marca-lista").on("click", function (evento) {
            evento.preventDefault();
            evento.stopPropagation();
            alMarcar($(this).attr("data-id"), $(this).attr("data-en-lista") === "si");
        });
    }
}

function filtrosCombinados(opciones, activos) {
    let cadena = '<div class="filtros-combinados" role="group" aria-label="Filtros combinados">';
    cadena = cadena + selectorFiltro("filtroPlataforma", "Plataforma", "Todas las plataformas",
        (opciones.plataformas || []).map(function (nombre) { return { valor: nombre, texto: nombre }; }), activos.plataforma);
    cadena = cadena + selectorFiltro("filtroGenero", "Género", "Todos los géneros",
        (opciones.generos || []).map(function (nombre) { return { valor: nombre, texto: nombre }; }), activos.genero);
    cadena = cadena + selectorFiltro("filtroValoracion", "Valoración", "Cualquier valoración",
        [4, 3, 2, 1].map(function (nota) { return { valor: String(nota), texto: nota + " ★ o más" }; }),
        activos.valoracionMinima !== undefined ? String(activos.valoracionMinima) : "");
    cadena = cadena + '<button type="button" id="btnQuitarFiltros" class="boton-quitar-filtros" hidden>Quitar filtros</button>';
    cadena = cadena + '<span id="resultadoFiltros" class="resultado-filtros" aria-live="polite"></span>';
    cadena = cadena + "</div>";
    return cadena;
}

function selectorFiltro(id, etiqueta, todos, valores, activo) {
    let cadena = '<label class="campo-filtro" for="' + id + '"><span>' + Html.escapar(etiqueta) + "</span>";
    cadena = cadena + '<select id="' + id + '" class="selector-filtro">';
    cadena = cadena + '<option value="">' + Html.escapar(todos) + "</option>";
    valores.forEach(function (opcion) {
        cadena = cadena + '<option value="' + Html.escapar(opcion.valor) + '"' + (opcion.valor === activo ? " selected" : "") + ">";
        cadena = cadena + Html.escapar(opcion.texto) + "</option>";
    });
    cadena = cadena + "</select></label>";
    return cadena;
}

function botonFiltro(valor, etiqueta, activo) {
    let cadena = '<button type="button" class="filtro-catalogo' + (activo ? " activo" : "") + '"';
    cadena = cadena + ' data-filtro="' + valor + '" aria-pressed="' + (activo ? "true" : "false") + '">';
    cadena = cadena + Html.escapar(etiqueta) + "</button>";
    return cadena;
}

function gruposPlataforma(lista, pendientes, vistas) {
    let orden = ["Netflix", "Prime Video", "Disney+", "Max", "Filmin"];
    let mapa = {};
    lista.forEach(function (pelicula) {
        let nombre = pelicula.dondeVer || "Otra plataforma";
        if (!mapa[nombre]) mapa[nombre] = [];
        mapa[nombre].push(pelicula);
    });
    let nombres = Object.keys(mapa).sort(function (a, b) {
        let ia = orden.indexOf(a);
        let ib = orden.indexOf(b);
        if (ia === -1) ia = orden.length;
        if (ib === -1) ib = orden.length;
        if (ia !== ib) return ia - ib;
        return a.localeCompare(b);
    });
    let cadena = "";
    nombres.forEach(function (nombre) {
        cadena = cadena + fila(nombre, mapa[nombre], pendientes, vistas);
    });
    return cadena;
}

function fila(titulo, peliculas, pendientes, vistas) {
    vistas = vistas || [];
    let cadena = '<section class="fila-catalogo"><h2 class="titulo-fila">' + Html.escapar(titulo) + ":</h2>";
    cadena = cadena + '<div class="fila-carteles">';
    peliculas.forEach(function (pelicula) {
        let vista = vistas.indexOf(pelicula.id) !== -1;
        let enLista = !vista && pendientes.indexOf(pelicula.id) !== -1;
        cadena = cadena + '<article class="cartel">';
        if (!vista) {
            cadena = cadena + '<button type="button" class="marca-lista' + (enLista ? " en-lista" : "") + '"';
            cadena = cadena + ' data-id="' + Html.escapar(pelicula.id) + '" data-en-lista="' + (enLista ? "si" : "no") + '"';
            cadena = cadena + ' aria-pressed="' + (enLista ? "true" : "false") + '"';
            cadena = cadena + ' aria-label="' + (enLista ? "Quitar de pendientes" : "Añadir a pendientes") + '">';
            cadena = cadena + '<svg viewBox="0 0 28 36" aria-hidden="true"><path d="M6 0h16v32l-8-6-8 6V0z"></path></svg>';
            cadena = cadena + "</button>";
        }
        cadena = cadena + '<button type="button" class="cartel-abrir" data-id="' + Html.escapar(pelicula.id) + '">';
        cadena = cadena + '<img src="' + Html.escapar(pelicula.cartel) + '" alt="Cartel de ' + Html.escapar(pelicula.titulo) + '">';
        cadena = cadena + "</button>";
        cadena = cadena + '<p class="cartel-titulo">' + Html.escapar(pelicula.titulo) + "</p>";
        if (pelicula.valoracionMedia) {
            cadena = cadena + '<p class="cartel-nota" aria-label="Valoración media ' + pelicula.valoracionMedia + ' de 5">';
            cadena = cadena + "★ " + String(pelicula.valoracionMedia).replace(".", ",") + "</p>";
        }
        cadena = cadena + "</article>";
    });
    cadena = cadena + "</div></section>";
    return cadena;
}

function normalizar(texto) {
    let valor = String(texto || "").toLowerCase();
    let desde = "áéíóúüñ";
    let hacia = "aeiouun";
    let i;
    for (i = 0; i < desde.length; i++) {
        valor = valor.split(desde.charAt(i)).join(hacia.charAt(i));
    }
    return valor.trim();
}
