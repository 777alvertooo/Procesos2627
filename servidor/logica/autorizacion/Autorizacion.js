const { RolUsuario } = require("../enums/RolUsuario.js");
const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");

function Autorizacion(log) {
    this.esAdmin = function (usuario) {
        return !!usuario && usuario.rol === RolUsuario.ADMIN;
    };

    this.exigirAdmin = function (solicitante, accion) {
        if (this.esAdmin(solicitante)) return undefined;
        log.aviso("Acceso denegado a " + (solicitante ? solicitante.email : "anónimo") + " al intentar " + accion);
        return new ErrorSistema(TipoError.PROHIBIDO, "No tienes permisos para realizar esta acción");
    };
}

module.exports.Autorizacion = Autorizacion;
