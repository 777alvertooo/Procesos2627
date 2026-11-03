function identificador(prefijo) {
    return prefijo + "-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1000000).toString(36);
}

module.exports.identificador = identificador;
