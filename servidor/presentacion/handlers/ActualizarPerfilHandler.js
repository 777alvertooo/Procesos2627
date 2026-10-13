const { RespuestaHttp } = require("../RespuestaHttp.js");

function ActualizarPerfilHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        let emailAnterior = request.usuario.email;
        let datos = {
            nick: cuerpo.nick,
            email: cuerpo.email,
            passwordActual: cuerpo.passwordActual,
            passwordNueva: cuerpo.passwordNueva,
            confirmarPassword: cuerpo.confirmarPassword
        };
        sistema.actualizarPerfil(request.usuario, datos, function (resultado) {
            if (!resultado.error && resultado.email && resultado.email !== emailAnterior) {
                request.session.email = resultado.email;
                return request.session.save(function () {
                    RespuestaHttp.enviar(response, resultado);
                });
            }
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.ActualizarPerfilHandler = ActualizarPerfilHandler;
