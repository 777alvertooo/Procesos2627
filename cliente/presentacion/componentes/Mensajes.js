function Mensajes(selector) {
    this.mostrar = function (texto, tipo) {
        let cadena = '<div class="alert alert-' + (tipo || "info") + ' alert-dismissible fade show" role="alert">';
        cadena = cadena + Html.escapar(texto);
        cadena = cadena + '<button type="button" class="close" data-dismiss="alert" aria-label="Cerrar">';
        cadena = cadena + '<span aria-hidden="true">&times;</span></button></div>';
        $(selector).html(cadena);
    };

    this.exito = function (texto) { this.mostrar(texto, "success"); };
    this.info = function (texto) { this.mostrar(texto, "info"); };
    this.aviso = function (texto) { this.mostrar(texto, "warning"); };
    this.error = function (texto) { this.mostrar(texto, "danger"); };

    this.limpiar = function () {
        $(selector).empty();
    };
}
