const { TipoError } = require("../logica/enums/TipoError.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("iniciarSesion", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function (done) {
        sistema = crearSistemaPrueba();
        registrarYConfirmar(sistema, { email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            done();
        });
    });

    it("permite iniciar sesión con email y contraseña correctos", function (done) {
        sistema.iniciarSesion("pepe@test.com", "clave1234", function (res) {
            expect(res.error).toBeUndefined();
            expect(res.email).toEqual("pepe@test.com");
            expect(res.nick).toEqual("pepe");
            expect(res.clave).toBeUndefined();
            done();
        });
    });

    it("rechaza una contraseña incorrecta", function (done) {
        sistema.iniciarSesion("pepe@test.com", "incorrecta", function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("rechaza un usuario que no existe", function (done) {
        sistema.iniciarSesion("nadie@test.com", "clave1234", function (res) {
            expect(res.tipo).toEqual(TipoError.CREDENCIALES);
            done();
        });
    });

    it("rechaza la petición si falta la contraseña", function (done) {
        sistema.iniciarSesion("pepe@test.com", "", function (res) {
            expect(res.tipo).toEqual(TipoError.VALIDACION);
            done();
        });
    });

    it("rechaza el login si el email no está confirmado", function (done) {
        sistema.registrarUsuario({ email: "nuevo@test.com", password: "clave1234" }, function () {
            sistema.iniciarSesion("nuevo@test.com", "clave1234", function (res) {
                expect(res.tipo).toEqual(TipoError.PROHIBIDO);
                done();
            });
        });
    });

    it("un usuario eliminado no puede volver a iniciar sesión", function (done) {
        sistema.eliminarUsuario(admin, "pepe@test.com", function () {
            sistema.iniciarSesion("pepe@test.com", "clave1234", function (res) {
                expect(res.tipo).toEqual(TipoError.PROHIBIDO);
                done();
            });
        });
    });
});
