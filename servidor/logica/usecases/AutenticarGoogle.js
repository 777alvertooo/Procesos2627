const { Usuario } = require("../entities/Usuario.js");
const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { OrigenUsuario } = require("../enums/OrigenUsuario.js");
const { RolUsuario } = require("../enums/RolUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function AutenticarGoogle(cad, opciones) {
    opciones = opciones || {};
    let emailsAdmin = opciones.emailsAdmin || [];
    let log = opciones.log;

    this.ejecutar = function (perfil, callback) {
        perfil = perfil || {};
        let email = ValidadorEmail.normalizar(perfil.email);
        if (!ValidadorEmail.esValido(email)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "Google no ha proporcionado un email válido"));
        }
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (usuario && usuario.estado === EstadoUsuario.ELIMINADO) {
                return recrearEliminado(usuario, perfil, callback);
            }
            if (usuario) {
                return activarYPromover(usuario, perfil.nick, callback);
            }
            let rol = emailsAdmin.indexOf(email) !== -1 ? RolUsuario.ADMIN : RolUsuario.USUARIO;
            let nuevo = new Usuario({
                email: email,
                nick: perfil.nick || email.split("@")[0],
                rol: rol,
                origen: OrigenUsuario.GOOGLE,
                estado: EstadoUsuario.ACTIVO
            });
            cad.insertarUsuario(nuevo, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                log.info("Usuario registrado con Google: " + email + " (" + rol + ")");
                callback(UsuarioMapper.aPublico(nuevo));
            });
        });
    };

    function recrearEliminado(usuario, perfil, callback) {
        usuario.nick = perfil.nick || usuario.nick || emailLocal(usuario.email);
        usuario.clave = undefined;
        usuario.rol = emailsAdmin.indexOf(usuario.email) !== -1 ? RolUsuario.ADMIN : RolUsuario.USUARIO;
        usuario.origen = OrigenUsuario.GOOGLE;
        usuario.estado = EstadoUsuario.ACTIVO;
        usuario.tokenConfirmacion = undefined;
        usuario.fechaBaja = undefined;
        usuario.fechaAlta = new Date();
        cad.actualizarUsuario(usuario, function (err) {
            if (err) return callback(ErrorSistema.interno(err));
            log.info("Cuenta eliminada reactivada con Google: " + usuario.email);
            callback(UsuarioMapper.aPublico(usuario));
        });
    }

    function emailLocal(email) {
        return email.split("@")[0];
    }

    function activarYPromover(usuario, nick, callback) {
        let cambio = false;
        if (usuario.estado === EstadoUsuario.PENDIENTE) {
            usuario.estado = EstadoUsuario.ACTIVO;
            usuario.tokenConfirmacion = undefined;
            cambio = true;
        }
        if (!usuario.origen) {
            usuario.origen = OrigenUsuario.GOOGLE;
            cambio = true;
        }
        if (nick && !usuario.nick) {
            usuario.nick = nick;
            cambio = true;
        }
        if (usuario.rol !== RolUsuario.ADMIN && emailsAdmin.indexOf(usuario.email) !== -1) {
            usuario.rol = RolUsuario.ADMIN;
            cambio = true;
        }
        if (!cambio) {
            log.info("Inicio de sesión con Google: " + usuario.email);
            return callback(UsuarioMapper.aPublico(usuario));
        }
        cad.actualizarUsuario(usuario, function (err) {
            if (err) return callback(ErrorSistema.interno(err));
            log.info("Inicio de sesión con Google: " + usuario.email);
            callback(UsuarioMapper.aPublico(usuario));
        });
    }
}

module.exports.AutenticarGoogle = AutenticarGoogle;
