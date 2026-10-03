const fs = require("fs");
const path = require("path");

const RUTA_INDEX = path.join(__dirname, "..", "..", "..", "cliente", "index.html");

function PaginaInicioHandler() {
    this.manejar = function (request, response) {
        var contenido = fs.readFileSync(RUTA_INDEX);
        response.setHeader("Content-type", "text/html");
        response.send(contenido);
    };
}

module.exports.PaginaInicioHandler = PaginaInicioHandler;
