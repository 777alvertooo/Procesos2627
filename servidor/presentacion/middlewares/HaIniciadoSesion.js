const { GestorSesion } = require("../GestorSesion.js");
const { TipoError } = require("../../logica/enums/TipoError.js");

function HaIniciadoSesion(sistema) {
    this.manejar = function (request, response, next) {
        let email = GestorSesion.emailActual(request);
        if (!email) {
            return response.status(401).json({ error: "Debes iniciar sesión", tipo: TipoError.CREDENCIALES });
        }
        sistema.obtenerUsuario(email, function (resultado) {
            if (resultado.error) {
                return GestorSesion.cerrar(request, response, function () {
                    response.status(401).json({ error: "Tu sesión ya no es válida", tipo: TipoError.CREDENCIALES });
                });
            }
            request.usuario = resultado;
            next();
        });
    };
}

module.exports.HaIniciadoSesion = HaIniciadoSesion;
