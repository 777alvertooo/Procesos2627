const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { RolUsuario } = require("../enums/RolUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { ValidadorClave } = require("../validaciones/ValidadorClave.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function ActualizarUsuario(cad, servicioHash, autorizacion, opciones) {
    opciones = opciones || {};
    let log = opciones.log;

    this.ejecutar = function (solicitante, emailObjetivo, datos, callback) {
        datos = datos || {};
        let denegado = autorizacion.exigirAdmin(solicitante, "editar un usuario");
        if (denegado) return callback(denegado);

        emailObjetivo = ValidadorEmail.normalizar(emailObjetivo);
        let nick = typeof datos.nick === "string" ? datos.nick.trim() : "";
        let emailNuevo = ValidadorEmail.normalizar(datos.email);

        if (!nick) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El nick no puede estar vacío"));
        }
        if (!ValidadorEmail.esValido(emailNuevo)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El email no es válido"));
        }

        cad.buscarUsuario({ email: emailObjetivo }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado === EstadoUsuario.ELIMINADO) {
                return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "El usuario no existe"));
            }
            if (usuario.rol === RolUsuario.ADMIN) {
                return callback(new ErrorSistema(TipoError.PROHIBIDO, "No se pueden editar cuentas de administrador"));
            }

            asegurarEmailLibre(emailObjetivo, emailNuevo, function (res) {
                if (res && res.error) return callback(res);
                usuario.nick = nick;
                usuario.email = emailNuevo;
                cambiarClaveSiProcede(usuario, datos, function (res) {
                    if (res && res.error) return callback(res);
                    cad.actualizarUsuario(usuario, function (err) {
                        if (err) return callback(ErrorSistema.interno(err));
                        log.info("Usuario editado por admin " + solicitante.email + ": " + emailObjetivo + " -> " + emailNuevo);
                        callback(UsuarioMapper.aPublico(usuario));
                    }, emailObjetivo);
                });
            });
        });
    };

    function asegurarEmailLibre(emailActual, emailNuevo, callback) {
        if (emailActual === emailNuevo) return callback();
        cad.buscarUsuario({ email: emailNuevo }, function (err, existente) {
            if (err) return callback(ErrorSistema.interno(err));
            if (existente) {
                return callback(new ErrorSistema(TipoError.CONFLICTO, "El email ya está registrado"));
            }
            callback();
        });
    }

    function cambiarClaveSiProcede(usuario, datos, callback) {
        let quiereCambiar = !!(datos.passwordNueva || datos.confirmarPassword);
        if (!quiereCambiar) return callback();
        if (!usuario.clave) {
            return callback(new ErrorSistema(TipoError.PROHIBIDO, "Esta cuenta inicia sesión con Google y no tiene contraseña local"));
        }
        if (!ValidadorClave.esValida(datos.passwordNueva)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La nueva contraseña debe tener al menos " + ValidadorClave.LONGITUD_MINIMA + " caracteres"));
        }
        if (datos.passwordNueva !== datos.confirmarPassword) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "Las contraseñas no coinciden"));
        }
        servicioHash.cifrar(datos.passwordNueva, function (err, hash) {
            if (err) return callback(ErrorSistema.interno(err));
            usuario.clave = hash;
            callback();
        });
    }
}

module.exports.ActualizarUsuario = ActualizarUsuario;
