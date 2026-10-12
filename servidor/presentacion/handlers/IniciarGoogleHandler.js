function IniciarGoogleHandler(clienteGoogle) {
    this.manejar = function (request, response) {
        if (!clienteGoogle || !clienteGoogle.estaConfigurado()) {
            return response.redirect("/?oauth=no_configurado");
        }
        response.redirect(clienteGoogle.urlAutorizacion());
    };
}

module.exports.IniciarGoogleHandler = IniciarGoogleHandler;
