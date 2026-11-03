const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("top semanal", function () {
    let sistema;
    let ahora = new Date("2026-11-03T12:00:00.000Z");

    beforeEach(function () {
        sistema = crearSistemaPrueba({
            ahora: function () { return ahora; }
        });
    });

    it("exige sesión", function (done) {
        sistema.topSemanal(undefined, function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("ordena por la media de la última semana y completa hasta cinco", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            poner(sistema, "oppenheimer", 2, "2026-11-02T12:00:00.000Z", function () {
                poner(sistema, "dune-parte-dos", 5, "2026-11-01T12:00:00.000Z", function () {
                    poner(sistema, "whiplash", 5, "2026-09-01T12:00:00.000Z", function () {
                        poner(sistema, "stranger-things", 4, "2026-11-02T08:00:00.000Z", function () {
                            sistema.topSemanal(ana, function (res) {
                                expect(res.peliculas.length).toEqual(5);
                                expect(res.series.length).toEqual(5);
                                expect(res.peliculas[0].id).toEqual("dune-parte-dos");
                                expect(res.peliculas[0].puesto).toEqual(1);
                                expect(res.peliculas[1].id).toEqual("oppenheimer");
                                expect(res.series[0].id).toEqual("stranger-things");
                                expect(res.series[0].medio).toEqual("serie");
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});

function poner(sistema, id, puntos, fecha, callback) {
    sistema._cadPrueba.insertarValoracion({
        id: "val-" + id,
        email: "ana@test.com",
        peliculaId: id,
        puntuacion: puntos,
        texto: "vista",
        fecha: fecha
    }, callback);
}

function entrar(sistema, email, nick, callback) {
    registrarYConfirmar(sistema, { email: email, nick: nick, password: "clave1234" }, function (res) {
        if (res.error) return callback(res);
        sistema.iniciarSesion(email, "clave1234", callback);
    });
}
