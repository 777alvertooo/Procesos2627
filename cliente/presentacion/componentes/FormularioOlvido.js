function FormularioOlvido(selector) {
    this.mostrar = function (alEnviar, alVolver) {
        let cadena = '<div id="mOlvido" class="pantalla-auth">';
        cadena = cadena + '<div class="auth-cabecera">';
        cadena = cadena + botonVolver("btnVolverLogin");
        cadena = cadena + '<h1 class="titulo-auth titulo-frase">Recuperación de contraseña</h1>';
        cadena = cadena + '<p class="texto-auth">Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.</p>';
        cadena = cadena + "</div>";
        cadena = cadena + '<form id="formOlvido" novalidate>';
        cadena = cadena + '<div class="form-group"><label for="emailOlvido">Email</label>';
        cadena = cadena + '<input type="email" class="form-control campo-gris" id="emailOlvido" autocomplete="email" required></div>';
        cadena = cadena + '<div class="fila-acciones fila-acciones-centrada">';
        cadena = cadena + '<button id="btnOlvido" type="submit" class="btn btn-oliva">Enviar enlace</button>';
        cadena = cadena + "</div></form></div>";
        $(selector).html(cadena);

        $("#formOlvido").on("submit", function (evento) {
            evento.preventDefault();
            alEnviar($("#emailOlvido").val().trim());
        });
        $("#btnVolverLogin").on("click", function () {
            alVolver();
        });
    };

    this.habilitar = function (habilitado) {
        $("#btnOlvido").prop("disabled", !habilitado);
    };

    function botonVolver(id) {
        let cadena = '<button type="button" id="' + id + '" class="btn-volver" aria-label="Volver">';
        cadena = cadena + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4-1.4 1.4L5.2 12 14 3.2z"></path></svg>';
        cadena = cadena + "</button>";
        return cadena;
    }
}
