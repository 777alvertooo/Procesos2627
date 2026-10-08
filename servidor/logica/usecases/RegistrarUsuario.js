const { Usuario } = require("../entities/Usuario.js");
const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { RolUsuario } = require("../enums/RolUsuario.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { ValidadorClave } = require("../validaciones/ValidadorClave.js");

function RegistrarUsuario(cad, servicioHash, opciones) {
    opciones = opciones || {};
    let emailsAdmin = opciones.emailsAdmin || [];
    let log = opciones.log;

    this.ejecutar = function (datos, callback) {
        datos = datos || {};
        let email = ValidadorEmail.normalizar(datos.email);
        if (!ValidadorEmail.esValido(email)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El email no es válido"));
        }
        if (!ValidadorClave.esValida(datos.password)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "La contraseña debe tener al menos " + ValidadorClave.LONGITUD_MINIMA + " caracteres"));
        }
        cad.buscarUsuario({ email: email }, function (err, existente) {
            if (err) return callback(ErrorSistema.interno(err));
            if (existente) {
                log.aviso("Registro rechazado, email en uso: " + email);
                return callback(new ErrorSistema(TipoError.CONFLICTO, "El email ya está registrado"));
            }
            servicioHash.cifrar(datos.password, function (err, hash) {
                if (err) return callback(ErrorSistema.interno(err));
                let rol = emailsAdmin.indexOf(email) !== -1 ? RolUsuario.ADMIN : RolUsuario.USUARIO;
                let usuario = new Usuario({ email: email, nick: datos.nick, clave: hash, rol: rol });
                cad.insertarUsuario(usuario, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    log.info("Usuario registrado: " + email + " (" + rol + ")");
                    callback({ email: email });
                });
            });
        });
    };
}

module.exports.RegistrarUsuario = RegistrarUsuario;
