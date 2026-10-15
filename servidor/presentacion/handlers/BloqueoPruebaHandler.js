const { EvaluadorBloqueo } = require("../../logica/servicios/EvaluadorBloqueo.js");

function BloqueoPruebaHandler() {
    let evaluador = new EvaluadorBloqueo();

    this.manejar = function (request, response) {
        let cuerpo = request.body;
        if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
            return response.status(400).json({ error: "El cuerpo debe ser un objeto JSON" });
        }
        if (!Object.prototype.hasOwnProperty.call(cuerpo, "fallos") || !Object.prototype.hasOwnProperty.call(cuerpo, "ahora")) {
            return response.status(400).json({ error: "Faltan los campos fallos y ahora" });
        }
        if (!Array.isArray(cuerpo.fallos)) {
            return response.status(400).json({ error: "fallos debe ser un array" });
        }
        if (typeof cuerpo.ahora !== "string") {
            return response.status(400).json({ error: "ahora debe ser una cadena ISO 8601" });
        }

        try {
            let resultado = evaluador.evaluar(cuerpo.fallos, cuerpo.ahora);
            response.status(200).json(resultado);
        } catch (err) {
            response.status(400).json({ error: err.message || "Datos no válidos" });
        }
    };
}

module.exports.BloqueoPruebaHandler = BloqueoPruebaHandler;
