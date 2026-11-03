const { RespuestaHttp } = require("../RespuestaHttp.js");

function ReaccionarComentarioHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.reaccionarComentario(request.usuario, request.body || {}, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ReaccionarComentarioHandler = ReaccionarComentarioHandler;
