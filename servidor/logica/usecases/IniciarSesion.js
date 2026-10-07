const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function IniciarSesion(cad, servicioHash) {
    this.ejecutar = function (email, clave, callback) {
        email = ValidadorEmail.normalizar(email);
        if (!email || typeof clave !== "string" || !clave) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "Introduce email y contraseña"));
        }
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || !usuario.clave) {
                return callback(new ErrorSistema(TipoError.CREDENCIALES, "Email o contraseña incorrectos"));
            }
            servicioHash.comparar(clave, usuario.clave, function (err, coincide) {
                if (err) return callback(ErrorSistema.interno(err));
                if (!coincide) {
                    return callback(new ErrorSistema(TipoError.CREDENCIALES, "Email o contraseña incorrectos"));
                }
                if (usuario.estado === EstadoUsuario.ELIMINADO) {
                    return callback(new ErrorSistema(TipoError.PROHIBIDO, "Esta cuenta ha sido eliminada"));
                }
                callback(UsuarioMapper.aPublico(usuario));
            });
        });
    };
}

module.exports.IniciarSesion = IniciarSesion;
