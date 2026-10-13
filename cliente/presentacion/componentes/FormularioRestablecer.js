function FormularioRestablecer(selector) {
    this.mostrar = function (alEnviar, alVolver) {
        let cadena = '<div id="mRestablecer" class="pantalla-auth">';
        cadena = cadena + '<h1 class="titulo-auth">Nueva contraseña</h1>';
        cadena = cadena + '<p class="texto-auth">Elige una contraseña nueva (mínimo 8 caracteres).</p>';
        cadena = cadena + '<form id="formRestablecer" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="passwordNueva">Nueva contraseña:</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="passwordNueva" autocomplete="new-password" required></div>';
        cadena = cadena + '<div class="form-group"><label for="confirmarPasswordNueva">Confirmar contraseña:</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="confirmarPasswordNueva" autocomplete="new-password" required></div>';
        cadena = cadena + '<div class="fila-acciones fila-acciones-centrada">';
        cadena = cadena + '<button type="button" id="btnCancelarRestablecer" class="btn btn-oliva">Cancelar</button>';
        cadena = cadena + '<button id="btnRestablecer" type="submit" class="btn btn-oliva">Guardar</button>';
        cadena = cadena + "</div></form></div>";
        $(selector).html(cadena);

        $("#formRestablecer").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#passwordNueva").val(), $("#confirmarPasswordNueva").val());
        });
        $("#btnCancelarRestablecer").on("click", function () {
            alVolver();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnRestablecer").prop("disabled", !habilitado);
    };
}
