function ControlWeb(rest) {
    let cw = this;
    let mensajes = new Mensajes("#msg");
    let navegacion = new Navegacion("#navUsuario");
    let formularioLogin = new FormularioLogin("#au");
    let formularioRegistro = new FormularioRegistro("#au");
    let formularioOlvido = new FormularioOlvido("#au");
    let formularioRestablecer = new FormularioRestablecer("#au");
    let panelUsuario = new PanelUsuario("#au");
    let detallePerfil = new DetallePerfil("#panelDetalle");
    let listaUsuarios = new ListaUsuarios("#panelUsuarios");
    let modal = new ModalConfirmacion("#modalConfirmar");

    this.usuario = undefined;
    this.tokenRestablecer = undefined;

    this.iniciar = function () {
        this.leerParametrosUrl();
        if (this.tokenRestablecer) {
            navegacion.mostrar(undefined);
            return this.mostrarRestablecer(this.tokenRestablecer);
        }
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

    this.leerParametrosUrl = function () {
        let params = new URLSearchParams(window.location.search);
        this.tokenRestablecer = params.get("restablecer") || undefined;
        if (params.get("confirmado") === "1") {
            mensajes.exito("Cuenta confirmada. Ya puedes iniciar sesión.");
        } else if (params.get("confirmado") === "0") {
            mensajes.error("El enlace de confirmación no es válido o ya se ha usado.");
        } else if (params.get("oauth") === "error") {
            mensajes.error("No se pudo iniciar sesión con Google.");
        } else if (params.get("oauth") === "no_configurado") {
            mensajes.aviso("El acceso con Google no está configurado en el servidor.");
        }
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    this.mostrarLogin = function () {
        this.usuario = undefined;
        this.tokenRestablecer = undefined;
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
        }, function () {
            mensajes.limpiar();
            cw.mostrarOlvido();
        });
    };

    this.mostrarRegistro = function () {
        formularioRegistro.mostrar(function (nick, email, password, confirmarPassword) {
            if (!email || password.length < 8) {
                return mensajes.aviso("Introduce un email y una contraseña de al menos 8 caracteres");
            }
            if (password !== confirmarPassword) {
                return mensajes.aviso("Las contraseñas no coinciden");
            }
            formularioRegistro.habilitar(false);
            rest.registrarUsuario(nick, email, password, confirmarPassword, function (res) {
                cw.mostrarLogin();
                mensajes.exito((res && res.mensaje) || "Te hemos enviado un email de confirmación. Revisa tu bandeja.");
            }, function (mensaje) {
                formularioRegistro.habilitar(true);
                mensajes.error(mensaje);
            });
        }, function () {
            mensajes.limpiar();
            cw.mostrarLogin();
        });
    };

    this.mostrarOlvido = function () {
        navegacion.mostrar(undefined);
        formularioOlvido.mostrar(function (email) {
            if (!email) {
                return mensajes.aviso("Introduce tu email");
            }
            formularioOlvido.habilitar(false);
            rest.solicitarRestablecerClave(email, function (res) {
                cw.mostrarLogin();
                mensajes.exito((res && res.mensaje) || "Si el email está registrado, te hemos enviado instrucciones.");
            }, function (mensaje) {
                formularioOlvido.habilitar(true);
                mensajes.error(mensaje);
            });
        }, function () {
            mensajes.limpiar();
            cw.mostrarLogin();
        });
    };

    this.mostrarRestablecer = function (token) {
        navegacion.mostrar(undefined);
        formularioRestablecer.mostrar(function (password, confirmarPassword) {
            if (!password || password.length < 8) {
                return mensajes.aviso("La contraseña debe tener al menos 8 caracteres");
            }
            if (password !== confirmarPassword) {
                return mensajes.aviso("Las contraseñas no coinciden");
            }
            formularioRestablecer.habilitar(false);
            rest.restablecerClave(token, password, confirmarPassword, function (res) {
                cw.tokenRestablecer = undefined;
                cw.mostrarLogin();
                mensajes.exito((res && res.mensaje) || "Contraseña actualizada. Ya puedes iniciar sesión.");
            }, function (mensaje) {
                formularioRestablecer.habilitar(true);
                mensajes.error(mensaje);
            });
        }, function () {
            cw.tokenRestablecer = undefined;
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
        if (!esAdmin) {
            this.mostrarDetallePerfil();
            return;
        }
        listaUsuarios.mostrar(function (email) {
            cw.comprobarActivo(email);
        });
        this.cargarUsuarios();
    };

    this.mostrarDetallePerfil = function () {
        detallePerfil.mostrar(this.usuario, function () {
            cw.mostrarEdicionPerfil();
        });
    };

    this.mostrarEdicionPerfil = function () {
        detallePerfil.mostrarEdicion(this.usuario, function (datos) {
            if (!datos.nick) {
                return mensajes.aviso("El nick no puede estar vacío");
            }
            if (!datos.email) {
                return mensajes.aviso("Introduce un email válido");
            }
            let cambiaClave = !!(datos.passwordActual || datos.passwordNueva || datos.confirmarPassword);
            if (cambiaClave) {
                if (!datos.passwordActual) {
                    return mensajes.aviso("Introduce tu contraseña actual");
                }
                if (!datos.passwordNueva || datos.passwordNueva.length < 8) {
                    return mensajes.aviso("La nueva contraseña debe tener al menos 8 caracteres");
                }
                if (datos.passwordNueva !== datos.confirmarPassword) {
                    return mensajes.aviso("Las contraseñas no coinciden");
                }
            } else {
                datos.passwordActual = undefined;
                datos.passwordNueva = undefined;
                datos.confirmarPassword = undefined;
            }
            detallePerfil.habilitar(false);
            rest.actualizarPerfil(datos, function (usuario) {
                mensajes.exito("Perfil actualizado");
                cw.mostrarPanel(usuario);
            }, function (mensaje, codigo) {
                detallePerfil.habilitar(true);
                cw.tratarError(mensaje, codigo);
            });
        }, function () {
            mensajes.limpiar();
            cw.mostrarDetallePerfil();
        });
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
            }, function (usuario) {
                cw.editarUsuarioAdmin(usuario);
            });
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.editarUsuarioAdmin = function (usuario) {
        listaUsuarios.mostrarEdicion(usuario, function (datos) {
            if (!datos.nick) {
                return mensajes.aviso("El nick no puede estar vacío");
            }
            if (!datos.email) {
                return mensajes.aviso("Introduce un email válido");
            }
            let cambiaClave = !!(datos.passwordNueva || datos.confirmarPassword);
            if (cambiaClave) {
                if (!datos.passwordNueva || datos.passwordNueva.length < 8) {
                    return mensajes.aviso("La nueva contraseña debe tener al menos 8 caracteres");
                }
                if (datos.passwordNueva !== datos.confirmarPassword) {
                    return mensajes.aviso("Las contraseñas no coinciden");
                }
            } else {
                datos.passwordNueva = undefined;
                datos.confirmarPassword = undefined;
            }
            listaUsuarios.habilitarEdicion(false);
            rest.actualizarUsuario(usuario.email, datos, function () {
                mensajes.exito("Usuario actualizado");
                cw.cargarUsuarios();
            }, function (mensaje, codigo) {
                listaUsuarios.habilitarEdicion(true);
                cw.tratarError(mensaje, codigo);
            });
        }, function () {
            mensajes.limpiar();
            cw.cargarUsuarios();
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
