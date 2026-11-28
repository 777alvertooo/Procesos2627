const { ErrorSistema } = require("../errores/ErrorSistema.js");
const { exigirSesion } = require("../autorizacion/exigirSesion.js");

function ListarHistorialMatch(cad) {
    this.ejecutar = function (solicitante, callback) {
        let denegado = exigirSesion(solicitante);
        if (denegado) return callback(denegado);
        cad.listarHistorialMatch(solicitante.email, function (err, lista) {
            if (err) return callback(ErrorSistema.interno(err));
            callback({
                partidas: (lista || []).map(function (partida) {
                    return aPublica(partida, solicitante.email);
                })
            });
        });
    };
}

function aPublica(partida, email) {
    let soyAnfitrion = partida.anfitrionEmail === email;
    return {
        id: partida.id,
        codigo: partida.codigo,
        fecha: partida.fecha,
        resultado: partida.resultado,
        filtro: partida.filtro || {},
        rivalNick: soyAnfitrion ? partida.invitadoNick : partida.anfitrionNick,
        match: partida.matchId ? { id: partida.matchId, titulo: partida.matchTitulo || partida.matchId } : null,
        rondas: (partida.rondas || []).map(function (ronda) {
            return {
                numero: ronda.numero,
                opciones: (ronda.opciones || []).slice(),
                miEleccion: soyAnfitrion ? ronda.eleccionAnfitrion : ronda.eleccionInvitado,
                rivalEleccion: soyAnfitrion ? ronda.eleccionInvitado : ronda.eleccionAnfitrion,
                coincide: !!ronda.coincide
            };
        })
    };
}

module.exports.ListarHistorialMatch = ListarHistorialMatch;
