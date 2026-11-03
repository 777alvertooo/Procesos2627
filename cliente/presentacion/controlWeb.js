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
    let catalogo = new CatalogoPeliculas("#au");
    let ficha = new FichaPelicula("#au");
    let formularioPelicula = new FormularioPelicula("#au");
    let listaPendientes = new ListaPendientes("#au");
    let pantallaMatch = new PantallaMatch("#au");
    let pantallaInicio = new PantallaInicio("#au");
    let modal = new ModalConfirmacion("#modalConfirmar");

    this.usuario = undefined;
    this.tokenRestablecer = undefined;
    this.pestanaCatalogo = "pelicula";
    this.codigoMatch = "";

    this.iniciar = function () {
        this.leerParametrosUrl();
        if (this.tokenRestablecer) {
            navegacion.mostrar(undefined);
            return this.mostrarRestablecer(this.tokenRestablecer);
        }
        rest.usuarioSesion(function (usuario) {
            if (usuario) {
                cw.mostrarInicio(usuario);
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
        vistaAncha(false);
        navegacion.mostrar(undefined);
        formularioLogin.mostrar(function (email, password) {
            if (!email || !password) {
                return mensajes.aviso("Introduce email y contraseña");
            }
            formularioLogin.habilitar(false);
            rest.iniciarSesion(email, password, function (usuario) {
                mensajes.limpiar();
                cw.mostrarInicio(usuario);
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
        vistaAncha(false);
        this.pintarNav("cuenta");
        let esAdmin = usuario.rol === "admin";
        panelUsuario.mostrar(usuario, function () {
            cw.eliminarUsuario(usuario.email);
        }, esAdmin, function () {
            cw.cerrarSesion();
        });
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

    this.pintarNav = function (vista) {
        navegacion.mostrar(this.usuario, {
            vista: vista,
            alInicio: function () {
                mensajes.limpiar();
                pantallaMatch.detener();
                cw.mostrarInicio();
            },
            alPeliculas: function () {
                mensajes.limpiar();
                pantallaMatch.detener();
                cw.mostrarCatalogo(undefined, "pelicula");
            },
            alSeries: function () {
                mensajes.limpiar();
                pantallaMatch.detener();
                cw.mostrarCatalogo(undefined, "serie");
            },
            alMatch: function () {
                mensajes.limpiar();
                cw.mostrarMatch();
            },
            alLista: function () {
                mensajes.limpiar();
                pantallaMatch.detener();
                cw.mostrarPendientes();
            },
            alCuenta: function () {
                mensajes.limpiar();
                pantallaMatch.detener();
                cw.mostrarPanel(cw.usuario);
            }
        });
    };

    this.mostrarCatalogo = function (usuario, pestana) {
        if (usuario) this.usuario = usuario;
        this.pestanaCatalogo = pestana === "serie" ? "serie" : "pelicula";
        vistaAncha(true);
        this.pintarNav(this.pestanaCatalogo === "serie" ? "series" : "peliculas");
        rest.obtenerPeliculas(function (datos) {
            datos.esAdmin = cw.esAdmin();
            datos.pestana = cw.pestanaCatalogo;
            catalogo.mostrar(datos, function (id) {
                cw.mostrarFicha(id, "catalogo");
            }, function (id, enLista) {
                cw.alternarPendiente(id, enLista, "catalogo");
            }, function () {
                cw.mostrarFormularioPelicula(null, catalogo.pestana());
            });
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.mostrarPendientes = function () {
        vistaAncha(true);
        this.pintarNav("lista");
        rest.obtenerPendientes(function (datos) {
            listaPendientes.mostrar(datos.pendientes || [], function (id) {
                cw.mostrarFicha(id, "lista");
            }, function (id) {
                cw.alternarPendiente(id, true, "lista");
            });
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.mostrarFicha = function (id, origen) {
        this.origenFicha = origen || "catalogo";
        vistaAncha(true);
        this.pintarNav(vistaFicha(this));
        rest.obtenerPelicula(id, function (datos) {
            if (datos.pelicula) {
                cw.pestanaCatalogo = datos.pelicula.medio === "serie" ? "serie" : "pelicula";
            }
            ficha.mostrar(datos, {
                esAdmin: cw.esAdmin(),
                enfocarOpinion: cw.origenFicha === "lista",
                alEditar: function () {
                    cw.mostrarFormularioPelicula(id);
                },
                alBorrar: function (peliculaId, titulo) {
                    cw.eliminarPelicula(peliculaId, titulo);
                },
                alVolver: function () {
                    mensajes.limpiar();
                    if (cw.origenFicha === "lista") cw.mostrarPendientes();
                    else if (cw.origenFicha === "match") cw.mostrarMatch();
                    else if (cw.origenFicha === "inicio") cw.mostrarInicio();
                    else cw.mostrarCatalogo(undefined, cw.pestanaCatalogo);
                },
                alAlternarLista: function (peliculaId, enLista) {
                    cw.alternarPendiente(peliculaId, enLista, "ficha");
                },
                alValorar: function (puntuacion, texto) {
                    if (puntuacion < 1 || puntuacion > 5) return mensajes.aviso("Elige una puntuación del 1 al 5");
                    if (!texto || !String(texto).trim()) return mensajes.aviso("Escribe un comentario");
                    ficha.habilitarValoracion(false);
                    rest.valorarPelicula(id, puntuacion, texto, function (respuesta) {
                        let textoExito = "Puntuación publicada.";
                        if (respuesta && respuesta.quitadaDePendientes) textoExito = textoExito + " La hemos quitado de tu lista.";
                        mensajes.exito(textoExito);
                        cw.mostrarFicha(id, cw.origenFicha);
                    }, function (mensaje, codigo) {
                        ficha.habilitarValoracion(true);
                        cw.tratarError(mensaje, codigo);
                    });
                },
                alReaccionar: function (comentarioId, tipo) {
                    rest.reaccionarComentario(comentarioId, tipo, function () {
                        cw.mostrarFicha(id, cw.origenFicha);
                    }, function (mensaje, codigo) {
                        cw.tratarError(mensaje, codigo);
                    });
                },
                alResponder: function (valoracionId, texto) {
                    if (!texto || !String(texto).trim()) return mensajes.aviso("Escribe una respuesta");
                    rest.responderComentario(valoracionId, texto, function () {
                        mensajes.exito("Respuesta publicada");
                        cw.mostrarFicha(id, cw.origenFicha);
                    }, function (mensaje, codigo) {
                        cw.tratarError(mensaje, codigo);
                    });
                }
            });
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
            if (codigo !== 401) cw.mostrarCatalogo(undefined, catalogo.pestana());
        });
    };

    this.esAdmin = function () {
        return !!(this.usuario && this.usuario.rol === "admin");
    };

    this.mostrarFormularioPelicula = function (id, medio) {
        if (!this.esAdmin()) return this.mostrarCatalogo(undefined, this.pestanaCatalogo);
        vistaAncha(true);
        this.pintarNav(this.pestanaCatalogo === "serie" ? "series" : "peliculas");
        let pintar = function (pelicula) {
            formularioPelicula.mostrar(pelicula, function (datos) {
                formularioPelicula.habilitar(false);
                let hecho = function (respuesta) {
                    let esSerie = datos.medio === "serie";
                    let textoExito = id
                        ? (esSerie ? "Serie actualizada" : "Película actualizada")
                        : (esSerie ? "Serie creada" : "Película creada");
                    mensajes.exito(textoExito);
                    cw.mostrarFicha((respuesta && respuesta.id) || id, "catalogo");
                };
                let fallo = function (mensaje, codigo) {
                    formularioPelicula.habilitar(true);
                    cw.tratarError(mensaje, codigo);
                };
                if (id) rest.actualizarPelicula(id, datos, hecho, fallo);
                else rest.crearPelicula(datos, hecho, fallo);
            }, function () {
                mensajes.limpiar();
                if (id) cw.mostrarFicha(id, "catalogo");
                else cw.mostrarCatalogo(undefined, medio === "serie" ? "serie" : "pelicula");
            });
        };
        if (!id) return pintar(medio === "serie" ? { medio: "serie", tipo: "plataforma" } : null);
        rest.obtenerPelicula(id, function (datos) {
            pintar(datos.pelicula);
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
            cw.mostrarCatalogo(undefined, cw.pestanaCatalogo);
        });
    };

    this.mostrarInicio = function (usuario) {
        if (usuario) this.usuario = usuario;
        vistaAncha(true);
        this.pintarNav("inicio");
        rest.obtenerTopSemanal(function (datos) {
            pantallaInicio.mostrar(datos, function (id) {
                cw.mostrarFicha(id, "inicio");
            });
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.eliminarPelicula = function (id, titulo) {
        modal.preguntar("¿Seguro que quieres borrar " + titulo + "?", function () {
            rest.eliminarPelicula(id, function () {
                mensajes.exito("Película borrada");
                cw.mostrarCatalogo(undefined, cw.pestanaCatalogo);
            }, function (mensaje, codigo) {
                cw.tratarError(mensaje, codigo);
            });
        });
    };

    this.alternarPendiente = function (id, enLista, origen) {
        let accion = enLista ? rest.quitarPendiente.bind(rest) : rest.anadirPendiente.bind(rest);
        accion(id, function () {
            mensajes.exito(enLista ? "Quitada de tu lista" : "Añadida a pendientes");
            if (origen === "catalogo") catalogo.marcar(id, !enLista);
            else if (origen === "ficha") cw.mostrarFicha(id, cw.origenFicha);
            else cw.mostrarPendientes();
        }, function (mensaje, codigo) {
            cw.tratarError(mensaje, codigo);
        });
    };

    this.mostrarMatch = function (silencioso) {
        if (!silencioso) {
            vistaAncha(true);
            this.pintarNav("match");
        }
        let acciones = accionesMatch();
        if (!this.codigoMatch) return pantallaMatch.mostrar(null, acciones);
        rest.obtenerSesionMatch(this.codigoMatch, function (vista) {
            if (vista.estado === "cerrada") {
                cw.codigoMatch = "";
                return pantallaMatch.mostrar(null, acciones);
            }
            pantallaMatch.mostrar(vista, acciones);
        }, function (mensaje, codigo) {
            if (codigo === 404) {
                cw.codigoMatch = "";
                pantallaMatch.mostrar(null, acciones);
                return;
            }
            cw.tratarError(mensaje, codigo);
        });
    };

    function accionesMatch() {
        return {
            alCrear: function () {
                pantallaMatch.mostrar({ local: "crear" }, accionesMatch());
            },
            alUnirse: function () {
                pantallaMatch.mostrar({ local: "unirse" }, accionesMatch());
            },
            alMenu: function () {
                pantallaMatch.mostrar(null, accionesMatch());
            },
            alConfirmarCrear: function (datos) {
                rest.crearSesionMatch(datos, function (vista) {
                    cw.codigoMatch = vista.codigo;
                    pantallaMatch.mostrar(vista, accionesMatch());
                }, function (mensaje, codigo) {
                    cw.tratarError(mensaje, codigo);
                });
            },
            alConfirmarUnirse: function (codigo) {
                rest.unirseSesionMatch(codigo, function (vista) {
                    cw.codigoMatch = vista.codigo;
                    pantallaMatch.mostrar(vista, accionesMatch());
                }, function (mensaje, codigo) {
                    cw.tratarError(mensaje, codigo);
                });
            },
            alActualizar: function () {
                if (!cw.codigoMatch) return;
                cw.mostrarMatch(true);
            },
            alElegir: function (peliculaId) {
                rest.elegirMatch(cw.codigoMatch, peliculaId, function (vista) {
                    pantallaMatch.mostrar(vista, accionesMatch());
                }, function (mensaje, codigo) {
                    cw.tratarError(mensaje, codigo);
                });
            },
            alReiniciar: function (repetir) {
                rest.reiniciarSesionMatch(cw.codigoMatch, repetir, function (vista) {
                    pantallaMatch.mostrar(vista, accionesMatch());
                }, function (mensaje, codigo) {
                    cw.tratarError(mensaje, codigo);
                });
            },
            alCerrar: function () {
                rest.cerrarSesionMatch(cw.codigoMatch, function () {
                    cw.codigoMatch = "";
                    pantallaMatch.mostrar(null, accionesMatch());
                }, function (mensaje, codigo) {
                    cw.tratarError(mensaje, codigo);
                });
            },
            alFicha: function (id) {
                pantallaMatch.detener();
                cw.mostrarFicha(id, "match");
            }
        };
    }

    this.cerrarSesion = function () {
        pantallaMatch.detener();
        this.codigoMatch = "";
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

function vistaFicha(cw) {
    if (cw.origenFicha === "lista") return "lista";
    if (cw.origenFicha === "match") return "match";
    if (cw.origenFicha === "inicio") return "inicio";
    return cw.pestanaCatalogo === "serie" ? "series" : "peliculas";
}

function vistaAncha(activa) {
    $(".contenedor-app").toggleClass("contenedor-ancho", !!activa);
}
