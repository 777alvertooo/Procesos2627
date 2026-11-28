function FormularioRegistro(selector) {
    let accesoRapido = new AccesoRapido();
    let fondoCine = new FondoCine();

    this.mostrar = function (alEnviar, alIrALogin) {
        let cadena = '<div id="mRegistro" class="pantalla-auth pantalla-login">';
        cadena = cadena + fondoCine.cadena();
        cadena = cadena + '<div class="tarjeta-login tarjeta-registro">';
        cadena = cadena + '<div class="auth-cabecera">';
        cadena = cadena + avatarCuenta();
        cadena = cadena + '<h1 class="titulo-auth">Registro</h1>';
        cadena = cadena + "</div>";
        cadena = cadena + '<form id="formRegistro" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="nick">Nick</label>';
        cadena = cadena + '<input type="text" class="form-control campo-gris" id="nick" autocomplete="nickname"></div>';
        cadena = cadena + '<div class="form-group"><label for="email">Email</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="email" autocomplete="email" required></div>';
        cadena = cadena + '<div class="form-group"><label for="password">Contraseña (mínimo 8 caracteres)</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="password" autocomplete="new-password" required></div>';
        cadena = cadena + '<div class="form-group"><label for="confirmarPassword">Confirmar contraseña</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="confirmarPassword" autocomplete="new-password" required></div>';
        cadena = cadena + '<button id="btnRegistro" type="submit" class="btn btn-oliva btn-login-principal">Registro</button>';
        cadena = cadena + '<p class="bloque-registro-login">¿Ya eres usuario? ';
        cadena = cadena + '<button type="button" id="btnIrLogin" class="btn-enlace">Inicia sesión</button></p>';
        cadena = cadena + "</form>";
        cadena = cadena + accesoRapido.cadena();
        cadena = cadena + "</div></div>";
        $(selector).html(cadena);
        fondoCine.activar();

        $("#formRegistro").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar(
                $("#nick").val().trim(),
                $("#email").val().trim(),
                $("#password").val(),
                $("#confirmarPassword").val()
            );
        });
        $("#btnIrLogin").on("click", function () {
            alIrALogin();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnRegistro").prop("disabled", !habilitado);
    };

    function avatarCuenta() {
        return '<div class="avatar-cuenta" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#111"/><path d="M12 54c2-14 12-20 20-20s18 6 20 20" fill="#111"/></svg></div>';
    }
}
