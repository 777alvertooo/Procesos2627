const { RespuestaHttp } = require("../RespuestaHttp.js");
const { GestorSesion } = require("../GestorSesion.js");
const { TipoError } = require("../../logica/enums/TipoError.js");

function IniciarSesionHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        sistema.iniciarSesion(cuerpo.email, cuerpo.password, function (resultado) {
            if (resultado.error) return RespuestaHttp.enviar(response, resultado);
            GestorSesion.abrir(request, resultado.email, function (err) {
                if (err) {
                    return RespuestaHttp.enviar(response, { error: "No se pudo iniciar la sesión", tipo: TipoError.INTERNO });
                }
                RespuestaHttp.enviar(response, resultado);
            });
        });
    };
}

module.exports.IniciarSesionHandler = IniciarSesionHandler;
