const { crearSistemaPrueba } = require("./ayudas.js");

describe("numeroUsuarios", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = crearSistemaPrueba();
    });

    it("inicialmente no hay usuarios", function (done) {
        sistema.numeroUsuarios(admin, function (res) {
            expect(res.num).toEqual(0);
            done();
        });
    });

    it("cuenta los usuarios registrados", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", password: "clave1234" }, function () {
            sistema.registrarUsuario({ email: "luis@test.com", password: "clave5678" }, function () {
                sistema.numeroUsuarios(admin, function (res) {
                    expect(res.num).toEqual(2);
                    done();
                });
            });
        });
    });
});
