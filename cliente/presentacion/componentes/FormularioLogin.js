function FormularioLogin(selector) {
    let accesoRapido = new AccesoRapido();

    this.mostrar = function (alEnviar, alIrARegistro) {
        let cadena = '<div id="mLogin" class="pantalla-auth">';
        cadena = cadena + avatarCuenta();
        cadena = cadena + '<h1 class="titulo-auth">Inicia sesión</h1>';
        cadena = cadena + '<form id="formLogin" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="email">Email:</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="email" autocomplete="email" required></div>';
        cadena = cadena + '<div class="form-group"><label for="password">Contraseña:</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="password" autocomplete="current-password" required></div>';
        cadena = cadena + '<div class="fila-acciones">';
        cadena = cadena + '<div class="bloque-registro"><p>¿No eres usuario?</p>';
        cadena = cadena + '<button type="button" id="btnIrRegistro" class="btn btn-oliva">Registro</button></div>';
        cadena = cadena + '<button id="btnLogin" type="submit" class="btn btn-oliva btn-login">Iniciar sesion</button>';
        cadena = cadena + '<div class="hueco-acciones"></div>';
        cadena = cadena + "</div></form>";
        cadena = cadena + accesoRapido.cadena();
        cadena = cadena + "</div>";
        $(selector).html(cadena);

        $("#formLogin").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#email").val().trim(), $("#password").val());
        });
        $("#btnIrRegistro").on("click", function () {
            alIrARegistro();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnLogin").prop("disabled", !habilitado);
    };

    function avatarCuenta() {
        return '<div class="avatar-cuenta" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#5b3d9a"/><path d="M12 54c2-14 12-20 20-20s18 6 20 20" fill="#5b3d9a"/></svg></div>';
    }
}
