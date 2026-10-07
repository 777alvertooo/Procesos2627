const LONGITUD_MINIMA = 8;

const ValidadorClave = {
    LONGITUD_MINIMA: LONGITUD_MINIMA,
    esValida: function (clave) {
        return typeof clave === "string" && clave.length >= LONGITUD_MINIMA;
    }
};

module.exports.ValidadorClave = ValidadorClave;
