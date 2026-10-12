const { EstadoUsuario } = require("../logica/enums/EstadoUsuario.js");
const { OrigenUsuario } = require("../logica/enums/OrigenUsuario.js");
const { RolUsuario } = require("../logica/enums/RolUsuario.js");
const { crearSistemaPrueba } = require("./ayudas.js");

describe("autenticarGoogle", function () {
    let sistema, cad;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = crearSistemaPrueba({ emailsAdmin: ["admin@test.com"] });
        cad = sistema._cadPrueba;
    });

    it("crea un usuario activo sin confirmar email", function (done) {
        sistema.autenticarGoogle({ email: "pepe@gmail.com", nick: "Pepe" }, function (res) {
            expect(res.error).toBeUndefined();
            expect(res.email).toEqual("pepe@gmail.com");
            expect(res.origen).toEqual(OrigenUsuario.GOOGLE);
            expect(res.estado).toEqual(EstadoUsuario.ACTIVO);
            expect(cad.usuarios["pepe@gmail.com"].clave).toBeUndefined();
            done();
        });
    });

    it("asigna admin si el email está en ADMIN_EMAIL", function (done) {
        sistema.autenticarGoogle({ email: "admin@test.com", nick: "Admin" }, function (res) {
            expect(res.rol).toEqual(RolUsuario.ADMIN);
            done();
        });
    });

    it("activa una cuenta local pendiente al entrar con Google", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            expect(cad.usuarios["pepe@test.com"].estado).toEqual(EstadoUsuario.PENDIENTE);
            sistema.autenticarGoogle({ email: "pepe@test.com", nick: "Pepe" }, function (res) {
                expect(res.estado).toEqual(EstadoUsuario.ACTIVO);
                done();
            });
        });
    });

    it("reactiva una cuenta eliminada al entrar con Google", function (done) {
        sistema.autenticarGoogle({ email: "pepe@gmail.com", nick: "Pepe" }, function () {
            sistema.eliminarUsuario(admin, "pepe@gmail.com", function () {
                sistema.autenticarGoogle({ email: "pepe@gmail.com", nick: "PepeNuevo" }, function (res) {
                    expect(res.error).toBeUndefined();
                    expect(res.estado).toEqual(EstadoUsuario.ACTIVO);
                    expect(res.nick).toEqual("PepeNuevo");
                    done();
                });
            });
        });
    });
});
