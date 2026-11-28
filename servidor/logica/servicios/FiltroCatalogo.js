const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { GENEROS_PELICULA } = require("../enums/GeneroPelicula.js");

// Lee los filtros del catálogo (normalmente, la query de la petición).
// Todos son opcionales y se combinan: una película tiene que cumplir todos.
//   plataforma: nombre exacto de la plataforma (Netflix, Prime Video...).
//   genero: uno de GENEROS_PELICULA.
//   valoracionMinima: entero de 1 a 5; solo entran títulos con valoraciones
//   cuya media sea igual o mayor.
function leerFiltros(datos) {
    datos = datos || {};
    let filtros = {};
    let plataforma = texto(datos.plataforma);
    if (plataforma) {
        if (plataforma.length > 80) return fallo("La plataforma no puede superar los 80 caracteres");
        filtros.plataforma = plataforma;
    }
    let genero = texto(datos.genero);
    if (genero) {
        let conocido = GENEROS_PELICULA.find(function (nombre) {
            return normalizar(nombre) === normalizar(genero);
        });
        if (!conocido) return fallo("Ese género no existe");
        filtros.genero = conocido;
    }
    let minima = texto(String(datos.valoracionMinima === undefined ? "" : datos.valoracionMinima));
    if (minima) {
        let numero = Number(minima);
        if (!Number.isInteger(numero) || numero < 1 || numero > 5) {
            return fallo("La valoración mínima tiene que ser un número entero del 1 al 5");
        }
        filtros.valoracionMinima = numero;
    }
    return { filtros: filtros };
}

function cumple(pelicula, filtros) {
    if (filtros.plataforma && normalizar(pelicula.dondeVer) !== normalizar(filtros.plataforma)) return false;
    if (filtros.genero && (pelicula.generos || []).indexOf(filtros.genero) === -1) return false;
    if (filtros.valoracionMinima) {
        if (pelicula.valoracionMedia === null || pelicula.valoracionMedia === undefined) return false;
        if (pelicula.valoracionMedia < filtros.valoracionMinima) return false;
    }
    return true;
}

function aplicarFiltros(peliculas, filtros) {
    return (peliculas || []).filter(function (pelicula) { return cumple(pelicula, filtros || {}); });
}

// Valores disponibles para los desplegables, a partir del catálogo completo.
function opcionesFiltro(peliculas) {
    let plataformas = {};
    (peliculas || []).forEach(function (pelicula) {
        if (pelicula.tipo === "plataforma" && pelicula.dondeVer) plataformas[pelicula.dondeVer] = true;
    });
    return {
        plataformas: Object.keys(plataformas).sort(function (a, b) { return a.localeCompare(b, "es"); }),
        generos: GENEROS_PELICULA.slice()
    };
}

function fallo(mensaje) {
    return { error: new ErrorSistema(TipoError.VALIDACION, mensaje) };
}

function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

function normalizar(valor) {
    return String(valor || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

module.exports.leerFiltros = leerFiltros;
module.exports.aplicarFiltros = aplicarFiltros;
module.exports.opcionesFiltro = opcionesFiltro;
