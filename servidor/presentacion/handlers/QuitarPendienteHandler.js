const { RespuestaHttp } = require("../RespuestaHttp.js");

function QuitarPendienteHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.quitarPendiente(request.usuario, request.params.id, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.QuitarPendienteHandler = QuitarPendienteHandler;
