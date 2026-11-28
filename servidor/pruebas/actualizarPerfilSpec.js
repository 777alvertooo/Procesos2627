const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("actualizarPerfil", function () {
    let sistema;
    let pepe = { email: "pepe@test.com", rol: "usuario" };

    beforeEach(function (done) {
        sistema = crearSistemaPrueba();
        registrarYConfirmar(sistema, { email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            done();
        });
    });

    it("permite cambiar el nick y el email", function (done) {
        sistema.actualizarPerfil(pepe, { nick: "pepeNuevo", email: "pepe2@test.com" }, function (res) {
            expect(res.error).toBeUndefined();
            expect(res.nick).toEqual("pepeNuevo");
            expect(res.email).toEqual("pepe2@test.com");
            done();
        });
    });

    it("al cambiar el email conserva pendientes, valoraciones, reacciones y Match", function (done) {
        sistema.iniciarSesion("pepe@test.com", "clave1234", function (usuario) {
            sistema.anadirPendiente(usuario, "whiplash", function () {
                sistema.valorarPelicula(usuario, { peliculaId: "parasitos", puntuacion: 5, texto: "Una obra redonda" }, function () {
                    sistema.crearSesionMatch(usuario, { medio: "pelicula", tipo: "cine" }, function (sala) {
                        expect(sala.codigo).toBeDefined();
                        sistema.actualizarPerfil(usuario, { nick: "pepe", email: "pepe2@test.com" }, function (perfil) {
                            expect(perfil.error).toBeUndefined();
                            expect(perfil.email).toEqual("pepe2@test.com");
                            let nuevo = { email: "pepe2@test.com", nick: "pepe", rol: "usuario" };
                            sistema.listarPendientes(nuevo, function (lista) {
                                expect(lista.pendientes.length).toEqual(1);
                                expect(lista.pendientes[0].id).toEqual("whiplash");
                                sistema.obtenerPelicula(nuevo, "parasitos", function (ficha) {
                                    expect(ficha.yaValorada).toEqual(true);
                                    expect(ficha.comentarios[0].esMio).toEqual(true);
                                    let comentarioId = ficha.comentarios[0].id;
                                    sistema.reaccionarComentario(nuevo, { comentarioId: comentarioId, tipo: "like" }, function (reaccion) {
                                        expect(reaccion.error).toBeUndefined();
                                        expect(reaccion.miReaccion).toEqual("like");
                                        sistema.obtenerSesionMatch(nuevo, sala.codigo, function (partida) {
                                            expect(partida.error).toBeUndefined();
                                            expect(partida.codigo).toEqual(sala.codigo);
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

    it("permite cambiar la contraseña", function (done) {
        sistema.actualizarPerfil(pepe, {
            nick: "pepe",
            email: "pepe@test.com",
            passwordActual: "clave1234",
            passwordNueva: "nuevaClave9",
            confirmarPassword: "nuevaClave9"
        }, function (res) {
            expect(res.error).toBeUndefined();
            sistema.iniciarSesion("pepe@test.com", "nuevaClave9", function (login) {
                expect(login.error).toBeUndefined();
                done();
            });
        });
    });

    it("rechaza un nick vacío", function (done) {
        sistema.actualizarPerfil(pepe, { nick: "   ", email: "pepe@test.com" }, function (res) {
            expect(res.tipo).toEqual(TipoError.VALIDACION);
            done();
        });
    });

    it("rechaza si la contraseña actual no es correcta", function (done) {
        sistema.actualizarPerfil(pepe, {
            nick: "pepe",
            email: "pepe@test.com",
            passwordActual: "malaclave",
            passwordNueva: "nuevaClave9",
            confirmarPassword: "nuevaClave9"
        }, function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });
});
