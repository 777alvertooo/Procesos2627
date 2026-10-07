function FormularioLogin(selector) {
    this.mostrar = function (alEnviar, alIrARegistro) {
        let cadena = '<div id="mLogin" class="row justify-content-center"><div class="col-12 col-md-6 col-lg-4">';
        cadena = cadena + '<h3 class="mb-3">Iniciar sesión</h3>';
        cadena = cadena + '<form id="formLogin" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="email">Email:</label>';
        cadena = cadena + '<input type="email" class="form-control" id="email" autocomplete="email" required></div>';
        cadena = cadena + '<div class="form-group"><label for="password">Contraseña:</label>';
        cadena = cadena + '<input type="password" class="form-control" id="password" autocomplete="current-password" required></div>';
        cadena = cadena + '<button id="btnLogin" type="submit" class="btn btn-primary btn-block">Entrar</button>';
        cadena = cadena + "</form>";
        cadena = cadena + '<p class="mt-3 text-center">¿No tienes cuenta? <a href="#" id="enlaceRegistro">Regístrate</a></p>';
        cadena = cadena + "</div></div>";
        $(selector).html(cadena);

        $("#formLogin").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#email").val().trim(), $("#password").val());
        });
        $("#enlaceRegistro").on("click", function (evento) {
            evento.preventDefault();
            alIrARegistro();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnLogin").prop("disabled", !habilitado);
    };
}
