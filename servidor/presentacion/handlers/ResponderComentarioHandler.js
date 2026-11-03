const { RespuestaHttp } = require("../RespuestaHttp.js");

function ResponderComentarioHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.responderComentario(request.usuario, request.body || {}, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ResponderComentarioHandler = ResponderComentarioHandler;
