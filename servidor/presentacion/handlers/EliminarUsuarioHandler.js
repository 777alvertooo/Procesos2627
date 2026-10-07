const { RespuestaHttp } = require("../RespuestaHttp.js");
const { GestorSesion } = require("../GestorSesion.js");

function EliminarUsuarioHandler(sistema) {
    this.manejar = function (request, response) {
        sistema.eliminarUsuario(request.params.email, function (resultado) {
            if (resultado.error || resultado.email !== request.usuario.email) {
                return RespuestaHttp.enviar(response, resultado);
            }
            GestorSesion.cerrar(request, response, function () {
                RespuestaHttp.enviar(response, resultado);
            });
        });
    };
}

module.exports.EliminarUsuarioHandler = EliminarUsuarioHandler;
