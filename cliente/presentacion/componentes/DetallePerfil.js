function DetallePerfil(selector) {
    this.mostrar = function (usuario, alEditar) {
        let cadena = '<div class="card tarjeta tarjeta-detalle"><div class="card-body">';
        cadena = cadena + '<div class="detalle-cabecera">';
        cadena = cadena + '<h4 class="card-title mb-0">Mis datos</h4>';
        cadena = cadena + '<button type="button" id="btnEditarPerfil" class="btn btn-oliva btn-sm">Editar</button>';
        cadena = cadena + "</div>";
        cadena = cadena + '<div class="detalle-campos">';
        cadena = cadena + fila("Nick", usuario.nick);
        cadena = cadena + fila("Email", usuario.email);
        cadena = cadena + fila("Rol", usuario.rol);
        cadena = cadena + fila("Acceso", usuario.origen);
        cadena = cadena + fila("Estado", usuario.estado);
        cadena = cadena + "</div></div></div>";
        $(selector).html(cadena);

        $("#btnEditarPerfil").on("click", function () {
            alEditar();
        });
    };

    this.mostrarEdicion = function (usuario, alGuardar, alCancelar) {
        let cadena = '<div class="card tarjeta tarjeta-detalle"><div class="card-body">';
        cadena = cadena + '<h4 class="card-title">Editar perfil</h4>';
        cadena = cadena + '<form id="formEditarPerfil" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="nickPerfil">Nick</label>';
        cadena = cadena + '<input type="text" class="form-control campo-gris" id="nickPerfil" value="' + Html.escapar(usuario.nick) + '" required></div>';
        cadena = cadena + '<div class="form-group"><label for="emailPerfil">Email</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="emailPerfil" value="' + Html.escapar(usuario.email) + '" required></div>';
        cadena = cadena + '<hr class="separador-perfil">';
        cadena = cadena + '<p class="texto-suave-perfil">Cambiar contraseña (opcional)</p>';
        if (usuario.origen === "google") {
            cadena = cadena + '<p class="texto-suave-perfil">Tu cuenta usa Google; no puedes cambiar una contraseña local desde aquí.</p>';
        } else {
            cadena = cadena + '<div class="form-group"><label for="passwordActual">Contraseña actual</label>';
            cadena = cadena + '<input type="password" class="form-control campo-gris" id="passwordActual" autocomplete="current-password"></div>';
            cadena = cadena + '<div class="form-group"><label for="passwordNueva">Nueva contraseña</label>';
            cadena = cadena + '<input type="password" class="form-control campo-gris" id="passwordNueva" autocomplete="new-password"></div>';
            cadena = cadena + '<div class="form-group"><label for="confirmarPasswordPerfil">Confirmar nueva contraseña</label>';
            cadena = cadena + '<input type="password" class="form-control campo-gris" id="confirmarPasswordPerfil" autocomplete="new-password"></div>';
        }
        cadena = cadena + '<div class="fila-acciones-centrada mt-3">';
        cadena = cadena + '<button type="button" id="btnCancelarPerfil" class="btn btn-outline-oliva">Cancelar</button>';
        cadena = cadena + '<button type="submit" id="btnGuardarPerfil" class="btn btn-oliva">Guardar</button>';
        cadena = cadena + "</div></form></div></div>";
        $(selector).html(cadena);

        $("#formEditarPerfil").on("submit", function (evento) {
            evento.preventDefault();
            alGuardar({
                nick: $("#nickPerfil").val().trim(),
                email: $("#emailPerfil").val().trim(),
                passwordActual: $("#passwordActual").length ? $("#passwordActual").val() : "",
                passwordNueva: $("#passwordNueva").length ? $("#passwordNueva").val() : "",
                confirmarPassword: $("#confirmarPasswordPerfil").length ? $("#confirmarPasswordPerfil").val() : ""
            });
        });
        $("#btnCancelarPerfil").on("click", function () {
            alCancelar();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnGuardarPerfil").prop("disabled", !habilitado);
    };

    function fila(etiqueta, valor) {
        return '<div class="detalle-fila"><span class="detalle-etiqueta">' + Html.escapar(etiqueta)
            + '</span><span class="detalle-valor">' + Html.escapar(valor) + "</span></div>";
    }
}
