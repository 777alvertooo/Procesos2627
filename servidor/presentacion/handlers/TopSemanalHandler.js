const { RespuestaHttp } = require("../RespuestaHttp.js");

function TopSemanalHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.topSemanal(request.usuario, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.TopSemanalHandler = TopSemanalHandler;
