const QUINCE_MINUTOS_MS = 15 * 60 * 1000;
const NUMERO_FALLOS = 5;

function EvaluadorBloqueo() {
    this.evaluar = function (fallos, ahora) {
        if (!Array.isArray(fallos)) {
            throw new Error("fallos debe ser un array de instantes");
        }
        let instanteAhora = parsearInstante(ahora, "ahora");
        let instantes = fallos.map(function (valor, i) {
            return parsearInstante(valor, "fallos[" + i + "]");
        });

        if (instantes.length < NUMERO_FALLOS) {
            return { bloqueado: false, hasta: null };
        }

        instantes.sort(function (a, b) { return a.getTime() - b.getTime(); });
        let recientes = instantes.slice(-NUMERO_FALLOS);
        let primero = recientes[0];
        let ultimo = recientes[recientes.length - 1];

        if (ultimo.getTime() - primero.getTime() > QUINCE_MINUTOS_MS) {
            return { bloqueado: false, hasta: null };
        }

        let hasta = new Date(ultimo.getTime() + QUINCE_MINUTOS_MS);
        if (instanteAhora.getTime() >= hasta.getTime()) {
            return { bloqueado: false, hasta: null };
        }

        return { bloqueado: true, hasta: aIso(hasta) };
    };
}

function aIso(instante) {
    return instante.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function parsearInstante(valor, nombre) {
    if (typeof valor !== "string") {
        throw new Error(nombre + " debe ser una cadena ISO 8601");
    }
    let instante = new Date(valor);
    if (isNaN(instante.getTime())) {
        throw new Error(nombre + " no es una fecha válida");
    }
    return instante;
}

module.exports.EvaluadorBloqueo = EvaluadorBloqueo;
