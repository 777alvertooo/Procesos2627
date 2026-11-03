const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { PeliculaMapper } = require("../mappers/PeliculaMapper.js");

function ObtenerPelicula(cad) {
    this.ejecutar = function (solicitante, id, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        id = typeof id === "string" ? id.trim() : "";
        if (!id) return callback(new ErrorSistema(TipoError.VALIDACION, "Falta la película"));
        cad.buscarPelicula(id, function (err, pelicula) {
            if (err) return callback(ErrorSistema.interno(err));
            if (!pelicula) return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa película"));
            cad.listarPendientes(solicitante.email, function (err, marcas) {
                if (err) return callback(ErrorSistema.interno(err));
                let enLista = marcas.some(function (marca) { return marca.peliculaId === id; });
                cad.buscarValoracion(solicitante.email, id, function (err, propia) {
                    if (err) return callback(ErrorSistema.interno(err));
                    montarComentarios(cad, solicitante.email, id, function (err, datos) {
                        if (err) return callback(ErrorSistema.interno(err));
                        callback({
                            pelicula: PeliculaMapper.aPublica(pelicula),
                            enLista: enLista,
                            yaValorada: !!propia,
                            media: datos.media,
                            numeroComentarios: datos.comentarios.length,
                            comentarios: datos.comentarios
                        });
                    });
                });
            });
        });
    };
}

function montarComentarios(cad, email, peliculaId, callback) {
    cad.listarValoraciones(peliculaId, function (err, valoraciones) {
        if (err) return callback(err);
        let idsValoracion = valoraciones.map(function (valoracion) { return valoracion.id; });
        cad.listarRespuestas(idsValoracion, function (err, respuestas) {
            if (err) return callback(err);
            let ids = idsValoracion.concat(respuestas.map(function (respuesta) { return respuesta.id; }));
            cad.listarReacciones(ids, function (err, reacciones) {
                if (err) return callback(err);
                let comentarios = valoraciones.map(function (valoracion) {
                    let propias = respuestas.filter(function (respuesta) {
                        return respuesta.valoracionId === valoracion.id;
                    });
                    propias.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
                    let comentario = fichaComentario(valoracion, email, reacciones);
                    comentario.puntuacion = valoracion.puntuacion;
                    comentario.respuestas = propias.map(function (respuesta) {
                        return fichaComentario(respuesta, email, reacciones);
                    });
                    return comentario;
                });
                comentarios.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
                callback(undefined, { media: mediaDe(valoraciones), comentarios: comentarios });
            });
        });
    });
}

function fichaComentario(origen, email, reacciones) {
    let cuentas = contar(reacciones, origen.id, email);
    return {
        id: origen.id,
        nick: origen.nick,
        esMio: origen.email === email,
        texto: origen.texto,
        fecha: origen.fecha,
        likes: cuentas.likes,
        dislikes: cuentas.dislikes,
        miReaccion: cuentas.miReaccion
    };
}

function contar(reacciones, comentarioId, email) {
    let likes = 0;
    let dislikes = 0;
    let mia = null;
    reacciones.forEach(function (reaccion) {
        if (reaccion.comentarioId !== comentarioId) return;
        if (reaccion.tipo === "like") likes = likes + 1;
        if (reaccion.tipo === "dislike") dislikes = dislikes + 1;
        if (reaccion.email === email) mia = reaccion.tipo;
    });
    return { likes: likes, dislikes: dislikes, miReaccion: mia };
}

function mediaDe(valoraciones) {
    if (!valoraciones.length) return null;
    let suma = 0;
    valoraciones.forEach(function (valoracion) { suma = suma + valoracion.puntuacion; });
    return Math.round((suma / valoraciones.length) * 10) / 10;
}

module.exports.ObtenerPelicula = ObtenerPelicula;
