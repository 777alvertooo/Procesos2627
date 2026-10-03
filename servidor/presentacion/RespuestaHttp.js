const { TipoError } = require("../logica/enums/TipoError.js");

const CODIGOS_HTTP = {};
CODIGOS_HTTP[TipoError.VALIDACION] = 400;
CODIGOS_HTTP[TipoError.NO_ENCONTRADO] = 404;
CODIGOS_HTTP[TipoError.CONFLICTO] = 409;
CODIGOS_HTTP[TipoError.INTERNO] = 500;

const RespuestaHttp = {
    enviar: function (response, resultado) {
        let codigo = resultado.error ? CODIGOS_HTTP[resultado.tipo] || 500 : 200;
        response.status(codigo).json(resultado);
    }
};

module.exports.RespuestaHttp = RespuestaHttp;
