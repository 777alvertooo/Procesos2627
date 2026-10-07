const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { TipoError } = require("../logica/enums/TipoError.js");

describe("iniciarSesion", function () {
    let sistema;

    beforeEach(function (done) {
        sistema = new Sistema({ cad: new CADMemoria(), rondasHash: 4 });
        sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
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

    it("un usuario eliminado no puede volver a iniciar sesión", function (done) {
        sistema.eliminarUsuario("pepe@test.com", function () {
            sistema.iniciarSesion("pepe@test.com", "clave1234", function (res) {
                expect(res.tipo).toEqual(TipoError.PROHIBIDO);
                done();
            });
        });
    });
});
