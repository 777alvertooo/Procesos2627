const { TipoError } = require("../../logica/enums/TipoError.js");

function NoEncontradoHandler() {
    this.manejar = function (request, response) {
        response.status(404).json({ error: "Recurso no encontrado", tipo: TipoError.NO_ENCONTRADO });
    };
}

module.exports.NoEncontradoHandler = NoEncontradoHandler;
