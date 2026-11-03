function PantallaMatch(selector) {
    let temporizador = null;
    let firma = "";

    this.detener = function () {
        if (temporizador) clearTimeout(temporizador);
        temporizador = null;
    };

    this.mostrar = function (vista, acciones) {
        this.detener();
        let nueva = firmaDe(vista);
        if (nueva !== firma) {
            firma = nueva;
            if (!vista) pintarMenu(selector, acciones);
            else if (vista.local === "crear") pintarCrear(selector, acciones);
            else if (vista.local === "unirse") pintarUnirse(selector, acciones);
            else pintarPartida(selector, vista, acciones);
        }
        if (vista && (vista.estado === "esperando" || vista.estado === "eligiendo" || vista.estado === "agotada")) {
            temporizador = setTimeout(function () { acciones.alActualizar(); }, 1500);
        }
    };
}

function firmaDe(vista) {
    if (!vista) return "menu";
    if (vista.local) return vista.local;
    return JSON.stringify({
        estado: vista.estado,
        ronda: vista.ronda,
        mi: vista.miEleccion,
        rival: vista.rivalListo,
        conectado: vista.rivalConectado,
        ids: (vista.opciones || []).map(function (opcion) { return opcion.id; }),
        match: vista.match && vista.match.id,
        yoReinicia: vista.yoReinicia,
        rivalReinicia: vista.rivalReinicia
    });
}

function pintarMenu(selector, acciones) {
    let cadena = '<section class="match-panel">';
    cadena = cadena + "<h1>Match</h1>";
    cadena = cadena + '<p class="texto-vista">Crea una sesión o únete con el código de otra persona. Os saldrán dos títulos y cada uno elige uno. Si coincidís, esa es la que veis.</p>';
    cadena = cadena + '<div class="match-acciones">';
    cadena = cadena + '<button type="button" id="btnCrearMatch" class="btn btn-oliva">Crear sesión</button>';
    cadena = cadena + '<button type="button" id="btnUnirseMatch" class="btn btn-outline-oliva">Unirse a una sesión</button>';
    cadena = cadena + "</div></section>";
    $(selector).html(cadena);
    $("#btnCrearMatch").on("click", acciones.alCrear);
    $("#btnUnirseMatch").on("click", acciones.alUnirse);
}

function pintarCrear(selector, acciones) {
    let cadena = '<section class="match-panel">';
    cadena = cadena + flechaVolver("btnVolverMatch");
    cadena = cadena + "<h1>Crear sesión</h1>";
    cadena = cadena + '<form id="formMatch" class="match-form">';
    cadena = cadena + campoMedio();
    cadena = cadena + '<div id="grupoTipoMatch">';
    cadena = cadena + '<label for="tipoMatch">¿Qué tipo de película?</label>';
    cadena = cadena + '<select id="tipoMatch" class="form-control campo-gris">';
    cadena = cadena + '<option value="cine">En cines</option>';
    cadena = cadena + '<option value="plataforma">En plataforma</option>';
    cadena = cadena + "</select></div>";
    cadena = cadena + '<div id="grupoPlataformaMatch">';
    cadena = cadena + '<label for="plataformaMatch">¿De qué plataforma las quieres elegir?</label>';
    cadena = cadena + '<select id="plataformaMatch" class="form-control campo-gris">';
    cadena = cadena + '<option value="cualquiera">-</option>';
    cadena = cadena + "<option>Netflix</option><option>Prime Video</option><option>Disney+</option><option>Max</option><option>Filmin</option>";
    cadena = cadena + "</select></div>";
    cadena = cadena + '<div class="match-acciones">';
    cadena = cadena + '<button type="submit" class="btn btn-oliva">Crear</button>';
    cadena = cadena + "</div></form></section>";
    $(selector).html(cadena);
    alternarFiltroMatch();
    $("#medioMatch, #tipoMatch").on("change", alternarFiltroMatch);
    $("#btnVolverMatch").on("click", acciones.alMenu);
    $("#formMatch").on("submit", function (evento) {
        evento.preventDefault();
        let medio = $("#medioMatch").val();
        let tipo = medio === "serie" ? "cualquiera" : $("#tipoMatch").val();
        let plataforma = "cualquiera";
        if (tipo !== "cine") plataforma = $("#plataformaMatch").val() || "cualquiera";
        acciones.alConfirmarCrear({
            medio: medio,
            tipo: tipo,
            plataforma: plataforma
        });
    });
}

function campoMedio() {
    let cadena = '<label for="medioMatch">¿Qué queréis ver?</label>';
    cadena = cadena + '<select id="medioMatch" class="form-control campo-gris">';
    cadena = cadena + '<option value="pelicula">Película</option>';
    cadena = cadena + '<option value="serie">Serie</option>';
    cadena = cadena + "</select>";
    return cadena;
}

function flechaVolver(id) {
    let cadena = '<button type="button" id="' + id + '" class="btn-volver match-volver" aria-label="Volver">';
    cadena = cadena + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4-1.4 1.4L5.2 12 14 3.2z"></path></svg>';
    cadena = cadena + "</button>";
    return cadena;
}

function alternarFiltroMatch() {
    let serie = $("#medioMatch").val() === "serie";
    let cine = !serie && $("#tipoMatch").val() === "cine";
    $("#grupoTipoMatch").toggleClass("d-none", serie);
    $("#grupoPlataformaMatch").toggleClass("d-none", cine);
}

function pintarUnirse(selector, acciones) {
    let cadena = '<section class="match-panel">';
    cadena = cadena + flechaVolver("btnVolverMatch");
    cadena = cadena + "<h1>Unirse a una sesión</h1>";
    cadena = cadena + '<form id="formUnirse" class="match-form">';
    cadena = cadena + '<label for="codigoMatch">Código:</label>';
    cadena = cadena + '<input id="codigoMatch" class="form-control campo-gris codigo-match-input" maxlength="6" autocomplete="off">';
    cadena = cadena + '<div class="match-acciones">';
    cadena = cadena + '<button type="submit" class="btn btn-oliva">Unirse</button>';
    cadena = cadena + "</div></form></section>";
    $(selector).html(cadena);
    $("#btnVolverMatch").on("click", acciones.alMenu);
    $("#formUnirse").on("submit", function (evento) {
        evento.preventDefault();
        acciones.alConfirmarUnirse($("#codigoMatch").val());
    });
}

function pintarPartida(selector, vista, acciones) {
    let cadena = '<section class="match-panel">';
    if (vista.estado === "esperando") cadena = cadena + flechaVolver("btnVolverMatch") + esperandoHtml(vista);
    else if (vista.estado === "match") cadena = cadena + matchHtml(vista);
    else if (vista.estado === "agotada") cadena = cadena + agotadaHtml(vista);
    else cadena = cadena + eligiendoHtml(vista);
    cadena = cadena + "</section>";
    $(selector).html(cadena);
    $("#btnCerrarMatch").on("click", acciones.alCerrar);
    $("#btnVolverMatch").on("click", acciones.alMenu);
    $(".opcion-match").on("click", function () {
        if (vista.miEleccion) return;
        acciones.alElegir($(this).attr("data-id"));
    });
    $("#btnReiniciarMatch").on("click", function () {
        acciones.alReiniciar();
    });
    $("#btnFichaMatch").on("click", function () {
        acciones.alFicha($(this).attr("data-id"));
    });
}

function esperandoHtml(vista) {
    let cadena = "<h1>Sesión creada</h1>";
    cadena = cadena + '<p class="texto-vista match-codigo-texto">El código de la sala es:</p>';
    cadena = cadena + '<p class="codigo-match">' + Html.escapar(vista.codigo) + "</p>";
    cadena = cadena + '<p class="texto-vista">Esperando a la otra persona...</p>';
    cadena = cadena + '<button type="button" id="btnCerrarMatch" class="btn btn-oliva">Cerrar la sesión</button>';
    return cadena;
}

function eligiendoHtml(vista) {
    let cadena = '<p class="match-ronda">Ronda ' + vista.ronda + " de " + vista.maxRondas + "</p>";
    cadena = cadena + "<h1>Elige una</h1>";
    cadena = cadena + '<p class="texto-vista">' + Html.escapar(textoFiltro(vista.filtro)) + " · código " + Html.escapar(vista.codigo) + "</p>";
    if (vista.miEleccion) cadena = cadena + '<p class="texto-vista">Esperando a que la otra persona elija.</p>';
    else if (vista.rivalListo) cadena = cadena + '<p class="texto-vista">La otra persona ya ha elegido.</p>';
    cadena = cadena + '<div class="match-tablero">';
    (vista.opciones || []).forEach(function (opcion) {
        let elegida = vista.miEleccion === opcion.id;
        cadena = cadena + '<button type="button" class="opcion-match' + (elegida ? " elegida" : "") + '" data-id="' + Html.escapar(opcion.id) + '"' + (vista.miEleccion ? " disabled" : "") + ">";
        cadena = cadena + '<img src="' + Html.escapar(opcion.cartel) + '" alt="Cartel de ' + Html.escapar(opcion.titulo) + '">';
        cadena = cadena + "<span>" + Html.escapar(opcion.titulo) + "</span>";
        cadena = cadena + "</button>";
    });
    cadena = cadena + "</div>";
    cadena = cadena + '<button type="button" id="btnCerrarMatch" class="btn btn-outline-oliva">Cerrar la partida</button>';
    return cadena;
}

function matchHtml(vista) {
    let pelicula = vista.match;
    let cadena = '<p class="match-ronda">Ronda ' + vista.ronda + " de " + vista.maxRondas + "</p>";
    cadena = cadena + "<h1>Match</h1>";
    cadena = cadena + '<p class="texto-vista">Habéis elegido la misma. Esta es la que vais a ver.</p>';
    cadena = cadena + '<article class="ficha-grid match-ficha">';
    cadena = cadena + '<img class="ficha-cartel" src="' + Html.escapar(pelicula.cartel) + '" alt="Cartel de ' + Html.escapar(pelicula.titulo) + '">';
    cadena = cadena + "<div>";
    cadena = cadena + "<h2>" + Html.escapar(pelicula.titulo) + "</h2>";
    cadena = cadena + '<p class="ficha-dato">' + Html.escapar(pelicula.dondeVer) + "</p>";
    if (pelicula.tipo === "cine" && pelicula.cines && pelicula.cines.length) {
        cadena = cadena + '<p class="ficha-dato">' + pelicula.cines.map(Html.escapar).join(" · ") + "</p>";
    }
    cadena = cadena + '<h2 class="titulo-sinopsis">Sinopsis</h2>';
    cadena = cadena + '<p class="ficha-sinopsis">' + Html.escapar(pelicula.sinopsis) + "</p>";
    cadena = cadena + temporadasMatch(pelicula);
    if (pelicula.trailerUrl) {
        cadena = cadena + '<p><a class="btn btn-oliva btn-sm" href="' + Html.escapar(pelicula.trailerUrl) + '" target="_blank" rel="noopener noreferrer">Ver tráiler</a></p>';
    }
    cadena = cadena + "</div></article>";
    cadena = cadena + '<div class="match-acciones">';
    cadena = cadena + '<button type="button" id="btnFichaMatch" class="btn btn-oliva" data-id="' + Html.escapar(pelicula.id) + '">Ver la ficha</button>';
    cadena = cadena + '<button type="button" id="btnCerrarMatch" class="btn btn-outline-oliva">Cerrar la partida</button>';
    cadena = cadena + "</div>";
    return cadena;
}

function agotadaHtml(vista) {
    let cadena = "<h1>Sin coincidencia</h1>";
    cadena = cadena + '<p class="texto-vista">Habéis hecho las 10 rondas sin elegir el mismo título. Para volver a elegir, los dos tenéis que pulsar volver a empezar.</p>';
    if (vista.yoReinicia && !vista.rivalReinicia) {
        cadena = cadena + '<p class="texto-vista">Esperando a que la otra persona también quiera volver a empezar.</p>';
    } else if (vista.rivalReinicia && !vista.yoReinicia) {
        cadena = cadena + '<p class="texto-vista">La otra persona quiere volver a empezar.</p>';
    }
    cadena = cadena + '<div class="match-acciones">';
    if (!vista.yoReinicia) cadena = cadena + '<button type="button" id="btnReiniciarMatch" class="btn btn-oliva">Volver a empezar</button>';
    cadena = cadena + '<button type="button" id="btnCerrarMatch" class="btn btn-outline-oliva">Cerrar la partida</button>';
    cadena = cadena + "</div>";
    return cadena;
}

function temporadasMatch(pelicula) {
    if (pelicula.medio !== "serie" || !pelicula.temporadas || !pelicula.temporadas.length) return "";
    let cadena = '<h2 class="titulo-sinopsis">Temporadas</h2><ul class="lista-temporadas">';
    pelicula.temporadas.forEach(function (temporada) {
        let capitulos = temporada.capitulos === 1 ? "capítulo" : "capítulos";
        cadena = cadena + "<li>Temporada " + temporada.numero + " · " + temporada.capitulos + " " + capitulos + "</li>";
    });
    return cadena + "</ul>";
}

function textoFiltro(filtro) {
    if (!filtro) return "";
    let texto = filtro.medio === "serie" ? "Series" : "Películas";
    if (filtro.medio === "pelicula" && filtro.tipo === "cine") texto = texto + " en cines";
    if (filtro.medio === "pelicula" && filtro.tipo === "plataforma") texto = texto + " en plataforma";
    if (filtro.plataforma && filtro.plataforma !== "cualquiera") texto = texto + " · " + filtro.plataforma;
    return texto;
}
