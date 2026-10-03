const { Usuario } = require("../entities/Usuario.js");
const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

function AgregarUsuario(cad) {
    this.ejecutar = function (datos, callback) {
        datos = datos || {};
        let email = ValidadorEmail.normalizar(datos.email);
        if (!ValidadorEmail.esValido(email)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El email no es válido"));
        }
        cad.buscarUsuario({ email: email }, function (err, existente) {
            if (err) return callback(ErrorSistema.interno(err));
            if (existente) {
                console.log("El email " + email + " ya está registrado");
                return callback(new ErrorSistema(TipoError.CONFLICTO, "El email ya está registrado"));
            }
            let usuario = new Usuario({ email: email, nick: datos.nick });
            cad.insertarUsuario(usuario, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                callback({ email: email });
            });
        });
    };
}

module.exports.AgregarUsuario = AgregarUsuario;
