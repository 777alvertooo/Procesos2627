function ListaUsuarios(selector) {
    const COLORES_ESTADO = { activo: "success", pendiente: "warning", eliminado: "secondary" };
    let lista = this;

    this.mostrar = function (alComprobarActivo) {
        let cadena = '<div class="card tarjeta"><div class="card-body">';
        cadena = cadena + '<div id="zonaListaUsuarios">';
        cadena = cadena + '<h5 class="card-title">Usuarios <span id="numUsuarios" class="badge badge-secondary"></span></h5>';
        cadena = cadena + '<form id="formActivo" class="form-inline mb-3" novalidate>';
        cadena = cadena + '<input type="email" class="form-control campo-gris mr-sm-2 mb-2 mb-sm-0" id="emailActivo" placeholder="email del usuario">';
        cadena = cadena + '<button type="submit" class="btn btn-oliva">¿Está activo?</button>';
        cadena = cadena + "</form>";
        cadena = cadena + '<div class="table-responsive"><table class="table table-sm tabla-oscura">';
        cadena = cadena + "<thead><tr><th>Email</th><th>Nick</th><th>Rol</th><th>Estado</th><th></th></tr></thead>";
        cadena = cadena + '<tbody id="tablaUsuarios"></tbody></table></div>';
        cadena = cadena + "</div>";
        cadena = cadena + '<div id="zonaEditarUsuario" class="d-none"></div>';
        cadena = cadena + "</div></div>";
        $(selector).html(cadena);

        $("#formActivo").on("submit", function (evento) {
            evento.preventDefault();
            alComprobarActivo($("#emailActivo").val().trim());
        });
    };

    this.mostrarNumero = function (num) {
        $("#numUsuarios").text(num + " usuarios");
    };

    this.mostrarUsuarios = function (usuarios, alComprobarActivo, alEliminar, alEditar) {
        $("#zonaEditarUsuario").addClass("d-none").empty();
        $("#zonaListaUsuarios").removeClass("d-none");

        let filas = "";
        usuarios.forEach(function (u, i) {
            filas = filas + "<tr><td>" + Html.escapar(u.email) + "</td><td>" + Html.escapar(u.nick) + "</td><td>" + Html.escapar(u.rol) + "</td>";
            filas = filas + '<td><span class="badge badge-' + (COLORES_ESTADO[u.estado] || "light") + '">' + Html.escapar(u.estado) + "</span></td>";
            filas = filas + '<td class="text-nowrap"><button class="btn btn-sm btn-outline-oliva btnActivo" data-i="' + i + '">Activo</button> ';
            if (u.estado !== "eliminado" && u.rol !== "admin") {
                filas = filas + '<button class="btn btn-sm btn-outline-oliva btnEditar" data-i="' + i + '">Editar</button> ';
            }
            if (u.estado !== "eliminado") {
                filas = filas + '<button class="btn btn-sm btn-outline-danger btnEliminar" data-i="' + i + '">Eliminar</button>';
            }
            filas = filas + "</td></tr>";
        });
        $("#tablaUsuarios").html(filas);

        $(".btnActivo").on("click", function () {
            alComprobarActivo(usuarios[$(this).data("i")].email);
        });
        $(".btnEliminar").on("click", function () {
            alEliminar(usuarios[$(this).data("i")].email);
        });
        $(".btnEditar").on("click", function () {
            alEditar(usuarios[$(this).data("i")]);
        });
    };

    this.mostrarEdicion = function (usuario, alGuardar, alCancelar) {
        $("#zonaListaUsuarios").addClass("d-none");
        let cadena = '<h5 class="card-title">Editar usuario</h5>';
        cadena = cadena + '<p class="texto-suave-perfil mb-3">' + Html.escapar(usuario.email) + "</p>";
        cadena = cadena + '<form id="formEditarUsuario" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="nickUsuarioAdmin">Nick</label>';
        cadena = cadena + '<input type="text" class="form-control campo-gris" id="nickUsuarioAdmin" value="' + Html.escapar(usuario.nick) + '" required></div>';
        cadena = cadena + '<div class="form-group"><label for="emailUsuarioAdmin">Email</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="emailUsuarioAdmin" value="' + Html.escapar(usuario.email) + '" required></div>';
        if (usuario.origen === "google") {
            cadena = cadena + '<p class="texto-suave-perfil">Esta cuenta usa Google; no se puede cambiar la contraseña local.</p>';
        } else {
            cadena = cadena + '<hr class="separador-perfil">';
            cadena = cadena + '<p class="texto-suave-perfil">Nueva contraseña (opcional)</p>';
            cadena = cadena + '<div class="form-group"><label for="passwordNuevaAdmin">Nueva contraseña</label>';
            cadena = cadena + '<input type="password" class="form-control campo-gris" id="passwordNuevaAdmin" autocomplete="new-password"></div>';
            cadena = cadena + '<div class="form-group"><label for="confirmarPasswordAdmin">Confirmar contraseña</label>';
            cadena = cadena + '<input type="password" class="form-control campo-gris" id="confirmarPasswordAdmin" autocomplete="new-password"></div>';
        }
        cadena = cadena + '<div class="fila-acciones-centrada mt-3">';
        cadena = cadena + '<button type="button" id="btnCancelarEditarUsuario" class="btn btn-outline-oliva">Cancelar</button>';
        cadena = cadena + '<button type="submit" id="btnGuardarUsuarioAdmin" class="btn btn-oliva">Guardar</button>';
        cadena = cadena + "</div></form>";
        $("#zonaEditarUsuario").html(cadena).removeClass("d-none");

        $("#formEditarUsuario").on("submit", function (evento) {
            evento.preventDefault();
            alGuardar({
                nick: $("#nickUsuarioAdmin").val().trim(),
                email: $("#emailUsuarioAdmin").val().trim(),
                passwordNueva: $("#passwordNuevaAdmin").length ? $("#passwordNuevaAdmin").val() : "",
                confirmarPassword: $("#confirmarPasswordAdmin").length ? $("#confirmarPasswordAdmin").val() : ""
            });
        });
        $("#btnCancelarEditarUsuario").on("click", function () {
            alCancelar();
        });
    };

    this.habilitarEdicion = function (habilitado) {
        $("#btnGuardarUsuarioAdmin").prop("disabled", !habilitado);
    };
}
