const { TipoError } = require("../../logica/enums/TipoError.js");

function ErrorPeticionHandler() {
    this.manejar = function (err, request, response, next) {
        let codigo = err.status || 500;
        if (codigo >= 500) {
            console.error("Error no controlado en " + request.method + " " + request.url + ": " + err.message);
        }
        response.status(codigo).json({
            error: codigo < 500 ? "Petición no válida" : "Error interno del servidor",
            tipo: codigo < 500 ? TipoError.VALIDACION : TipoError.INTERNO
        });
    };
}

module.exports.ErrorPeticionHandler = ErrorPeticionHandler;
