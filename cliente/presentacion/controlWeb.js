function ControlWeb(rest) {
    let cw = this;
    let mensajes = new Mensajes("#msg");
    let navegacion = new Navegacion("#navUsuario");
    let formularioLogin = new FormularioLogin("#au");
    let formularioRegistro = new FormularioRegistro("#au");
    let panelUsuario = new PanelUsuario("#au");
    let listaUsuarios = new ListaUsuarios("#panelUsuarios");
    let modal = new ModalConfirmacion("#modalConfirmar");

    this.usuario = undefined;

    this.iniciar = function () {
        rest.usuarioSesion(function (usuario) {
            if (usuario) {
                cw.mostrarPanel(usuario);
            } else {
                cw.mostrarLogin();
            }
        }, function (mensaje) {
            mensajes.error(mensaje);
            cw.mostrarLogin();
        });
    };

    this.mostrarLogin = function () {
        this.usuario = undefined;
        navegacion.mostrar(undefined);
        formularioLogin.mostrar(function (email, password) {
            if (!email || !password) {
                return mensajes.aviso("Introduce email y contraseña");
            }
            formularioLogin.habilitar(false);
            rest.iniciarSesion(email, password, function (usuario) {
                mensajes.limpiar();
                cw.mostrarPanel(usuario);
            }, function (mensaje) {
                formularioLogin.habilitar(true);
                mensajes.error(mensaje);
            });
        }, function () {
            mensajes.limpiar();
            cw.mostrarRegistro();
        });
    };

    this.mostrarRegistro = function () {
        formularioRegistro.mostrar(function (nick, email, password) {
            if (!email || password.length < 8) {
                return mensajes.aviso("Introduce un email y una contraseña de al menos 8 caracteres");
            }
            formularioRegistro.habilitar(false);
            rest.registrarUsuario(nick, email, password, function () {
                cw.mostrarLogin();
                mensajes.exito("Cuenta creada. Ya puedes iniciar sesión.");
            }, function (mensaje) {
                formularioRegistro.habilitar(true);
                mensajes.error(mensaje);
            });
        }, function () {
            mensajes.limpiar();
            cw.mostrarLogin();
        });
    };

    this.mostrarPanel = function (usuario) {
        this.usuario = usuario;
        navegacion.mostrar(usuario, function () {
            cw.cerrarSesion();
        });
        let esAdmin = usuario.rol === "admin";
        panelUsuario.mostrar(usuario, function () {
            cw.eliminarUsuario(usuario.email);
        }, esAdmin);
        if (!esAdmin) return;
        listaUsuarios.mostrar(function (email) {
            cw.comprobarActivo(email);
        });
        this.cargarUsuarios();
    };

    this.cargarUsuarios = function () {
        rest.numeroUsuarios(function (num) {
            listaUsuarios.mostrarNumero(num);
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
        rest.obtenerUsuarios(function (usuarios) {
            listaUsuarios.mostrarUsuarios(usuarios, function (email) {
                cw.comprobarActivo(email);
            }, function (email) {
                cw.eliminarUsuario(email);
            });
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.comprobarActivo = function (email) {
        if (!email) return mensajes.aviso("Introduce un email");
        rest.usuarioActivo(email, function (res) {
            if (res.activo) {
                mensajes.exito("El usuario " + res.email + " está activo");
            } else {
                mensajes.aviso("El usuario " + res.email + " no está activo");
            }
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.eliminarUsuario = function (email) {
        let esPropia = email === this.usuario.email;
        let pregunta = esPropia
            ? "¿Seguro que quieres eliminar tu cuenta? No podrás volver a iniciar sesión."
            : "¿Seguro que quieres eliminar a " + email + "?";
        modal.preguntar(pregunta, function () {
            rest.eliminarUsuario(email, function () {
                if (esPropia) {
                    cw.mostrarLogin();
                    return mensajes.info("Tu cuenta ha sido eliminada");
                }
                mensajes.exito("Usuario " + email + " eliminado");
                cw.cargarUsuarios();
            }, function (mensaje, codigo) {
                cw.tratarError(mensaje, codigo);
            });
        });
    };

    this.cerrarSesion = function () {
        rest.cerrarSesion(function () {
            cw.mostrarLogin();
            mensajes.info("Has cerrado la sesión");
        }, function (mensaje) {
            mensajes.error(mensaje);
        });
    };

    this.tratarError = function (mensaje, codigo) {
        if (codigo === 401) {
            this.mostrarLogin();
        }
        mensajes.error(mensaje);
    };
}
