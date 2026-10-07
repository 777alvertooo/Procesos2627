const { GestorSesion } = require("../GestorSesion.js");

function UsuarioSesionHandler(sistema) {
    this.manejar = function (request, response) {
        let email = GestorSesion.emailActual(request);
        if (!email) return response.json({ usuario: null });
        sistema.obtenerUsuario(email, function (resultado) {
            if (resultado.error) {
                return GestorSesion.cerrar(request, response, function () {
                    response.json({ usuario: null });
                });
            }
            response.json({ usuario: resultado });
        });
    };
}

module.exports.UsuarioSesionHandler = UsuarioSesionHandler;
