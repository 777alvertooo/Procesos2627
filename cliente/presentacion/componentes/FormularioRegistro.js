function FormularioRegistro(selector) {
    let accesoRapido = new AccesoRapido();

    this.mostrar = function (alEnviar, alIrALogin) {
        let cadena = '<div id="mRegistro" class="pantalla-auth">';
        cadena = cadena + avatarCuenta();
        cadena = cadena + '<h1 class="titulo-auth">Registro</h1>';
        cadena = cadena + '<form id="formRegistro" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="nick">Nick:</label>';
        cadena = cadena + '<input type="text" class="form-control campo-gris" id="nick" autocomplete="nickname"></div>';
        cadena = cadena + '<div class="form-group"><label for="email">Email:</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="email" autocomplete="email" required></div>';
        cadena = cadena + '<div class="form-group"><label for="password">Contraseña (mínimo 8 caracteres):</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="password" autocomplete="new-password" required></div>';
        cadena = cadena + '<div class="fila-acciones">';
        cadena = cadena + '<div class="bloque-registro"><p>¿Ya eres usuario?</p>';
        cadena = cadena + '<button type="button" id="btnIrLogin" class="btn btn-oliva">Iniciar sesion</button></div>';
        cadena = cadena + '<button id="btnRegistro" type="submit" class="btn btn-oliva">Registro</button>';
        cadena = cadena + '<div class="hueco-acciones"></div>';
        cadena = cadena + "</div></form>";
        cadena = cadena + accesoRapido.cadena();
        cadena = cadena + "</div>";
        $(selector).html(cadena);

        $("#formRegistro").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#nick").val().trim(), $("#email").val().trim(), $("#password").val());
        });
        $("#btnIrLogin").on("click", function () {
            alIrALogin();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnRegistro").prop("disabled", !habilitado);
    };

    function avatarCuenta() {
        return '<div class="avatar-cuenta" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#5b3d9a"/><path d="M12 54c2-14 12-20 20-20s18 6 20 20" fill="#5b3d9a"/></svg></div>';
    }
}
