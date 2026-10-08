const { Sistema } = require("../logica/modelo.js");
const { CADMemoria } = require("../datos/cadMemoria.js");
const { EstadoUsuario } = require("../logica/enums/EstadoUsuario.js");

describe("obtenerUsuarios", function () {
    let sistema;
    let admin = { email: "admin@test.com", rol: "admin" };

    beforeEach(function () {
        sistema = new Sistema({ cad: new CADMemoria(), rondasHash: 4 });
    });

    it("inicialmente devuelve una lista vacía", function (done) {
        sistema.obtenerUsuarios(admin, function (res) {
            expect(res.usuarios).toEqual([]);
            done();
        });
    });

    it("devuelve la lista con email, nick y estado, sin la contraseña", function (done) {
        sistema.registrarUsuario({ email: "pepe@test.com", nick: "pepe", password: "clave1234" }, function () {
            sistema.registrarUsuario({ email: "luis@test.com", password: "clave5678" }, function () {
                sistema.obtenerUsuarios(admin, function (res) {
                    expect(res.usuarios.length).toEqual(2);
                    expect(res.usuarios[0].email).toEqual("pepe@test.com");
                    expect(res.usuarios[0].nick).toEqual("pepe");
                    expect(res.usuarios[0].rol).toEqual("usuario");
                    expect(res.usuarios[0].estado).toEqual(EstadoUsuario.ACTIVO);
                    expect(res.usuarios[0].clave).toBeUndefined();
                    expect(res.usuarios[1].nick).toEqual("luis");
                    done();
                });
            });
        });
    });
});
