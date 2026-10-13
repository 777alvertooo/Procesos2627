const { TipoError } = require("../logica/enums/TipoError.js");
const { EstadoUsuario } = require("../logica/enums/EstadoUsuario.js");
const { crearSistemaPrueba } = require("./ayudas.js");

describe("registrarUsuario", function () {
    let sistema, cad, correo;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = crearSistemaPrueba();
        cad = sistema._cadPrueba;
        correo = sistema._correoPrueba;
    });

    it("registra un usuario nuevo en estado pendiente", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function (res) {
            expect(res.email).toEqual("pepe@test.com");
            expect(res.pendiente).toBe(true);
            expect(cad.usuarios["pepe@test.com"].estado).toEqual(EstadoUsuario.PENDIENTE);
            expect(correo.enviados.length).toEqual(1);
            sistema.numeroUsuarios(admin, function (res) {
                expect(res.num).toEqual(1);
                done();
            });
        });
    });

    it("guarda la contraseña con hash y nunca en texto plano", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            let guardado = cad.usuarios["pepe@test.com"];
            expect(guardado.clave).not.toEqual("clave1234");
            expect(guardado.clave.indexOf("$2")).toEqual(0);
            done();
        });
    });

    it("rechaza un email ya existente", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.registrarUsuario({ email: "PEPE@test.com", password: "otraClave99" }, function (res) {
                expect(res.tipo).toEqual(TipoError.CONFLICTO);
                sistema.numeroUsuarios(admin, function (res) {
                    expect(res.num).toEqual(1);
                    done();
                });
            });
        });
    });

    it("permite volver a registrar un email eliminado", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            let token = cad.usuarios["pepe@test.com"].tokenConfirmacion;
            sistema.confirmarUsuario(token, function () {
                sistema.eliminarUsuario(admin, "pepe@test.com", function () {
                    sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe2", password: "nuevaClave9" }, function (res) {
                        expect(res.error).toBeUndefined();
                        expect(res.pendiente).toBe(true);
                        expect(cad.usuarios["pepe@test.com"].estado).toEqual(EstadoUsuario.PENDIENTE);
                        expect(cad.usuarios["pepe@test.com"].nick).toEqual("pepe2");
                        done();
                    });
                });
            });
        });
    });

    it("rechaza un email no válido", function (done) {
        sistema.registrarUsuario({ email: "noesemail", password: "clave1234" }, function (res) {
            expect(res.tipo).toEqual(TipoError.VALIDACION);
            done();
        });
    });

    it("rechaza una contraseña demasiado corta", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "corta" }, function (res) {
            expect(res.tipo).toEqual(TipoError.VALIDACION);
            sistema.numeroUsuarios(admin, function (res) {
                expect(res.num).toEqual(0);
                done();
            });
        });
    });

    it("rechaza si las contraseñas no coinciden", function (done) {
        sistema.registrarUsuario({
            email: "pepe@test.com",
            password: "clave1234",
            confirmarPassword: "otraClave9"
        }, function (res) {
            expect(res.tipo).toEqual(TipoError.VALIDACION);
            expect(res.error).toEqual("Las contraseñas no coinciden");
            sistema.numeroUsuarios(admin, function (res) {
                expect(res.num).toEqual(0);
                done();
            });
        });
    });
});
