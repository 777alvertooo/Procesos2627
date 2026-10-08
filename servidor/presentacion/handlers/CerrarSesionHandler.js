const { GestorSesion } = require("../GestorSesion.js");

function CerrarSesionHandler(log) {
    this.manejar = function (request, response) {
        let email = GestorSesion.emailActual(request);
        GestorSesion.cerrar(request, response, function () {
            if (email && log) log.info("Cierre de sesión: " + email);
            response.json({ ok: true });
        });
    };
}

module.exports.CerrarSesionHandler = CerrarSesionHandler;
