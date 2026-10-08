const { RespuestaHttp } = require("../RespuestaHttp.js");

function UsuarioActivoHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.usuarioActivo(request.usuario, request.params.email, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.UsuarioActivoHandler = UsuarioActivoHandler;
