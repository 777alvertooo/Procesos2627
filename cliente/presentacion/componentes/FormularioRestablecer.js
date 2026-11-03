function FormularioRestablecer(selector) {
    this.mostrar = function (alEnviar, alVolver) {
        let cadena = '<div id="mRestablecer" class="pantalla-auth">';
        cadena = cadena + '<div class="auth-cabecera">';
        cadena = cadena + botonVolver("btnCancelarRestablecer");
        cadena = cadena + '<h1 class="titulo-auth titulo-frase">Nueva contraseña</h1>';
        cadena = cadena + '<p class="texto-auth">Elige una contraseña nueva (mínimo 8 caracteres).</p>';
        cadena = cadena + "</div>";
        cadena = cadena + '<form id="formRestablecer" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="passwordNueva">Contraseña</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="passwordNueva" autocomplete="new-password" required></div>';
        cadena = cadena + '<div class="form-group"><label for="confirmarPasswordNueva">Confirmar contraseña</label>';
        cadena = cadena + '<input type="password" class="form-control campo-gris" id="confirmarPasswordNueva" autocomplete="new-password" required></div>';
        cadena = cadena + '<div class="fila-acciones fila-acciones-centrada">';
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

    function botonVolver(id) {
        let cadena = '<button type="button" id="' + id + '" class="btn-volver" aria-label="Volver">';
        cadena = cadena + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4-1.4 1.4L5.2 12 14 3.2z"></path></svg>';
        cadena = cadena + "</button>";
        return cadena;
    }
}
