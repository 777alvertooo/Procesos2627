const { TipoError } = require("../logica/enums/TipoError.js");
const { RolUsuario } = require("../logica/enums/RolUsuario.js");
const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("actualizarUsuario", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };
    let pepe = { email: "pepe@test.com", rol: "usuario" };

    beforeEach(function (done) {
        sistema = crearSistemaPrueba({ emailsAdmin: ["admin@test.com"] });
        registrarYConfirmar(sistema, { email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            registrarYConfirmar(sistema, { email: "admin@test.com", nick: "admin", password: "claveAdmin1" }, function () {
                done();
            });
        });
    });

    it("permite al admin cambiar nick y email", function (done) {
        sistema.actualizarUsuario(admin, "pepe@test.com", {
            nick: "pepeEditado",
            email: "pepe2@test.com"
        }, function (res) {
            expect(res.error).toBeUndefined();
            expect(res.nick).toEqual("pepeEditado");
            expect(res.email).toEqual("pepe2@test.com");
            expect(res.rol).toEqual(RolUsuario.USUARIO);
            done();
        });
    });

    it("permite al admin cambiar la contraseña de un usuario", function (done) {
        sistema.actualizarUsuario(admin, "pepe@test.com", {
            nick: "pepe",
            email: "pepe@test.com",
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

    it("un usuario normal no puede editar a otros", function (done) {
        sistema.actualizarUsuario(pepe, "pepe@test.com", {
            nick: "hack",
            email: "pepe@test.com"
        }, function (res) {
            expect(res.tipo).toEqual(TipoError.PROHIBIDO);
            done();
        });
    });

    it("no permite editar una cuenta de administrador", function (done) {
        sistema.actualizarUsuario(admin, "admin@test.com", {
            nick: "otro",
            email: "admin@test.com"
        }, function (res) {
            expect(res.tipo).toEqual(TipoError.PROHIBIDO);
            done();
        });
    });
});
