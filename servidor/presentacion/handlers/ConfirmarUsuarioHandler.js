function ConfirmarUsuarioHandler(sistema, log) {
    this.manejar = function (request, response) {
        sistema.confirmarUsuario(request.params.token, function (resultado) {
            if (resultado.error) {
                log.aviso("Confirmación fallida: " + resultado.error);
                return response.redirect("/?confirmado=0");
            }
            response.redirect("/?confirmado=1");
        });
    };
}

module.exports.ConfirmarUsuarioHandler = ConfirmarUsuarioHandler;
