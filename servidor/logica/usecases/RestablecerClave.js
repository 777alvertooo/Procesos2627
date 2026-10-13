const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorClave } = require("../validaciones/ValidadorClave.js");

function RestablecerClave(cad, servicioHash, opciones) {
    opciones = opciones || {};
    let log = opciones.log;
    let caducidadMs = opciones.caducidadRestablecerMs || (60 * 60 * 1000);

    this.ejecutar = function (datos, callback) {
        datos = datos || {};
        let token = datos.token;
        if (!token || typeof token !== "string") {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El enlace de restablecimiento no es válido"));
        }
        if (!ValidadorClave.esValida(datos.password)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La contraseña debe tener al menos " + ValidadorClave.LONGITUD_MINIMA + " caracteres"));
        }
        if (datos.confirmarPassword !== datos.password) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "Las contraseñas no coinciden"));
        }
        cad.buscarUsuario({ tokenRestablecer: token }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado === EstadoUsuario.ELIMINADO) {
                return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "El enlace de restablecimiento no es válido o ya se ha usado"));
            }
            if (usuario.fechaTokenRestablecer) {
                let fecha = new Date(usuario.fechaTokenRestablecer).getTime();
                if (isNaN(fecha) || Date.now() - fecha > caducidadMs) {
                    return callback(new ErrorSistema(TipoError.PROHIBIDO, "El enlace de restablecimiento ha caducado. Solicita uno nuevo."));
                }
            }
            servicioHash.cifrar(datos.password, function (err, hash) {
                if (err) return callback(ErrorSistema.interno(err));
                usuario.clave = hash;
                usuario.tokenRestablecer = undefined;
                usuario.fechaTokenRestablecer = undefined;
                if (usuario.estado === EstadoUsuario.PENDIENTE) {
                    usuario.estado = EstadoUsuario.ACTIVO;
                    usuario.tokenConfirmacion = undefined;
                }
                cad.actualizarUsuario(usuario, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    log.info("Contraseña restablecida: " + usuario.email);
                    callback({
                        email: usuario.email,
                        mensaje: "Contraseña actualizada. Ya puedes iniciar sesión."
                    });
                });
            });
        });
    };
}

module.exports.RestablecerClave = RestablecerClave;
