const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");

function exigirSesion(solicitante) {
    if (!solicitante || !solicitante.email) {
        return new ErrorSistema(TipoError.CREDENCIALES, "Debes iniciar sesión");
    }
    return undefined;
}

module.exports.exigirSesion = exigirSesion;
