function FormularioPelicula(selector) {
    this.mostrar = function (pelicula, alGuardar, alCancelar) {
        let nueva = !pelicula || !pelicula.id;
        let tipo = pelicula && pelicula.tipo === "plataforma" ? "plataforma" : "cine";
        let medio = pelicula && pelicula.medio === "serie" ? "serie" : "pelicula";
        let cadena = '<form id="formPelicula" class="formulario-pelicula" novalidate>';
        cadena = cadena + "<h1 class=\"titulo-vista\">" + tituloFormulario(nueva, medio) + "</h1>";
        cadena = cadena + campo("tituloPelicula", "Título", "text", pelicula && pelicula.titulo ? pelicula.titulo : "");
        cadena = cadena + '<div class="form-group"><label for="sinopsisPelicula">Sinopsis</label>';
        cadena = cadena + '<textarea id="sinopsisPelicula" class="form-control campo-gris campo-area" maxlength="1000" required>';
        cadena = cadena + Html.escapar(pelicula && pelicula.sinopsis ? pelicula.sinopsis : "") + "</textarea></div>";
        cadena = cadena + '<div class="form-group"><label for="medioPelicula">Tipo</label>';
        cadena = cadena + '<select id="medioPelicula" class="form-control campo-gris">';
        cadena = cadena + '<option value="pelicula"' + (medio === "pelicula" ? " selected" : "") + ">Película</option>";
        cadena = cadena + '<option value="serie"' + (medio === "serie" ? " selected" : "") + ">Serie</option>";
        cadena = cadena + "</select></div>";
        cadena = cadena + '<div class="form-group"><label for="tipoPelicula">Dónde se ve</label>';
        cadena = cadena + '<select id="tipoPelicula" class="form-control campo-gris">';
        cadena = cadena + '<option value="cine"' + (tipo === "cine" ? " selected" : "") + ">En cines</option>";
        cadena = cadena + '<option value="plataforma"' + (tipo === "plataforma" ? " selected" : "") + ">En plataforma</option>";
        cadena = cadena + "</select></div>";
        cadena = cadena + '<div class="form-group" id="grupoCines"><label for="cinesPelicula">Cines</label>';
        cadena = cadena + '<textarea id="cinesPelicula" class="form-control campo-gris campo-area" placeholder="Un cine por línea">';
        cadena = cadena + Html.escapar(cinesTexto(pelicula)) + "</textarea></div>";
        cadena = cadena + '<div class="form-group" id="grupoPlataforma"><label for="plataformaPelicula">Plataforma</label>';
        cadena = cadena + '<input type="text" id="plataformaPelicula" class="form-control campo-gris" maxlength="80" value="';
        cadena = cadena + Html.escapar(plataformaTexto(pelicula)) + '"></div>';
        cadena = cadena + '<div class="form-group" id="grupoTemporadas"><label for="temporadasPelicula">Capítulos por temporada</label>';
        cadena = cadena + '<textarea id="temporadasPelicula" class="form-control campo-gris campo-area" placeholder="Un número por línea, en orden de temporada">';
        cadena = cadena + Html.escapar(temporadasTexto(pelicula)) + "</textarea></div>";
        cadena = cadena + campo("cartelPelicula", "Enlace del cartel", "url", pelicula ? pelicula.cartel : "");
        cadena = cadena + campo("trailerPelicula", "Tráiler de YouTube", "text", pelicula ? pelicula.trailerUrl : "");
        cadena = cadena + '<div class="ficha-acciones">';
        cadena = cadena + '<button type="button" id="btnCancelarPelicula" class="btn btn-outline-oliva">Cancelar</button>';
        cadena = cadena + '<button type="submit" id="btnGuardarPelicula" class="btn btn-oliva">Guardar</button>';
        cadena = cadena + "</div></form>";
        $(selector).html(cadena);
        alternarMedio();
        $("#medioPelicula").on("change", function () {
            $("#formPelicula h1").text(tituloFormulario(nueva, $("#medioPelicula").val()));
            alternarMedio();
        });
        $("#tipoPelicula").on("change", alternarTipo);
        $("#formPelicula").on("submit", function (evento) {
            evento.preventDefault();
            alGuardar(leerFormulario());
        });
        $("#btnCancelarPelicula").on("click", alCancelar);
    };

    this.habilitar = function (activo) {
        $("#btnGuardarPelicula").prop("disabled", !activo);
    };
}

function campo(id, etiqueta, tipo, valor) {
    let cadena = '<div class="form-group"><label for="' + id + '">' + Html.escapar(etiqueta) + "</label>";
    cadena = cadena + '<input type="' + tipo + '" id="' + id + '" class="form-control campo-gris" value="' + Html.escapar(valor || "") + '" required>';
    cadena = cadena + "</div>";
    return cadena;
}

function cinesTexto(pelicula) {
    if (!pelicula || !pelicula.cines) return "";
    return pelicula.cines.join("\n");
}

function plataformaTexto(pelicula) {
    if (!pelicula || pelicula.tipo !== "plataforma") return "";
    return pelicula.dondeVer || "";
}

function leerFormulario() {
    return {
        titulo: $("#tituloPelicula").val(),
        sinopsis: $("#sinopsisPelicula").val(),
        medio: $("#medioPelicula").val(),
        tipo: $("#tipoPelicula").val(),
        cines: $("#cinesPelicula").val(),
        dondeVer: $("#plataformaPelicula").val(),
        temporadas: $("#temporadasPelicula").val(),
        cartel: $("#cartelPelicula").val(),
        trailer: $("#trailerPelicula").val()
    };
}

function tituloFormulario(nueva, medio) {
    if (!nueva) return medio === "serie" ? "Editar serie" : "Editar película";
    return medio === "serie" ? "Nueva serie" : "Nueva película";
}

function temporadasTexto(pelicula) {
    if (!pelicula || !pelicula.temporadas) return "";
    return pelicula.temporadas.map(function (temporada) { return temporada.capitulos; }).join("\n");
}

function alternarMedio() {
    let serie = $("#medioPelicula").val() === "serie";
    $("#tipoPelicula option[value='cine']").prop("disabled", serie);
    if (serie && $("#tipoPelicula").val() === "cine") $("#tipoPelicula").val("plataforma");
    $("#grupoTemporadas").toggle(serie);
    alternarTipo();
}

function alternarTipo() {
    let enCines = $("#tipoPelicula").val() === "cine";
    $("#grupoCines").toggle(enCines);
    $("#grupoPlataforma").toggle(!enCines);
}
