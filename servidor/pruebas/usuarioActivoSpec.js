const { crearSistemaPrueba, registrarYConfirmar } = require("./ayudas.js");

describe("usuarioActivo", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = crearSistemaPrueba();
    });

    it("devuelve cierto si el usuario existe y está activo", function (done) {
        registrarYConfirmar(sistema, { email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.usuarioActivo(admin, "pepe@test.com", function (res) {
                expect(res.activo).toBe(true);
                done();
            });
        });
    });

    it("devuelve falso si el usuario está pendiente de confirmación", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.usuarioActivo(admin, "pepe@test.com", function (res) {
                expect(res.activo).toBe(false);
                done();
            });
        });
    });

    it("devuelve falso si el usuario no existe", function (done) {
        sistema.usuarioActivo(admin, "nadie@test.com", function (res) {
            expect(res.activo).toBe(false);
            done();
        });
    });
});
