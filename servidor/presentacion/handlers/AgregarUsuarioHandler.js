const { RespuestaHttp } = require("../RespuestaHttp.js");

function AgregarUsuarioHandler(sistema) {
    this.manejar = function (request, response) {
        let datos = { email: request.params.email, nick: request.query.nick };
        sistema.agregarUsuario(datos, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.AgregarUsuarioHandler = AgregarUsuarioHandler;
