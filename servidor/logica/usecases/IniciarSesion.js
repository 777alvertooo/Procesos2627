const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { RolUsuario } = require("../enums/RolUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function IniciarSesion(cad, servicioHash, opciones) {
    opciones = opciones || {};
    let emailsAdmin = opciones.emailsAdmin || [];
    let log = opciones.log;

    this.ejecutar = function (email, clave, callback) {
        email = ValidadorEmail.normalizar(email);
        if (!email || typeof clave !== "string" || !clave) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "Introduce email y contraseña"));
        }
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || !usuario.clave) {
                log.aviso("Login fallido, usuario inexistente: " + email);
                return callback(new ErrorSistema(TipoError.CREDENCIALES, "Email o contraseña incorrectos"));
            }
            servicioHash.comparar(clave, usuario.clave, function (err, coincide) {
                if (err) return callback(ErrorSistema.interno(err));
                if (!coincide) {
                    log.aviso("Login fallido, contraseña incorrecta: " + email);
                    return callback(new ErrorSistema(TipoError.CREDENCIALES, "Email o contraseña incorrectos"));
                }
                if (usuario.estado === EstadoUsuario.ELIMINADO) {
                    log.aviso("Login rechazado, cuenta eliminada: " + email);
                    return callback(new ErrorSistema(TipoError.PROHIBIDO, "Esta cuenta ha sido eliminada"));
                }
                promoverSiAdmin(usuario, function (res) {
                    if (res.error) return callback(res);
                    log.info("Inicio de sesión: " + email);
                    callback(UsuarioMapper.aPublico(res));
                });
            });
        });
    };

    function promoverSiAdmin(usuario, callback) {
        if (usuario.rol === RolUsuario.ADMIN || emailsAdmin.indexOf(usuario.email) === -1) {
            return callback(usuario);
        }
        usuario.rol = RolUsuario.ADMIN;
        cad.actualizarUsuario(usuario, function (err) {
            if (err) return callback(ErrorSistema.interno(err));
            log.info("Usuario promovido a administrador: " + usuario.email);
            callback(usuario);
        });
    }
}

module.exports.IniciarSesion = IniciarSesion;
