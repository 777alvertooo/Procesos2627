const { TipoError } = require("../logica/enums/TipoError.js");
const { RolUsuario } = require("../logica/enums/RolUsuario.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("cartelera", function () {
    let sistema;

    beforeEach(function () {
        sistema = crearSistemaPrueba({ emailsAdmin: ["admin@test.com"] });
    });

    it("exige sesión para ver el catálogo", function (done) {
        sistema.listarPeliculas(undefined, function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("devuelve el catálogo de cine y de plataforma", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.listarPeliculas(ana, function (res) {
                expect(res.peliculas.length).toEqual(330);
                expect(res.peliculas[0].id).toEqual("oppenheimer");
                expect(res.peliculas[0].titulo).toEqual("Oppenheimer");
                expect(res.peliculas[0].medio).toEqual("pelicula");
                expect(res.peliculas[0].sinopsis).toBeDefined();
                expect(res.peliculas[0].cartel).toContain("https://");
                expect(res.peliculas[0].dondeVer).toEqual("En cines");
                expect(res.peliculas[0].cines).toContain("Cinesa Príncipe Pío");
                expect(res.peliculas[5].cines).toEqual([]);
                expect(res.peliculas[0].trailerUrl).toEqual("https://www.youtube.com/watch?v=uYPbbksJxIg");
                expect(res.idsPendientes).toEqual([]);
                expect(res.idsVistas).toEqual([]);
                let pelis = res.peliculas.filter(function (p) { return p.medio === "pelicula"; });
                let series = res.peliculas.filter(function (p) { return p.medio === "serie"; });
                let cines = pelis.filter(function (p) { return p.tipo === "cine"; });
                let plataformas = pelis.filter(function (p) { return p.tipo === "plataforma"; });
                expect(pelis.length).toEqual(180);
                expect(series.length).toEqual(150);
                expect(cines.length).toEqual(30);
                expect(plataformas.length).toEqual(150);
                ["Netflix", "Prime Video", "Disney+", "Max", "Filmin"].forEach(function (plataforma) {
                    expect(pelis.filter(function (p) { return p.dondeVer === plataforma; }).length).toEqual(30);
                    expect(series.filter(function (p) { return p.dondeVer === plataforma; }).length).toEqual(30);
                });
                expect(series.every(function (p) { return p.tipo === "plataforma" && p.cines.length === 0 && p.dondeVer; })).toEqual(true);
                expect(series[0].id).toEqual("stranger-things");
                expect(series[0].dondeVer).toEqual("Netflix");
                expect(series[0].temporadas.length).toEqual(5);
                expect(series[0].temporadas[0]).toEqual({ numero: 1, capitulos: 8 });
                expect(series[0].temporadas[4].capitulos).toEqual(8);
                done();
            });
        });
    });

    it("añade y quita una película de la lista de pendientes", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.anadirPendiente(ana, "whiplash", function (alta) {
                expect(alta.enLista).toEqual(true);
                sistema.anadirPendiente(ana, "whiplash", function () {
                    sistema.listarPendientes(ana, function (lista) {
                        expect(lista.pendientes.length).toEqual(1);
                        expect(lista.pendientes[0].titulo).toEqual("Whiplash");
                        expect(lista.pendientes[0].yaValorada).toEqual(false);
                        sistema.quitarPendiente(ana, "whiplash", function (baja) {
                            expect(baja.enLista).toEqual(false);
                            sistema.listarPendientes(ana, function (vacia) {
                                expect(vacia.pendientes).toEqual([]);
                                sistema.quitarPendiente(ana, "whiplash", function (otra) {
                                    expect(otra.enLista).toEqual(false);
                                    sistema.anadirPendiente(ana, "whiplash", function () {
                                        sistema.valorarPelicula(ana, { peliculaId: "whiplash", puntuacion: 5, texto: "Ya la he visto" }, function (vista) {
                                            expect(vista.quitadaDePendientes).toEqual(true);
                                            sistema.listarPendientes(ana, function (sinElla) {
                                                expect(sinElla.pendientes).toEqual([]);
                                                sistema.anadirPendiente(ana, "whiplash", function (repetida) {
                                                    expect(repetida.tipo).toEqual(TipoError.CONFLICTO);
                                                    sistema.listarPeliculas(ana, function (catalogo) {
                                                        expect(catalogo.idsPendientes).not.toContain("whiplash");
                                                        expect(catalogo.idsVistas).toContain("whiplash");
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
                });
            });
        });
    });

    it("muestra la media y los comentarios antes de puntuar, y deja puntuar después", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                sistema.obtenerPelicula(luis, "parasitos", function (vacia) {
                    expect(vacia.yaValorada).toEqual(false);
                    expect(vacia.media).toEqual(null);
                    expect(vacia.numeroComentarios).toEqual(0);
                    expect(vacia.comentarios).toEqual([]);
                    sistema.valorarPelicula(ana, { peliculaId: "parasitos", puntuacion: 5, texto: "Una obra redonda" }, function () {
                        sistema.obtenerPelicula(luis, "parasitos", function (antes) {
                            expect(antes.yaValorada).toEqual(false);
                            expect(antes.media).toEqual(5);
                            expect(antes.numeroComentarios).toEqual(1);
                            expect(antes.comentarios[0].texto).toEqual("Una obra redonda");
                            sistema.valorarPelicula(luis, { peliculaId: "parasitos", puntuacion: 3, texto: "Me gustó el final" }, function () {
                                sistema.obtenerPelicula(luis, "parasitos", function (despues) {
                                    expect(despues.yaValorada).toEqual(true);
                                    expect(despues.media).toEqual(4);
                                    expect(despues.numeroComentarios).toEqual(2);
                                    expect(despues.comentarios[1].esMio).toEqual(true);
                                    expect(despues.comentarios[1].nick).toEqual("luis");
                                    expect(despues.comentarios[1].puntuacion).toEqual(3);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("rechaza una puntuación fuera de rango o un comentario vacío, y admite otra valoración", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            sistema.valorarPelicula(ana, { peliculaId: "interstellar", puntuacion: 6, texto: "hola" }, function (rango) {
                expect(rango.tipo).toEqual(TipoError.VALIDACION);
                sistema.valorarPelicula(ana, { peliculaId: "interstellar", puntuacion: 4, texto: "   " }, function (vacio) {
                    expect(vacio.tipo).toEqual(TipoError.VALIDACION);
                    sistema.valorarPelicula(ana, { peliculaId: "no-existe", puntuacion: 4, texto: "comentario" }, function (ausente) {
                        expect(ausente.tipo).toEqual(TipoError.NO_ENCONTRADO);
                        sistema.valorarPelicula(ana, { peliculaId: "interstellar", puntuacion: 4, texto: "El tiempo pesa" }, function (ok) {
                            expect(ok.ok).toEqual(true);
                            sistema.valorarPelicula(ana, { peliculaId: "interstellar", puntuacion: 2, texto: "otra" }, function (otra) {
                                expect(otra.ok).toEqual(true);
                                sistema.obtenerPelicula(ana, "interstellar", function (ficha) {
                                    expect(ficha.numeroComentarios).toEqual(2);
                                    expect(ficha.media).toEqual(3);
                                    expect(ficha.yaValorada).toEqual(true);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("permite like, dislike y respuesta solo después de valorar, también a un admin", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "admin@test.com", "admin", function (admin) {
                expect(admin.rol).toEqual(RolUsuario.ADMIN);
                sistema.valorarPelicula(ana, { peliculaId: "el-irlandes", puntuacion: 5, texto: "De Niro enorme" }, function () {
                    sistema.obtenerPelicula(ana, "el-irlandes", function (ficha) {
                        let comentarioId = ficha.comentarios[0].id;
                        sistema.reaccionarComentario(admin, { comentarioId: comentarioId, tipo: "like" }, function (prohibido) {
                            expect(prohibido.tipo).toEqual(TipoError.PROHIBIDO);
                            sistema.responderComentario(admin, { valoracionId: comentarioId, texto: "Totalmente" }, function (sinValoracion) {
                                expect(sinValoracion.tipo).toEqual(TipoError.PROHIBIDO);
                                sistema.valorarPelicula(admin, { peliculaId: "el-irlandes", puntuacion: 4, texto: "Largo, pero justo" }, function () {
                                    sistema.reaccionarComentario(admin, { comentarioId: comentarioId, tipo: "like" }, function () {
                                        sistema.reaccionarComentario(admin, { comentarioId: comentarioId, tipo: "like" }, function (apagado) {
                                            expect(apagado.miReaccion).toEqual(null);
                                            sistema.reaccionarComentario(admin, { comentarioId: comentarioId, tipo: "dislike" }, function () {
                                                sistema.responderComentario(admin, { valoracionId: comentarioId, texto: "El silencio final pesa" }, function () {
                                                    sistema.obtenerPelicula(ana, "el-irlandes", function (conDebate) {
                                                        let hilo = conDebate.comentarios[0];
                                                        expect(hilo.dislikes).toEqual(1);
                                                        expect(hilo.likes).toEqual(0);
                                                        expect(hilo.respuestas.length).toEqual(1);
                                                        expect(hilo.respuestas[0].nick).toEqual("admin");
                                                        expect(hilo.respuestas[0].texto).toEqual("El silencio final pesa");
                                                        sistema.reaccionarComentario(ana, { comentarioId: hilo.respuestas[0].id, tipo: "like" }, function () {
                                                            sistema.obtenerPelicula(ana, "el-irlandes", function (conLike) {
                                                                expect(conLike.comentarios[0].respuestas[0].likes).toEqual(1);
                                                                expect(conLike.comentarios[0].respuestas[0].miReaccion).toEqual("like");
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
                        });
                    });
                });
            });
        });
    });

    it("solo un admin crea, edita y borra películas", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "admin@test.com", "admin", function (admin) {
                let datos = {
                    titulo: "La prueba",
                    sinopsis: "Una película creada desde el panel de administración.",
                    tipo: "cine",
                    cartel: "https://example.com/cartel.jpg",
                    trailer: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    cines: "Cines Prueba\nYelmo Centro"
                };
                sistema.crearPelicula(ana, datos, function (prohibida) {
                    expect(prohibida.tipo).toEqual(TipoError.PROHIBIDO);
                    sistema.crearPelicula(admin, { titulo: "Sin datos" }, function (incompleta) {
                        expect(incompleta.tipo).toEqual(TipoError.VALIDACION);
                        sistema.crearPelicula(admin, datos, function (creada) {
                            expect(creada.ok).toEqual(true);
                            expect(creada.id).toEqual("la-prueba");
                            sistema.obtenerPelicula(ana, creada.id, function (ficha) {
                                expect(ficha.pelicula.titulo).toEqual("La prueba");
                                expect(ficha.pelicula.cines).toEqual(["Cines Prueba", "Yelmo Centro"]);
                                expect(ficha.pelicula.dondeVer).toEqual("En cines");
                                expect(ficha.pelicula.trailerUrl).toEqual("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                                sistema.anadirPendiente(ana, creada.id, function () {
                                    sistema.valorarPelicula(ana, { peliculaId: creada.id, puntuacion: 4, texto: "Bien" }, function () {
                                        datos.titulo = "La prueba final";
                                        datos.sinopsis = "Sinopsis corregida por el admin.";
                                        sistema.actualizarPelicula(ana, creada.id, datos, function (sinPermiso) {
                                            expect(sinPermiso.tipo).toEqual(TipoError.PROHIBIDO);
                                            sistema.actualizarPelicula(admin, creada.id, datos, function (editada) {
                                                expect(editada.ok).toEqual(true);
                                                sistema.obtenerPelicula(admin, creada.id, function (actual) {
                                                    expect(actual.pelicula.titulo).toEqual("La prueba final");
                                                    expect(actual.pelicula.sinopsis).toEqual("Sinopsis corregida por el admin.");
                                                    sistema.eliminarPelicula(ana, creada.id, function (noBorra) {
                                                        expect(noBorra.tipo).toEqual(TipoError.PROHIBIDO);
                                                        sistema.eliminarPelicula(admin, creada.id, function (borrada) {
                                                            expect(borrada.ok).toEqual(true);
                                                            sistema.obtenerPelicula(ana, creada.id, function (ausente) {
                                                                expect(ausente.tipo).toEqual(TipoError.NO_ENCONTRADO);
                                                                sistema.listarPendientes(ana, function (lista) {
                                                                    expect(lista.pendientes).toEqual([]);
                                                                    sistema.crearPelicula(admin, {
                                                                        titulo: "Solo en Filmin",
                                                                        sinopsis: "Se ve en casa.",
                                                                        tipo: "plataforma",
                                                                        cartel: "https://example.com/filmin.jpg",
                                                                        trailer: "dQw4w9WgXcQ",
                                                                        dondeVer: "Filmin"
                                                                    }, function (plataforma) {
                                                                        sistema.obtenerPelicula(admin, plataforma.id, function (enCasa) {
                                                                            expect(enCasa.pelicula.tipo).toEqual("plataforma");
                                                                            expect(enCasa.pelicula.dondeVer).toEqual("Filmin");
                                                                            expect(enCasa.pelicula.cines).toEqual([]);
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
                                    });
                                });
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
