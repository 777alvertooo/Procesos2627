const { RespuestaHttp } = require("../RespuestaHttp.js");

function SolicitarRestablecerClaveHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        sistema.solicitarRestablecerClave(cuerpo.email, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.SolicitarRestablecerClaveHandler = SolicitarRestablecerClaveHandler;
