const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { EstadoUsuario } = require("../logica/enums/EstadoUsuario.js");

describe("obtenerUsuarios", function () {
    let sistema;

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria() });
    });

    it("inicialmente devuelve una lista vacía", function (done) {
        sistema.obtenerUsuarios(function (res) {
            expect(res.usuarios).toEqual([]);
            done();
        });
    });

    it("devuelve la lista con email, nick y estado", function (done) {
        sistema.agregarUsuario({ email: "pepe@test.com", nick: "pepe" }, function () {
            sistema.agregarUsuario({ email: "luis@test.com" }, function () {
                sistema.obtenerUsuarios(function (res) {
                    expect(res.usuarios.length).toEqual(2);
                    expect(res.usuarios[0].email).toEqual("pepe@test.com");
                    expect(res.usuarios[0].nick).toEqual("pepe");
                    expect(res.usuarios[0].estado).toEqual(EstadoUsuario.ACTIVO);
                    expect(res.usuarios[1].nick).toEqual("luis");
                    done();
                });
            });
        });
    });
});
