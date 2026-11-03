const { RespuestaHttp } = require("../RespuestaHttp.js");

function AnadirPendienteHandler(sistema) {
    this.manejar = function (request, response) {
        let peliculaId = request.body && request.body.peliculaId;
        sistema.anadirPendiente(request.usuario, peliculaId, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.AnadirPendienteHandler = AnadirPendienteHandler;
