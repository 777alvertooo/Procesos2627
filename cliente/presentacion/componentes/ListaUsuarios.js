function ListaUsuarios(selector) {
    const COLORES_ESTADO = { activo: "success", eliminado: "secondary" };

    this.mostrar = function (alComprobarActivo) {
        let cadena = '<div class="card"><div class="card-body">';
        cadena = cadena + '<h5 class="card-title">Usuarios <span id="numUsuarios" class="badge badge-secondary"></span></h5>';
        cadena = cadena + '<form id="formActivo" class="form-inline mb-3" novalidate>';
        cadena = cadena + '<input type="email" class="form-control mr-sm-2 mb-2 mb-sm-0" id="emailActivo" placeholder="email del usuario">';
        cadena = cadena + '<button type="submit" class="btn btn-info">¿Está activo?</button>';
        cadena = cadena + "</form>";
        cadena = cadena + '<div class="table-responsive"><table class="table table-sm table-striped">';
        cadena = cadena + "<thead><tr><th>Email</th><th>Nick</th><th>Estado</th><th></th></tr></thead>";
        cadena = cadena + '<tbody id="tablaUsuarios"></tbody></table></div>';
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

    this.mostrarUsuarios = function (usuarios, alComprobarActivo, alEliminar) {
        let filas = "";
        usuarios.forEach(function (u, i) {
            filas = filas + "<tr><td>" + Html.escapar(u.email) + "</td><td>" + Html.escapar(u.nick) + "</td>";
            filas = filas + '<td><span class="badge badge-' + (COLORES_ESTADO[u.estado] || "light") + '">' + Html.escapar(u.estado) + "</span></td>";
            filas = filas + '<td class="text-nowrap"><button class="btn btn-sm btn-outline-info btnActivo" data-i="' + i + '">Activo</button> ';
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
    };
}
