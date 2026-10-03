const { TipoError } = require("../enums/TipoError.js");

function ErrorSistema(tipo, mensaje) {
    this.error = mensaje;
    this.tipo = tipo;
}

ErrorSistema.interno = function (err) {
    console.error("Error interno: " + (err && err.message ? err.message : err));
    return new ErrorSistema(TipoError.INTERNO, "Error interno del servidor, inténtalo de nuevo más tarde");
};

module.exports.ErrorSistema = ErrorSistema;
