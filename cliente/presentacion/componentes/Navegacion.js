function Navegacion(selector) {
    this.mostrar = function (usuario, alCerrarSesion) {
        if (!usuario) {
            return $(selector).empty();
        }
        let cadena = '<span class="navbar-text text-light mr-3">' + Html.escapar(usuario.nick) + "</span>";
        cadena = cadena + '<button id="btnSalir" class="btn btn-outline-light btn-sm">Cerrar sesión</button>';
        $(selector).html(cadena);
        $("#btnSalir").on("click", function () {
            alCerrarSesion();
        });
    };
}
