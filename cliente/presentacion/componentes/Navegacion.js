function Navegacion(selector) {
    this.mostrar = function (usuario, alCerrarSesion) {
        if (!usuario) {
            $("body").removeClass("con-sesion").addClass("sin-sesion");
            return $(selector).empty();
        }
        $("body").removeClass("sin-sesion").addClass("con-sesion");
        let cadena = '<span class="navbar-text mr-3">' + Html.escapar(usuario.nick) + "</span>";
        cadena = cadena + '<button id="btnSalir" class="btn btn-salir btn-sm">Cerrar sesión</button>';
        $(selector).html(cadena);
        $("#btnSalir").on("click", function () {
            alCerrarSesion();
        });
    };
}
