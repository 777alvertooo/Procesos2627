function PanelUsuario(selector) {
    this.mostrar = function (usuario, alEliminarCuenta, esAdmin) {
        let cadena = '<div id="mPanel" class="row"><div class="col-12 col-lg-4 mb-3">';
        cadena = cadena + '<div class="card tarjeta"><div class="card-body">';
        cadena = cadena + '<h5 class="card-title">Hola, ' + Html.escapar(usuario.nick) + "</h5>";
        cadena = cadena + '<p class="card-text mb-1"><strong>Email:</strong> ' + Html.escapar(usuario.email) + "</p>";
        cadena = cadena + '<p class="card-text mb-1"><strong>Rol:</strong> ' + Html.escapar(usuario.rol) + "</p>";
        cadena = cadena + '<p class="card-text"><strong>Acceso:</strong> ' + Html.escapar(usuario.origen) + "</p>";
        cadena = cadena + '<button id="btnEliminarCuenta" class="btn btn-outline-danger btn-sm">Eliminar mi cuenta</button>';
        cadena = cadena + "</div></div></div>";
        if (esAdmin) cadena = cadena + '<div id="panelUsuarios" class="col-12 col-lg-8"></div>';
        cadena = cadena + "</div>";
        $(selector).html(cadena);

        $("#btnEliminarCuenta").on("click", function () {
            alEliminarCuenta();
        });
    };
}
