const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { TipoError } = require("../logica/enums/TipoError.js");

describe("registrarUsuario", function () {
    let sistema, cad;

    beforeEach(function () {
        cad = new CADMemoria();
        sistema = new Sistema({ cad: cad, rondasHash: 4 });
    });

    it("registra un usuario nuevo", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function (res) {
            expect(res.email).toEqual("pepe@test.com");
            sistema.numeroUsuarios(function (res) {
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
                sistema.numeroUsuarios(function (res) {
                    expect(res.num).toEqual(1);
                    done();
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
            sistema.numeroUsuarios(function (res) {
                expect(res.num).toEqual(0);
                done();
            });
        });
    });
});
