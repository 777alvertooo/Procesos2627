function Navegacion(selector) {
    this.mostrar = function (usuario, acciones) {
        if (!usuario) {
            $("body").removeClass("con-sesion").addClass("sin-sesion");
            return $(selector).empty();
        }
        acciones = acciones || {};
        $("body").removeClass("sin-sesion").addClass("con-sesion");
        let cadena = '<div class="nav-enlaces">';
        cadena = cadena + '<button type="button" id="btnNavInicio" class="btn-nav">Inicio</button>';
        cadena = cadena + '<button type="button" id="btnNavPeliculas" class="btn-nav">Películas</button>';
        cadena = cadena + '<button type="button" id="btnNavSeries" class="btn-nav">Series</button>';
        cadena = cadena + '<button type="button" id="btnNavMatch" class="btn-nav">Match</button>';
        cadena = cadena + '<button type="button" id="btnNavLista" class="btn-nav">Mi lista</button>';
        cadena = cadena + "</div>";
        cadena = cadena + '<button type="button" id="btnNavCuenta" class="btn-usuario">' + Html.escapar(usuario.nick) + "</button>";
        $(selector).html(cadena);
        $("#btnNavInicio").toggleClass("activo", acciones.vista === "inicio");
        $("#btnNavPeliculas").toggleClass("activo", acciones.vista === "peliculas");
        $("#btnNavSeries").toggleClass("activo", acciones.vista === "series");
        $("#btnNavMatch").toggleClass("activo", acciones.vista === "match");
        $("#btnNavLista").toggleClass("activo", acciones.vista === "lista");
        $("#btnNavCuenta").toggleClass("activo", acciones.vista === "cuenta");
        $("#btnNavInicio").on("click", acciones.alInicio);
        $("#btnNavPeliculas").on("click", acciones.alPeliculas);
        $("#btnNavSeries").on("click", acciones.alSeries);
        $("#btnNavMatch").on("click", acciones.alMatch);
        $("#btnNavLista").on("click", acciones.alLista);
        $("#btnNavCuenta").on("click", acciones.alCuenta);
    };
}
