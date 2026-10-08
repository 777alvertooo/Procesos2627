const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

function EliminarUsuario(cad, autorizacion, log) {
    this.ejecutar = function (solicitante, email, callback) {
        email = ValidadorEmail.normalizar(email);
        let propio = !!solicitante && ValidadorEmail.normalizar(solicitante.email) === email;
        if (!solicitante || (!autorizacion.esAdmin(solicitante) && !propio)) {
            log.aviso("Acceso denegado a " + (solicitante ? solicitante.email : "anónimo") + " al intentar eliminar a " + email);
            return callback(new ErrorSistema(TipoError.PROHIBIDO, "No tienes permisos para realizar esta acción"));
        }
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado === EstadoUsuario.ELIMINADO) {
                return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "El usuario no existe"));
            }
            usuario.estado = EstadoUsuario.ELIMINADO;
            usuario.fechaBaja = new Date();
            cad.actualizarUsuario(usuario, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                log.info("Usuario eliminado: " + email + " (por " + solicitante.email + ")");
                callback({ email: email });
            });
        });
    };
}

module.exports.EliminarUsuario = EliminarUsuario;
