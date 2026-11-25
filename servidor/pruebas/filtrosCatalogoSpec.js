const { TipoError } = require("../logica/enums/TipoError.js");
const { GENEROS_PELICULA } = require("../logica/enums/GeneroPelicula.js");
const { GENEROS_CATALOGO } = require("../datos/generosCatalogo.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("filtros combinados del catálogo", function () {
    let sistema;

    beforeEach(function () {
        sistema = crearSistemaPrueba({ emailsAdmin: ["admin@test.com"] });
    });

    it("todos los títulos del catálogo tienen géneros válidos", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, {}, function (res) {
                expect(res.peliculas.length).toEqual(330);
                let sinGenero = res.peliculas.filter(function (p) { return !p.generos.length; });
                expect(sinGenero).toEqual([]);
                let desconocidos = [];
                Object.keys(GENEROS_CATALOGO).forEach(function (id) {
                    GENEROS_CATALOGO[id].forEach(function (genero) {
                        if (GENEROS_PELICULA.indexOf(genero) === -1) desconocidos.push(id + ": " + genero);
                    });
                });
                expect(desconocidos).toEqual([]);
                expect(res.opcionesFiltro.generos).toEqual(GENEROS_PELICULA.slice());
                expect(res.opcionesFiltro.plataformas).toEqual(["Disney+", "Filmin", "Max", "Netflix", "Prime Video"]);
                done();
            });
        });
    });

    it("sin filtros devuelve todo el catálogo, como antes", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, function (res) {
                expect(res.peliculas.length).toEqual(330);
                expect(res.filtros).toEqual({});
                done();
            });
        });
    });

    it("combina plataforma y género", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, { plataforma: "Netflix", genero: "Drama" }, function (res) {
                expect(res.filtros).toEqual({ plataforma: "Netflix", genero: "Drama" });
                expect(res.peliculas.length).toBeGreaterThan(0);
                expect(res.peliculas.every(function (p) {
                    return p.dondeVer === "Netflix" && p.generos.indexOf("Drama") !== -1;
                })).toEqual(true);
                let ids = res.peliculas.map(function (p) { return p.id; });
                expect(ids).toContain("whiplash");
                expect(ids).toContain("el-irlandes");
                expect(ids).not.toContain("interstellar");
                done();
            });
        });
    });

    it("acepta el género sin tildes ni mayúsculas", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, { genero: "ciencia ficcion" }, function (res) {
                expect(res.filtros.genero).toEqual("Ciencia ficción");
                expect(res.peliculas.map(function (p) { return p.id; })).toContain("interstellar");
                done();
            });
        });
    });

    it("filtra por valoración media mínima y la combina con plataforma y género", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                sistema.valorarPelicula(ana, { peliculaId: "whiplash", puntuacion: 5, texto: "Muy intensa" }, function () {
                    sistema.valorarPelicula(luis, { peliculaId: "whiplash", puntuacion: 4, texto: "Gran final" }, function () {
                        sistema.valorarPelicula(ana, { peliculaId: "el-irlandes", puntuacion: 2, texto: "Muy larga" }, function () {
                            sistema.listarPeliculas(ana, { valoracionMinima: "4" }, function (soloNota) {
                                expect(soloNota.peliculas.map(function (p) { return p.id; })).toEqual(["whiplash"]);
                                expect(soloNota.peliculas[0].valoracionMedia).toEqual(4.5);
                                expect(soloNota.peliculas[0].numValoraciones).toEqual(2);
                                sistema.listarPeliculas(ana, { plataforma: "Netflix", genero: "Drama", valoracionMinima: 2 }, function (todos) {
                                    let ids = todos.peliculas.map(function (p) { return p.id; });
                                    expect(ids.length).toEqual(2);
                                    expect(ids).toContain("whiplash");
                                    expect(ids).toContain("el-irlandes");
                                    sistema.listarPeliculas(ana, { plataforma: "Prime Video", valoracionMinima: 2 }, function (ninguno) {
                                        expect(ninguno.peliculas).toEqual([]);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("los títulos sin valoraciones no tienen media y no pasan el filtro de valoración", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, {}, function (res) {
                let oppenheimer = res.peliculas.find(function (p) { return p.id === "oppenheimer"; });
                expect(oppenheimer.valoracionMedia).toEqual(null);
                expect(oppenheimer.numValoraciones).toEqual(0);
                sistema.listarPeliculas(ana, { valoracionMinima: 1 }, function (filtrado) {
                    expect(filtrado.peliculas).toEqual([]);
                    done();
                });
            });
        });
    });

    it("rechaza filtros no válidos", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, { genero: "Western" }, function (genero) {
                expect(genero.tipo).toEqual(TipoError.VALIDACION);
                sistema.listarPeliculas(ana, { valoracionMinima: "7" }, function (nota) {
                    expect(nota.tipo).toEqual(TipoError.VALIDACION);
                    sistema.listarPeliculas(ana, { valoracionMinima: "3.5" }, function (decimal) {
                        expect(decimal.tipo).toEqual(TipoError.VALIDACION);
                        done();
                    });
                });
            });
        });
    });

    it("sigue exigiendo sesión aunque haya filtros", function (done) {
        sistema.listarPeliculas(undefined, { genero: "Drama" }, function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("el administrador asigna géneros al crear y los conserva al editar sin enviarlos", function (done) {
        entrar(sistema, "admin@test.com", "admin", function (admin) {
            let datos = {
                titulo: "Película de prueba",
                sinopsis: "Una sinopsis corta.",
                tipo: "plataforma",
                medio: "pelicula",
                dondeVer: "Filmin",
                cartel: "https://example.com/cartel.jpg",
                trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
                generos: ["Comedia", "terror"]
            };
            sistema.crearPelicula(admin, datos, function (creada) {
                expect(creada.ok).toEqual(true);
                sistema.listarPeliculas(admin, { plataforma: "Filmin", genero: "Terror" }, function (res) {
                    let nueva = res.peliculas.find(function (p) { return p.id === creada.id; });
                    expect(nueva.generos).toEqual(["Comedia", "Terror"]);
                    let sinGeneros = Object.assign({}, datos);
                    delete sinGeneros.generos;
                    sinGeneros.titulo = "Película de prueba editada";
                    sistema.actualizarPelicula(admin, creada.id, sinGeneros, function (editada) {
                        expect(editada.ok).toEqual(true);
                        sistema.listarPeliculas(admin, { genero: "Comedia" }, function (despues) {
                            let misma = despues.peliculas.find(function (p) { return p.id === creada.id; });
                            expect(misma.titulo).toEqual("Película de prueba editada");
                            expect(misma.generos).toEqual(["Comedia", "Terror"]);
                            datos.generos = ["Comedia", "Drama", "Terror", "Romance"];
                            sistema.crearPelicula(admin, datos, function (demasiados) {
                                expect(demasiados.tipo).toEqual(TipoError.VALIDACION);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});

function entrar(sistema, email, nick, callback) {
    registrarYConfirmar(sistema, { email: email, nick: nick, password: "clave1234" }, function (res) {
        if (res.error) return callback(res);
        sistema.iniciarSesion(email, "clave1234", callback);
    });
}
