const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");
const { UsuarioMapper } = require("../mappers/UsuarioMapper.js");

function ObtenerUsuario(cad) {
    this.ejecutar = function (email, callback) {
        cad.buscarUsuario({ email: ValidadorEmail.normalizar(email) }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado !== EstadoUsuario.ACTIVO) {
                return callback(new ErrorSistema(TipoError.CREDENCIALES, "Sesión no válida"));
            }
            callback(UsuarioMapper.aPublico(usuario));
        });
    };
}

module.exports.ObtenerUsuario = ObtenerUsuario;
