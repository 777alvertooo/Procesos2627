const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("match", function () {
    let sistema;

    beforeEach(function () {
        let turno = 0;
        sistema = crearSistemaPrueba({
            azar: function () { return 0; },
            generarCodigo: function () {
                turno = turno + 1;
                return "PART" + turno;
            }
        });
    });

    it("exige sesión para crear una partida", function (done) {
        sistema.crearSesionMatch(undefined, { medio: "pelicula", tipo: "cine" }, function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("crea una sesión de cine y la otra persona se une a la misma pareja", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                sistema.crearSesionMatch(ana, { medio: "pelicula", tipo: "cine", plataforma: "Netflix" }, function (creada) {
                    expect(creada.codigo).toEqual("PART1");
                    expect(creada.estado).toEqual("esperando");
                    expect(creada.anfitrion).toEqual(true);
                    expect(creada.opciones).toEqual([]);
                    sistema.unirseSesionMatch(ana, "part1", function (propia) {
                        expect(propia.estado).toEqual("esperando");
                        sistema.unirseSesionMatch(luis, "part1", function (unida) {
                            expect(unida.estado).toEqual("eligiendo");
                            expect(unida.ronda).toEqual(1);
                            expect(unida.opciones.length).toEqual(2);
                            expect(unida.opciones.every(function (opcion) { return opcion.tipo === "cine" && opcion.dondeVer === "En cines"; })).toEqual(true);
                            sistema.obtenerSesionMatch(ana, "PART1", function (anfitrion) {
                                expect(anfitrion.opciones.map(function (opcion) { return opcion.id; })).toEqual(unida.opciones.map(function (opcion) { return opcion.id; }));
                                expect(anfitrion.rivalConectado).toEqual(true);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    it("no deja entrar a una tercera persona", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                entrar(sistema, "maria@test.com", "maria", function (maria) {
                    sistema.crearSesionMatch(ana, { medio: "serie", tipo: "cualquiera", plataforma: "Netflix" }, function (creada) {
                        sistema.unirseSesionMatch(luis, creada.codigo, function (unida) {
                            expect(unida.opciones.every(function (opcion) { return opcion.medio === "serie" && opcion.dondeVer === "Netflix"; })).toEqual(true);
                            sistema.unirseSesionMatch(maria, creada.codigo, function (rechazada) {
                                expect(rechazada.tipo).toEqual(TipoError.CONFLICTO);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    it("hace match cuando los dos eligen el mismo título y no revela la elección del otro", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                sistema.crearSesionMatch(ana, { medio: "pelicula", tipo: "plataforma", plataforma: "Filmin" }, function (creada) {
                    sistema.unirseSesionMatch(luis, creada.codigo, function (unida) {
                        let elegida = unida.opciones[0].id;
                        sistema.elegirMatch(ana, creada.codigo, elegida, function (espera) {
                            expect(espera.estado).toEqual("eligiendo");
                            expect(espera.miEleccion).toEqual(elegida);
                            sistema.obtenerSesionMatch(luis, creada.codigo, function (luisEspera) {
                                expect(luisEspera.miEleccion).toEqual(null);
                                expect(luisEspera.rivalListo).toEqual(true);
                                expect(luisEspera.ronda).toEqual(1);
                                sistema.elegirMatch(luis, creada.codigo, elegida, function (match) {
                                    expect(match.estado).toEqual("match");
                                    expect(match.match.id).toEqual(elegida);
                                    expect(match.match.cartel).toContain("https://");
                                    expect(match.match.sinopsis).toBeDefined();
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("pasa de ronda si no coinciden y solo vuelve a elegir cuando los dos quieren", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                sistema.crearSesionMatch(ana, { medio: "pelicula", tipo: "cine" }, function (creada) {
                    sistema.unirseSesionMatch(luis, creada.codigo, function () {
                        jugarDistinto(sistema, ana, luis, creada.codigo, 10, [], function (vistas) {
                            let ultima = vistas[vistas.length - 1];
                            expect(ultima.estado).toEqual("agotada");
                            expect(ultima.ronda).toEqual(10);
                            let usadas = [];
                            vistas.forEach(function (vista) {
                                if (vista.opciones) vista.opciones.forEach(function (opcion) { usadas.push(opcion.id); });
                            });
                            sistema.reiniciarSesionMatch(ana, creada.codigo, false, function (espera) {
                                expect(espera.estado).toEqual("agotada");
                                expect(espera.yoReinicia).toEqual(true);
                                expect(espera.rivalReinicia).toEqual(false);
                                sistema.obtenerSesionMatch(luis, creada.codigo, function (luisEspera) {
                                    expect(luisEspera.estado).toEqual("agotada");
                                    expect(luisEspera.yoReinicia).toEqual(false);
                                    expect(luisEspera.rivalReinicia).toEqual(true);
                                    sistema.reiniciarSesionMatch(luis, creada.codigo, false, function (nueva) {
                                        expect(nueva.estado).toEqual("eligiendo");
                                        expect(nueva.ronda).toEqual(1);
                                        expect(nueva.opciones.length).toEqual(2);
                                        expect(usadas.indexOf(nueva.opciones[0].id) !== -1 || usadas.indexOf(nueva.opciones[1].id) !== -1).toEqual(true);
                                        sistema.cerrarSesionMatch(luis, creada.codigo, function (cerrada) {
                                            expect(cerrada.cerrada).toEqual(true);
                                            sistema.obtenerSesionMatch(ana, creada.codigo, function (ausente) {
                                                expect(ausente.tipo).toEqual(TipoError.NO_ENCONTRADO);
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

    it("al volver a empezar puede repetir la primera pareja", function (done) {
        entrar(sistema, "ana@test.com", "ana", function (ana) {
            entrar(sistema, "luis@test.com", "luis", function (luis) {
                sistema.crearSesionMatch(ana, { medio: "pelicula", tipo: "cualquiera", plataforma: "Max" }, function (creada) {
                    sistema.unirseSesionMatch(luis, creada.codigo, function (primera) {
                        let ids = primera.opciones.map(function (opcion) { return opcion.id; });
                        jugarDistinto(sistema, ana, luis, creada.codigo, 10, [], function () {
                            sistema.reiniciarSesionMatch(ana, creada.codigo, true, function (espera) {
                                expect(espera.estado).toEqual("agotada");
                                sistema.reiniciarSesionMatch(luis, creada.codigo, true, function (repetida) {
                                    expect(repetida.opciones.map(function (opcion) { return opcion.id; })).toEqual(ids);
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

function jugarDistinto(sistema, ana, luis, codigo, restantes, vistas, callback) {
    if (restantes === 0) return callback(vistas);
    sistema.obtenerSesionMatch(ana, codigo, function (vista) {
        vistas.push(vista);
        sistema.elegirMatch(ana, codigo, vista.opciones[0].id, function () {
            sistema.elegirMatch(luis, codigo, vista.opciones[1].id, function (despues) {
                if (despues.estado === "agotada") vistas.push(despues);
                jugarDistinto(sistema, ana, luis, codigo, restantes - 1, vistas, callback);
            });
        });
    });
}

function entrar(sistema, email, nick, callback) {
    registrarYConfirmar(sistema, { email: email, nick: nick, password: "clave1234" }, function (res) {
        if (res.error) return callback(res);
        sistema.iniciarSesion(email, "clave1234", callback);
    });
}
