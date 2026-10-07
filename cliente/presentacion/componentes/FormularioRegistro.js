function FormularioRegistro(selector) {
    this.mostrar = function (alEnviar, alIrALogin) {
        let cadena = '<div id="mRegistro" class="row justify-content-center"><div class="col-12 col-md-6 col-lg-4">';
        cadena = cadena + '<h3 class="mb-3">Crear cuenta</h3>';
        cadena = cadena + '<form id="formRegistro" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="nick">Nick:</label>';
        cadena = cadena + '<input type="text" class="form-control" id="nick" autocomplete="nickname"></div>';
        cadena = cadena + '<div class="form-group"><label for="email">Email:</label>';
        cadena = cadena + '<input type="email" class="form-control" id="email" autocomplete="email" required></div>';
        cadena = cadena + '<div class="form-group"><label for="password">Contraseña (mínimo 8 caracteres):</label>';
        cadena = cadena + '<input type="password" class="form-control" id="password" autocomplete="new-password" required></div>';
        cadena = cadena + '<button id="btnRegistro" type="submit" class="btn btn-primary btn-block">Registrarme</button>';
        cadena = cadena + "</form>";
        cadena = cadena + '<p class="mt-3 text-center">¿Ya tienes cuenta? <a href="#" id="enlaceLogin">Inicia sesión</a></p>';
        cadena = cadena + "</div></div>";
        $(selector).html(cadena);

        $("#formRegistro").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#nick").val().trim(), $("#email").val().trim(), $("#password").val());
        });
        $("#enlaceLogin").on("click", function (evento) {
            evento.preventDefault();
            alIrALogin();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnRegistro").prop("disabled", !habilitado);
    };
}
