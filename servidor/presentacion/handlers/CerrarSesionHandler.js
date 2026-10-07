const { GestorSesion } = require("../GestorSesion.js");

function CerrarSesionHandler() {
    this.manejar = function (request, response) {
        GestorSesion.cerrar(request, response, function () {
            response.json({ ok: true });
        });
    };
}

module.exports.CerrarSesionHandler = CerrarSesionHandler;
