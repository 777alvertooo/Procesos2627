const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function ConfirmarUsuario(cad, opciones) {
    opciones = opciones || {};
    let log = opciones.log;

    this.ejecutar = function (token, callback) {
        if (!token || typeof token !== "string") {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El enlace de confirmación no es válido"));
        }
        cad.buscarUsuario({ tokenConfirmacion: token }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario) {
                return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "El enlace de confirmación no es válido o ya se ha usado"));
            }
            if (usuario.estado === EstadoUsuario.ELIMINADO) {
                return callback(new ErrorSistema(TipoError.PROHIBIDO, "Esta cuenta ha sido eliminada"));
            }
            if (usuario.estado === EstadoUsuario.ACTIVO) {
                return callback(UsuarioMapper.aPublico(usuario));
            }
            usuario.estado = EstadoUsuario.ACTIVO;
            usuario.tokenConfirmacion = undefined;
            cad.actualizarUsuario(usuario, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                log.info("Cuenta confirmada: " + usuario.email);
                callback(UsuarioMapper.aPublico(usuario));
            });
        });
    };
}

module.exports.ConfirmarUsuario = ConfirmarUsuario;
