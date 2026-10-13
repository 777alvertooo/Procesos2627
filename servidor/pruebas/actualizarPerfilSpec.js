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
