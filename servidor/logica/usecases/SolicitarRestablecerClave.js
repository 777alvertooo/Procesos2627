const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { EstadoUsuario } = require("../enums/EstadoUsuario.js");
const { TipoError } = require("../enums/TipoError.js");
const { ValidadorEmail } = require("../validaciones/ValidadorEmail.js");

const MENSAJE_OK = "Si el email está registrado, te hemos enviado instrucciones para restablecer la contraseña.";

function SolicitarRestablecerClave(cad, servicioToken, servicioCorreo, opciones) {
    opciones = opciones || {};
    let urlBase = (opciones.urlBase || "http://localhost:3000").replace(/\/$/, "");
    let log = opciones.log;

    this.ejecutar = function (email, callback) {
        email = ValidadorEmail.normalizar(email);
        if (!ValidadorEmail.esValido(email)) {
            return callback(new ErrorSistema(TipoError.VALIDACION, "El email no es válido"));
        }
        cad.buscarUsuario({ email: email }, function (err, usuario) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!usuario || usuario.estado === EstadoUsuario.ELIMINADO || !usuario.clave) {
                log.aviso("Restablecer clave: sin envío para " + email);
                return callback({ mensaje: MENSAJE_OK });
            }
            let token = servicioToken.generar();
            usuario.tokenRestablecer = token;
            usuario.fechaTokenRestablecer = new Date();
            cad.actualizarUsuario(usuario, function (err) {
                if (err) return callback(ErrorSistema.interno(err));
                let enlace = urlBase + "/?restablecer=" + token;
                let texto = "Hola " + (usuario.nick || email) + ",\n\n"
                    + "Has pedido restablecer tu contraseña. Abre este enlace:\n" + enlace + "\n\n"
                    + "Si no has sido tú, ignora este mensaje.";
                servicioCorreo.enviar(email, "Restablece tu contraseña en Procesos 26-27", texto, function (err) {
                    if (err) {
                        log.error("No se pudo enviar el email de restablecer a " + email + ": " + err.message);
                        return callback(new ErrorSistema(TipoError.INTERNO, "No se pudo enviar el email de restablecimiento"));
                    }
                    log.info("Email de restablecer contraseña enviado a " + email);
                    callback({ mensaje: MENSAJE_OK });
                });
            });
        });
    };
}

module.exports.SolicitarRestablecerClave = SolicitarRestablecerClave;
module.exports.MENSAJE_OK = MENSAJE_OK;
