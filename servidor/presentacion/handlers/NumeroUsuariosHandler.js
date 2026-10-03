const { RespuestaHttp } = require("../RespuestaHttp.js");

function NumeroUsuariosHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.numeroUsuarios(function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.NumeroUsuariosHandler = NumeroUsuariosHandler;
