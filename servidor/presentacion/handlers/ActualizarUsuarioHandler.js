const { RespuestaHttp } = require("../RespuestaHttp.js");

function ActualizarUsuarioHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        let datos = {
            nick: cuerpo.nick,
            email: cuerpo.email,
            passwordNueva: cuerpo.passwordNueva,
            confirmarPassword: cuerpo.confirmarPassword
        };
        sistema.actualizarUsuario(request.usuario, request.params.email, datos, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ActualizarUsuarioHandler = ActualizarUsuarioHandler;
