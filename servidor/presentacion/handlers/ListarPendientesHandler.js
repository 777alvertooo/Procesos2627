const { RespuestaHttp } = require("../RespuestaHttp.js");

function ListarPendientesHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.listarPendientes(request.usuario, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ListarPendientesHandler = ListarPendientesHandler;
