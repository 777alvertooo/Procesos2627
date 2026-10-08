const fs = require("fs");
const path = require("path");

function Log(fichero) {
    this.fichero = fichero;

    if (this.fichero) {
        fs.mkdirSync(path.dirname(this.fichero), { recursive: true });
    }

    this.escribir = function (nivel, mensaje) {
        let linea = new Date().toISOString() + " [" + nivel + "] " + mensaje;
        if (nivel === "ERROR") {
            console.error(linea);
        } else {
            console.log(linea);
        }
        if (this.fichero) {
            fs.appendFile(this.fichero, linea + "\n", function () {});
        }
    };

    this.info = function (mensaje) { this.escribir("INFO", mensaje); };
    this.aviso = function (mensaje) { this.escribir("AVISO", mensaje); };
    this.error = function (mensaje) { this.escribir("ERROR", mensaje); };
}

function LogSilencio() {
    this.info = function () {};
    this.aviso = function () {};
    this.error = function () {};
}

module.exports.Log = Log;
module.exports.LogSilencio = LogSilencio;
