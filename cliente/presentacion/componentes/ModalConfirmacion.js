function ModalConfirmacion(selector) {
    this.preguntar = function (texto, alAceptar) {
        $(selector + " .texto-confirmar").text(texto);
        $(selector + " .btn-confirmar").off("click").on("click", function () {
            $(selector).modal("hide");
            alAceptar();
        });
        $(selector).modal("show");
    };
}
