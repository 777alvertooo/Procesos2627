const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");

function prepararPelicula(datos) {
    datos = datos || {};
    let titulo = texto(datos.titulo);
    if (!titulo) return fallo("Escribe el título");
    if (titulo.length > 120) return fallo("El título no puede superar los 120 caracteres");
    let sinopsis = texto(datos.sinopsis);
    if (!sinopsis) return fallo("Escribe la sinopsis");
    if (sinopsis.length > 1000) return fallo("La sinopsis no puede superar los 1000 caracteres");
    let tipo = texto(datos.tipo);
    if (tipo !== "cine" && tipo !== "plataforma") return fallo("Elige si está en cines o en plataforma");
    let medio = texto(datos.medio) || "pelicula";
    if (medio !== "pelicula" && medio !== "serie") return fallo("Elige si es una película o una serie");
    if (medio === "serie" && tipo !== "plataforma") return fallo("Las series se ven en plataforma");
    let cartel = texto(datos.cartel);
    if (!/^https?:\/\/\S+$/i.test(cartel)) return fallo("El cartel tiene que ser un enlace http o https");
    let trailerId = extraerTrailer(datos.trailer || datos.trailerId || datos.trailerUrl);
    if (!trailerId) return fallo("El tráiler tiene que ser un enlace de YouTube");
    let cines = [];
    let dondeVer = "";
    if (tipo === "cine") {
        cines = listaCines(datos.cines);
        if (!cines.length) return fallo("Indica al menos un cine");
        if (cines.length > 12) return fallo("No puedes indicar más de 12 cines");
        let largo = cines.some(function (cine) { return cine.length > 80; });
        if (largo) return fallo("El nombre de un cine no puede superar los 80 caracteres");
        dondeVer = "En cines";
    } else {
        dondeVer = texto(datos.dondeVer);
        if (!dondeVer) return fallo("Indica la plataforma");
        if (dondeVer.length > 80) return fallo("La plataforma no puede superar los 80 caracteres");
    }
    let temporadas = [];
    if (medio === "serie") {
        let leidas = listaTemporadas(datos.temporadas);
        if (leidas.error) return leidas;
        temporadas = leidas.temporadas;
    }
    return {
        pelicula: {
            titulo: titulo,
            sinopsis: sinopsis,
            tipo: tipo,
            medio: medio,
            cartel: cartel,
            trailerId: trailerId,
            cines: cines,
            dondeVer: dondeVer,
            temporadas: temporadas
        }
    };
}

function slugDe(titulo) {
    let valor = normalizar(titulo).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (valor.length > 48) valor = valor.slice(0, 48).replace(/-+$/g, "");
    return valor || "pelicula";
}

function fallo(mensaje) {
    return { error: new ErrorSistema(TipoError.VALIDACION, mensaje) };
}

function texto(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

function listaTemporadas(valor) {
    let lineas = Array.isArray(valor) ? valor : String(valor || "").split(/[\n,]/);
    let temporadas = [];
    let i;
    for (i = 0; i < lineas.length; i++) {
        let linea = lineas[i];
        if (linea && typeof linea === "object") {
            let capitulos = Number(linea.capitulos);
            let numero = Number(linea.numero) || temporadas.length + 1;
            if (!capituloValido(capitulos) || !capituloValido(numero)) return fallo("Cada temporada necesita un número de capítulos válido");
            temporadas.push({ numero: numero, capitulos: capitulos });
            continue;
        }
        let textoLinea = texto(linea);
        if (!textoLinea) continue;
        let capitulos = Number(textoLinea);
        if (!capituloValido(capitulos)) return fallo("Escribe los capítulos de cada temporada, uno por línea");
        temporadas.push({ numero: temporadas.length + 1, capitulos: capitulos });
    }
    if (temporadas.length > 40) return fallo("No puedes indicar más de 40 temporadas");
    return { temporadas: temporadas };
}

function capituloValido(valor) {
    return Number.isInteger(valor) && valor >= 1 && valor <= 200;
}

function listaCines(valor) {
    let partes = Array.isArray(valor) ? valor : String(valor || "").split(/[\n,]/);
    let vistos = {};
    let lista = [];
    partes.forEach(function (parte) {
        let cine = texto(parte);
        let clave = normalizar(cine);
        if (!cine || vistos[clave]) return;
        vistos[clave] = true;
        lista.push(cine);
    });
    return lista;
}

function extraerTrailer(valor) {
    valor = texto(valor);
    if (/^[A-Za-z0-9_-]{11}$/.test(valor)) return valor;
    let partes = valor.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return partes ? partes[1] : "";
}

function normalizar(textoPlano) {
    let valor = String(textoPlano || "").toLowerCase();
    let desde = "áéíóúüñ";
    let hacia = "aeiouun";
    let i;
    for (i = 0; i < desde.length; i++) {
        valor = valor.split(desde.charAt(i)).join(hacia.charAt(i));
    }
    return valor.trim();
}

module.exports.prepararPelicula = prepararPelicula;
module.exports.slugDe = slugDe;
