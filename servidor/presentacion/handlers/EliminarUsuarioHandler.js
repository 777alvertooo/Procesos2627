const { RespuestaHttp } = require("../RespuestaHttp.js");

function EliminarUsuarioHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.eliminarUsuario(request.params.email, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.EliminarUsuarioHandler = EliminarUsuarioHandler;
