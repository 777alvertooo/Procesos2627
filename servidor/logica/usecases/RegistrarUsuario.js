const { Usuario } = require("../entities/Usuario.js");
const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { ValidadorClave } = require("../validaciones/ValidadorClave.js");

function RegistrarUsuario(cad, servicioHash) {
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
                console.log("El email " + email + " ya está registrado");
                return callback(new ErrorSistema(TipoError.CONFLICTO, "El email ya está registrado"));
            }
            servicioHash.cifrar(datos.password, function (err, hash) {
                if (err) return callback(ErrorSistema.interno(err));
                let usuario = new Usuario({ email: email, nick: datos.nick, clave: hash });
                cad.insertarUsuario(usuario, function (err) {
                    if (err) return callback(ErrorSistema.interno(err));
                    callback({ email: email });
                });
            });
        });
    };
}

module.exports.RegistrarUsuario = RegistrarUsuario;
