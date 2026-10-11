const crypto = require("crypto");

function ServicioToken() {
    this.generar = function () {
        return crypto.randomBytes(32).toString("hex");
    };
}

module.exports.ServicioToken = ServicioToken;
