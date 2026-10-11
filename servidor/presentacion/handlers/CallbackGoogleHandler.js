const { GestorSesion } = require("../GestorSesion.js");

function CallbackGoogleHandler(sistema, clienteGoogle, log) {
    this.manejar = function (request, response) {
        if (request.query.error) {
            log.aviso("Google OAuth cancelado o rechazado: " + request.query.error);
            return response.redirect("/?oauth=error");
        }
        if (!clienteGoogle || !clienteGoogle.estaConfigurado()) {
            return response.redirect("/?oauth=no_configurado");
        }
        clienteGoogle.obtenerPerfil(request.query.code, function (err, perfil) {
            if (err) {
                log.error("Error al obtener el perfil de Google: " + err.message);
                return response.redirect("/?oauth=error");
            }
            sistema.autenticarGoogle(perfil, function (resultado) {
                if (resultado.error) {
                    log.aviso("Login Google rechazado: " + resultado.error);
                    return response.redirect("/?oauth=error");
                }
                GestorSesion.abrir(request, resultado.email, function (err) {
                    if (err) {
                        log.error("No se pudo abrir la sesión tras Google: " + err.message);
                        return response.redirect("/?oauth=error");
                    }
                    log.info("Sesión abierta con Google: " + resultado.email);
                    response.redirect("/");
                });
            });
        });
    };
}

module.exports.CallbackGoogleHandler = CallbackGoogleHandler;
