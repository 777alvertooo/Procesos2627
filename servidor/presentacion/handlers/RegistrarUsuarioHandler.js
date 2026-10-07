const { RespuestaHttp } = require("../RespuestaHttp.js");

function RegistrarUsuarioHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        let datos = { email: cuerpo.email, nick: cuerpo.nick, password: cuerpo.password };
        sistema.registrarUsuario(datos, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.RegistrarUsuarioHandler = RegistrarUsuarioHandler;
