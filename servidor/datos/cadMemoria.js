const { CATALOGO_PELICULAS } = require("./catalogoPeliculas.js");
const { CATALOGO_SERIES } = require("./catalogoSeries.js");
const { CATALOGO_PELICULAS_EXTRA, CATALOGO_SERIES_EXTRA } = require("./catalogoAmpliacion.js");

function CADMemoria() {
    this.usuarios = {};
    this.peliculas = CATALOGO_PELICULAS.concat(CATALOGO_SERIES, CATALOGO_PELICULAS_EXTRA, CATALOGO_SERIES_EXTRA).map(function (pelicula) {
        let copia = Object.assign({}, pelicula);
        copia.cines = (pelicula.cines || []).slice();
        if (pelicula.temporadas) {
            copia.temporadas = pelicula.temporadas.map(function (temporada) {
                return { numero: temporada.numero, capitulos: temporada.capitulos };
            });
        }
        return copia;
    });
    this.pendientes = [];
    this.valoraciones = [];
    this.respuestas = [];
    this.reacciones = [];
    this.sesionesMatch = [];

    this.conectar = function (uri, nombreBD, callback) {
        callback();
    };

    this.buscarUsuario = function (criterio, callback) {
        let usuarios = this.usuarios;
        let encontrado = Object.keys(usuarios).map(function (email) { return usuarios[email]; })
            .find(function (usuario) {
                return Object.keys(criterio).every(function (clave) { return usuario[clave] === criterio[clave]; });
            });
        callback(undefined, encontrado ? Object.assign({}, encontrado) : undefined);
    };

    this.insertarUsuario = function (usuario, callback) {
        if (this.usuarios[usuario.email]) {
            return callback(new Error("Email duplicado: " + usuario.email));
        }
        this.usuarios[usuario.email] = Object.assign({}, usuario);
        callback();
    };

    this.actualizarUsuario = function (usuario, callback, emailAnterior) {
        let claveAnterior = emailAnterior || usuario.email;
        if (claveAnterior !== usuario.email) {
            delete this.usuarios[claveAnterior];
        }
        this.usuarios[usuario.email] = Object.assign({}, usuario);
        callback();
    };

    this.listarUsuarios = function (callback) {
        let usuarios = this.usuarios;
        callback(undefined, Object.keys(usuarios).map(function (email) { return Object.assign({}, usuarios[email]); }));
    };

    this.listarPeliculas = function (callback) {
        let lista = this.peliculas.map(function (pelicula) { return Object.assign({}, pelicula); });
        lista.sort(function (a, b) { return a.orden - b.orden; });
        callback(undefined, lista);
    };

    this.buscarPelicula = function (id, callback) {
        let encontrada = this.peliculas.find(function (pelicula) { return pelicula.id === id; });
        callback(undefined, encontrada ? Object.assign({}, encontrada) : undefined);
    };

    this.insertarPelicula = function (pelicula, callback) {
        if (this.peliculas.some(function (existente) { return existente.id === pelicula.id; })) {
            return callback(new Error("Película duplicada"));
        }
        let copia = Object.assign({}, pelicula);
        copia.cines = (pelicula.cines || []).slice();
        this.peliculas.push(copia);
        callback();
    };

    this.actualizarPelicula = function (pelicula, callback) {
        let indice = -1;
        this.peliculas.forEach(function (existente, posicion) {
            if (existente.id === pelicula.id) indice = posicion;
        });
        if (indice < 0) return callback(new Error("Película ausente"));
        let copia = Object.assign({}, pelicula);
        copia.cines = (pelicula.cines || []).slice();
        copia.orden = this.peliculas[indice].orden;
        this.peliculas[indice] = copia;
        callback();
    };

    this.eliminarPelicula = function (id, callback) {
        let idsValoracion = this.valoraciones.filter(function (valoracion) {
            return valoracion.peliculaId === id;
        }).map(function (valoracion) { return valoracion.id; });
        let idsRespuesta = this.respuestas.filter(function (respuesta) {
            return idsValoracion.indexOf(respuesta.valoracionId) !== -1;
        }).map(function (respuesta) { return respuesta.id; });
        let idsComentario = idsValoracion.concat(idsRespuesta);
        this.peliculas = this.peliculas.filter(function (pelicula) { return pelicula.id !== id; });
        this.pendientes = this.pendientes.filter(function (marca) { return marca.peliculaId !== id; });
        this.valoraciones = this.valoraciones.filter(function (valoracion) { return valoracion.peliculaId !== id; });
        this.respuestas = this.respuestas.filter(function (respuesta) {
            return idsValoracion.indexOf(respuesta.valoracionId) === -1;
        });
        this.reacciones = this.reacciones.filter(function (reaccion) {
            return idsComentario.indexOf(reaccion.comentarioId) === -1;
        });
        callback();
    };

    this.listarPendientes = function (email, callback) {
        let lista = this.pendientes.filter(function (marca) { return marca.email === email; })
            .map(function (marca) { return Object.assign({}, marca); });
        callback(undefined, lista);
    };

    this.anadirPendiente = function (email, peliculaId, callback) {
        let ya = this.pendientes.some(function (marca) {
            return marca.email === email && marca.peliculaId === peliculaId;
        });
        if (!ya) this.pendientes.push({ email: email, peliculaId: peliculaId });
        callback();
    };

    this.quitarPendiente = function (email, peliculaId, callback) {
        let antes = this.pendientes.length;
        this.pendientes = this.pendientes.filter(function (marca) {
            return !(marca.email === email && marca.peliculaId === peliculaId);
        });
        callback(undefined, antes !== this.pendientes.length);
    };

    this.buscarValoracion = function (email, peliculaId, callback) {
        callback(undefined, copiar(this.valoraciones.find(function (valoracion) {
            return valoracion.email === email && valoracion.peliculaId === peliculaId;
        })));
    };

    this.buscarValoracionPorId = function (id, callback) {
        callback(undefined, copiar(this.valoraciones.find(function (valoracion) { return valoracion.id === id; })));
    };

    this.insertarValoracion = function (valoracion, callback) {
        this.valoraciones.push(Object.assign({}, valoracion));
        callback();
    };

    this.listarValoraciones = function (peliculaId, callback) {
        callback(undefined, this.valoraciones.filter(function (valoracion) {
            return valoracion.peliculaId === peliculaId;
        }).map(function (valoracion) { return Object.assign({}, valoracion); }));
    };

    this.listarValoracionesDesde = function (desdeIso, callback) {
        callback(undefined, this.valoraciones.filter(function (valoracion) {
            return valoracion.fecha && valoracion.fecha >= desdeIso;
        }).map(function (valoracion) { return Object.assign({}, valoracion); }));
    };

    this.listarValoracionesUsuario = function (email, callback) {
        callback(undefined, this.valoraciones.filter(function (valoracion) {
            return valoracion.email === email;
        }).map(function (valoracion) { return Object.assign({}, valoracion); }));
    };

    this.insertarRespuesta = function (respuesta, callback) {
        this.respuestas.push(Object.assign({}, respuesta));
        callback();
    };

    this.buscarRespuestaPorId = function (id, callback) {
        callback(undefined, copiar(this.respuestas.find(function (respuesta) { return respuesta.id === id; })));
    };

    this.listarRespuestas = function (valoracionIds, callback) {
        callback(undefined, this.respuestas.filter(function (respuesta) {
            return valoracionIds.indexOf(respuesta.valoracionId) !== -1;
        }).map(function (respuesta) { return Object.assign({}, respuesta); }));
    };

    this.buscarReaccion = function (comentarioId, email, callback) {
        callback(undefined, copiar(this.reacciones.find(function (reaccion) {
            return reaccion.comentarioId === comentarioId && reaccion.email === email;
        })));
    };

    this.guardarReaccion = function (comentarioId, email, tipo, callback) {
        this.reacciones = this.reacciones.filter(function (reaccion) {
            return !(reaccion.comentarioId === comentarioId && reaccion.email === email);
        });
        if (tipo) this.reacciones.push({ comentarioId: comentarioId, email: email, tipo: tipo });
        callback();
    };

    this.listarReacciones = function (comentarioIds, callback) {
        callback(undefined, this.reacciones.filter(function (reaccion) {
            return comentarioIds.indexOf(reaccion.comentarioId) !== -1;
        }).map(function (reaccion) { return Object.assign({}, reaccion); }));
    };

    this.buscarSesionMatch = function (codigo, callback) {
        let encontrada = this.sesionesMatch.find(function (sesion) { return sesion.codigo === codigo; });
        callback(undefined, encontrada ? clonarSesion(encontrada) : undefined);
    };

    this.guardarSesionMatch = function (sesion, callback) {
        let copia = clonarSesion(sesion);
        let indice = this.sesionesMatch.findIndex(function (guardada) { return guardada.codigo === copia.codigo; });
        if (indice === -1) this.sesionesMatch.push(copia);
        else this.sesionesMatch[indice] = copia;
        callback();
    };

    this.cerrarSesionesMatchDe = function (email, callback) {
        this.sesionesMatch.forEach(function (sesion) {
            if (sesion.estado !== "cerrada" && (sesion.anfitrionEmail === email || sesion.invitadoEmail === email)) {
                sesion.estado = "cerrada";
            }
        });
        callback();
    };

    this.cerrar = function () {};
}

function copiar(dato) {
    return dato ? Object.assign({}, dato) : undefined;
}

function clonarSesion(sesion) {
    return JSON.parse(JSON.stringify(sesion));
}

module.exports.CADMemoria = CADMemoria;
