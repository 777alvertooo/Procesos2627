function FormularioOlvido(selector) {
    this.mostrar = function (alEnviar, alVolver) {
        let cadena = '<div id="mOlvido" class="pantalla-auth">';
        cadena = cadena + '<h1 class="titulo-auth">Recuperar contraseña</h1>';
        cadena = cadena + '<p class="texto-auth">Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.</p>';
        cadena = cadena + '<form id="formOlvido" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="emailOlvido">Email:</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="emailOlvido" autocomplete="email" required></div>';
        cadena = cadena + '<div class="fila-acciones fila-acciones-centrada">';
        cadena = cadena + '<button type="button" id="btnVolverLogin" class="btn btn-oliva">Volver</button>';
        cadena = cadena + '<button id="btnOlvido" type="submit" class="btn btn-oliva">Enviar enlace</button>';
        cadena = cadena + "</div></form></div>";
        $(selector).html(cadena);

        $("#formOlvido").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#emailOlvido").val().trim());
        });
        $("#btnVolverLogin").on("click", function () {
            alVolver();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnOlvido").prop("disabled", !habilitado);
    };
}
