const { RespuestaHttp } = require("../RespuestaHttp.js");

function RestablecerClaveHandler(sistema) {
    this.manejar = function (request, response) {
        let cuerpo = request.body || {};
        let datos = {
            token: cuerpo.token,
            password: cuerpo.password,
            confirmarPassword: cuerpo.confirmarPassword
        };
        sistema.restablecerClave(datos, function (resultado) {
            RespuestaHttp.enviar(response, resultado);
        });
    };
}

module.exports.RestablecerClaveHandler = RestablecerClaveHandler;
