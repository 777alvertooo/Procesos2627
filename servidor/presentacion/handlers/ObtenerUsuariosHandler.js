const { RespuestaHttp } = require("../RespuestaHttp.js");

function ObtenerUsuariosHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.obtenerUsuarios(request.usuario, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ObtenerUsuariosHandler = ObtenerUsuariosHandler;
