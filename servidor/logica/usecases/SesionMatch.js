const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { TipoError } = require("../enums/TipoError.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");
const { PeliculaMapper } = require("../mappers/PeliculaMapper.js");

const PLATAFORMAS = ["Netflix", "Prime Video", "Disney+", "Max", "Filmin"];
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RONDAS = 10;

function SesionMatch(cad, opciones) {
    opciones = opciones || {};
    let azar = opciones.azar || Math.random;
    let generarCodigo = opciones.generarCodigo;
    let colas = {};

    function enSerie(clave, trabajo, callback) {
        let hecho = colas[clave] || Promise.resolve();
        let siguiente = hecho.then(function () {
            return new Promise(function (resolve) {
                trabajo(function (resultado) {
                    resolve();
                    callback(resultado);
                });
            });
        });
        colas[clave] = siguiente.catch(function () {});
        siguiente.catch(function (err) { callback(ErrorSistema.interno(err)); });
    }

    this.crear = function (solicitante, datos, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        let filtro = leerFiltro(datos || {});
        if (filtro.error) return callback(new ErrorSistema(TipoError.VALIDACION, filtro.error));
        enSerie(solicitante.email, function (seguir) {
            cad.listarPeliculas(function (err, peliculas) {
                if (err) return seguir(ErrorSistema.interno(err));
                if (candidatas(peliculas, filtro.filtro, []).length < 2) {
                    return seguir(new ErrorSistema(TipoError.VALIDACION, "No hay suficientes títulos con ese filtro"));
                }
                cad.cerrarSesionesMatchDe(solicitante.email, function (errCierre) {
                    if (errCierre) return seguir(ErrorSistema.interno(errCierre));
                    codigoLibre(cad, generarCodigo, azar, 0, function (errCodigo, codigo) {
                        if (errCodigo) return seguir(errCodigo);
                        let sesion = {
                            codigo: codigo,
                            anfitrionEmail: solicitante.email,
                            invitadoEmail: null,
                            filtro: filtro.filtro,
                            estado: "esperando",
                            ronda: 0,
                            pareja: [],
                            elecciones: {},
                            usadas: [],
                            matchId: null
                        };
                        cad.guardarSesionMatch(sesion, function (errGuardar) {
                            if (errGuardar) return seguir(ErrorSistema.interno(errGuardar));
                            seguir(vistaDe(sesion, solicitante.email, peliculas));
                        });
                    });
                });
            });
        }, callback);
    };

    this.unirse = function (solicitante, codigo, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        codigo = normalizarCodigo(codigo);
        if (!codigo) return callback(new ErrorSistema(TipoError.VALIDACION, "Escribe el código de la sesión"));
        enSerie(codigo, function (seguir) {
            cad.buscarSesionMatch(codigo, function (err, sesion) {
                if (err) return seguir(ErrorSistema.interno(err));
                if (!sesion) return seguir(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa sesión"));
                if (sesion.estado === "cerrada") return seguir(new ErrorSistema(TipoError.CONFLICTO, "Esta sesión está cerrada"));
                if (esParticipante(sesion, solicitante.email)) {
                    return conPeliculas(cad, function (errLista, peliculas) {
                        if (errLista) return seguir(errLista);
                        seguir(vistaDe(sesion, solicitante.email, peliculas));
                    });
                }
                if (sesion.estado !== "esperando" || sesion.invitadoEmail) {
                    return seguir(new ErrorSistema(TipoError.CONFLICTO, "Esa sesión ya está en marcha"));
                }
                cad.listarPeliculas(function (errLista, peliculas) {
                    if (errLista) return seguir(ErrorSistema.interno(errLista));
                    sesion.invitadoEmail = solicitante.email;
                    let preparada = prepararRonda(sesion, peliculas, azar, false);
                    if (preparada.error) return seguir(new ErrorSistema(TipoError.VALIDACION, preparada.error));
                    cad.guardarSesionMatch(sesion, function (errGuardar) {
                        if (errGuardar) return seguir(ErrorSistema.interno(errGuardar));
                        seguir(vistaDe(sesion, solicitante.email, peliculas));
                    });
                });
            });
        }, callback);
    };

    this.obtener = function (solicitante, codigo, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        codigo = normalizarCodigo(codigo);
        cad.buscarSesionMatch(codigo, function (err, sesion) {
            if (err) return callback(ErrorSistema.interno(err));
                if (!sesion || sesion.estado === "cerrada" || !esParticipante(sesion, solicitante.email)) {
                    return callback(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa sesión"));
                }
            conPeliculas(cad, function (errLista, peliculas) {
                if (errLista) return callback(errLista);
                callback(vistaDe(sesion, solicitante.email, peliculas));
            });
        });
    };

    this.elegir = function (solicitante, codigo, peliculaId, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        codigo = normalizarCodigo(codigo);
        peliculaId = typeof peliculaId === "string" ? peliculaId.trim() : "";
        enSerie(codigo, function (seguir) {
            cad.buscarSesionMatch(codigo, function (err, sesion) {
                if (err) return seguir(ErrorSistema.interno(err));
                if (!sesion || !esParticipante(sesion, solicitante.email)) {
                    return seguir(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa sesión"));
                }
                if (sesion.estado !== "eligiendo") {
                    return conPeliculas(cad, function (errLista, peliculas) {
                        if (errLista) return seguir(errLista);
                        seguir(vistaDe(sesion, solicitante.email, peliculas));
                    });
                }
                if (sesion.pareja.indexOf(peliculaId) === -1) {
                    return seguir(new ErrorSistema(TipoError.VALIDACION, "Elige una de las dos opciones"));
                }
                if (!sesion.elecciones[solicitante.email]) sesion.elecciones[solicitante.email] = peliculaId;
                cad.listarPeliculas(function (errLista, peliculas) {
                    if (errLista) return seguir(ErrorSistema.interno(errLista));
                    let avanzado = avanzarSiHayDos(sesion, peliculas, azar);
                    if (avanzado.error) return seguir(new ErrorSistema(TipoError.VALIDACION, avanzado.error));
                    cad.guardarSesionMatch(sesion, function (errGuardar) {
                        if (errGuardar) return seguir(ErrorSistema.interno(errGuardar));
                        seguir(vistaDe(sesion, solicitante.email, peliculas));
                    });
                });
            });
        }, callback);
    };

    this.reiniciar = function (solicitante, codigo, repetir, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        codigo = normalizarCodigo(codigo);
        enSerie(codigo, function (seguir) {
            cad.buscarSesionMatch(codigo, function (err, sesion) {
                if (err) return seguir(ErrorSistema.interno(err));
                if (!sesion || !esParticipante(sesion, solicitante.email)) {
                    return seguir(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa sesión"));
                }
                if (sesion.estado !== "agotada") {
                    return seguir(new ErrorSistema(TipoError.CONFLICTO, "Solo se puede volver a empezar cuando se acaban las rondas"));
                }
                cad.listarPeliculas(function (errLista, peliculas) {
                    if (errLista) return seguir(ErrorSistema.interno(errLista));
                    if (repetir) sesion.usadas = [];
                    sesion.estado = "eligiendo";
                    sesion.ronda = 0;
                    sesion.elecciones = {};
                    sesion.matchId = null;
                    sesion.pareja = [];
                    let preparada = prepararRonda(sesion, peliculas, azar, false);
                    if (preparada.error) return seguir(new ErrorSistema(TipoError.VALIDACION, preparada.error));
                    cad.guardarSesionMatch(sesion, function (errGuardar) {
                        if (errGuardar) return seguir(ErrorSistema.interno(errGuardar));
                        seguir(vistaDe(sesion, solicitante.email, peliculas));
                    });
                });
            });
        }, callback);
    };

    this.cerrar = function (solicitante, codigo, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        codigo = normalizarCodigo(codigo);
        enSerie(codigo, function (seguir) {
            cad.buscarSesionMatch(codigo, function (err, sesion) {
                if (err) return seguir(ErrorSistema.interno(err));
                if (!sesion || !esParticipante(sesion, solicitante.email)) {
                    return seguir(new ErrorSistema(TipoError.NO_ENCONTRADO, "No existe esa sesión"));
                }
                sesion.estado = "cerrada";
                cad.guardarSesionMatch(sesion, function (errGuardar) {
                    if (errGuardar) return seguir(ErrorSistema.interno(errGuardar));
                    seguir({ cerrada: true, codigo: sesion.codigo });
                });
            });
        }, callback);
    };
}

function conPeliculas(cad, callback) {
    cad.listarPeliculas(function (err, peliculas) {
        if (err) return callback(ErrorSistema.interno(err));
        callback(undefined, peliculas);
    });
}

function leerFiltro(datos) {
    let medio = datos.medio === "serie" || datos.medio === "pelicula" ? datos.medio : "";
    if (!medio) return { error: "Elige si queréis una película o una serie" };
    let tipo = "cualquiera";
    if (medio === "pelicula") {
        if (datos.tipo !== "cine" && datos.tipo !== "plataforma" && datos.tipo !== "cualquiera") {
            return { error: "Elige si es de cine, de plataforma o da igual" };
        }
        tipo = datos.tipo;
    }
    let plataforma = "cualquiera";
    if (tipo !== "cine") {
        if (datos.plataforma && datos.plataforma !== "cualquiera") {
            if (PLATAFORMAS.indexOf(datos.plataforma) === -1) return { error: "Elige una plataforma o da igual" };
            plataforma = datos.plataforma;
        }
    }
    return { filtro: { medio: medio, tipo: tipo, plataforma: plataforma } };
}

function candidatas(peliculas, filtro, usadas) {
    return (peliculas || []).filter(function (pelicula) {
        if (usadas.indexOf(pelicula.id) !== -1) return false;
        let medio = pelicula.medio === "serie" ? "serie" : "pelicula";
        if (medio !== filtro.medio) return false;
        if (filtro.medio === "pelicula" && filtro.tipo !== "cualquiera" && pelicula.tipo !== filtro.tipo) return false;
        if (filtro.plataforma !== "cualquiera" && pelicula.dondeVer !== filtro.plataforma) return false;
        return true;
    });
}

function barajar(lista, azar) {
    let copia = lista.slice();
    let i;
    for (i = copia.length - 1; i > 0; i--) {
        let destino = Math.floor(azar() * (i + 1));
        let cambio = copia[i];
        copia[i] = copia[destino];
        copia[destino] = cambio;
    }
    return copia;
}

function prepararRonda(sesion, peliculas, azar, permitirRepetir) {
    if (permitirRepetir) sesion.usadas = [];
    let pool = candidatas(peliculas, sesion.filtro, sesion.usadas);
    if (pool.length < 2) return { error: "No quedan títulos nuevos. Puedes volver a empezar permitiendo que se repitan" };
    let pareja = barajar(pool, azar).slice(0, 2).map(function (pelicula) { return pelicula.id; });
    sesion.pareja = pareja;
    sesion.usadas = sesion.usadas.concat(pareja);
    sesion.ronda = sesion.ronda + 1;
    sesion.estado = "eligiendo";
    sesion.elecciones = {};
    sesion.matchId = null;
    return { ok: true };
}

function avanzarSiHayDos(sesion, peliculas, azar) {
    let anfitrion = sesion.elecciones[sesion.anfitrionEmail];
    let invitado = sesion.elecciones[sesion.invitadoEmail];
    if (!anfitrion || !invitado) return { ok: true };
    if (anfitrion === invitado) {
        sesion.estado = "match";
        sesion.matchId = anfitrion;
        return { ok: true };
    }
    if (sesion.ronda >= RONDAS) {
        sesion.estado = "agotada";
        sesion.elecciones = {};
        return { ok: true };
    }
    return prepararRonda(sesion, peliculas, azar, false);
}

function vistaDe(sesion, email, peliculas) {
    let porId = {};
    (peliculas || []).forEach(function (pelicula) { porId[pelicula.id] = pelicula; });
    let otro = email === sesion.anfitrionEmail ? sesion.invitadoEmail : sesion.anfitrionEmail;
    let opciones = (sesion.pareja || []).map(function (id) {
        return porId[id] ? PeliculaMapper.aPublica(porId[id]) : null;
    }).filter(function (pelicula) { return pelicula; });
    let match = sesion.matchId && porId[sesion.matchId] ? PeliculaMapper.aPublica(porId[sesion.matchId]) : null;
    return {
        codigo: sesion.codigo,
        estado: sesion.estado,
        ronda: sesion.ronda,
        maxRondas: RONDAS,
        filtro: sesion.filtro,
        anfitrion: email === sesion.anfitrionEmail,
        rivalConectado: !!sesion.invitadoEmail,
        rivalListo: !!(otro && sesion.elecciones[otro]),
        miEleccion: sesion.elecciones[email] || null,
        opciones: opciones,
        match: match,
        quedanNuevas: candidatas(peliculas, sesion.filtro, sesion.usadas).length >= 2
    };
}

function esParticipante(sesion, email) {
    return sesion.anfitrionEmail === email || sesion.invitadoEmail === email;
}

function normalizarCodigo(codigo) {
    return String(codigo || "").trim().toUpperCase();
}

function codigoAleatorio(azar) {
    let codigo = "";
    let i;
    for (i = 0; i < 6; i++) codigo = codigo + ALFABETO.charAt(Math.floor(azar() * ALFABETO.length));
    return codigo;
}

function codigoLibre(cad, generarCodigo, azar, intento, callback) {
    if (intento >= 8) return callback(new ErrorSistema(TipoError.CONFLICTO, "No se pudo crear el código. Inténtalo otra vez"));
    let codigo = generarCodigo ? generarCodigo() : codigoAleatorio(azar);
    cad.buscarSesionMatch(codigo, function (err, existente) {
        if (err) return callback(ErrorSistema.interno(err));
        if (existente && existente.estado !== "cerrada") return codigoLibre(cad, generarCodigo, azar, intento + 1, callback);
        callback(undefined, codigo);
    });
}

module.exports.SesionMatch = SesionMatch;
