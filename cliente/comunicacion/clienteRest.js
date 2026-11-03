function ClienteRest() {
    this.peticion = function (tipo, url, datos, exito, fallo) {
        $.ajax({
            type: tipo,
            url: url,
            data: datos ? JSON.stringify(datos) : undefined,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                if (exito) exito(data);
            },
            error: function (xhr) {
                let mensaje = xhr.responseJSON && xhr.responseJSON.error
                    ? xhr.responseJSON.error
                    : "No se pudo conectar con el servidor";
                console.log("Error " + xhr.status + " en " + url + ": " + mensaje);
                if (fallo) fallo(mensaje, xhr.status);
            }
        });
    };

    this.registrarUsuario = function (nick, email, password, confirmarPassword, exito, fallo) {
        this.peticion("POST", "/registrarUsuario", {
            nick: nick,
            email: email,
            password: password,
            confirmarPassword: confirmarPassword
        }, exito, fallo);
    };

    this.iniciarSesion = function (email, password, exito, fallo) {
        this.peticion("POST", "/iniciarSesion", { email: email, password: password }, exito, fallo);
    };

    this.solicitarRestablecerClave = function (email, exito, fallo) {
        this.peticion("POST", "/solicitarRestablecerClave", { email: email }, exito, fallo);
    };

    this.restablecerClave = function (token, password, confirmarPassword, exito, fallo) {
        this.peticion("POST", "/restablecerClave", {
            token: token,
            password: password,
            confirmarPassword: confirmarPassword
        }, exito, fallo);
    };

    this.usuarioSesion = function (exito, fallo) {
        this.peticion("GET", "/usuarioSesion", undefined, function (data) {
            exito(data.usuario);
        }, fallo);
    };

    this.cerrarSesion = function (exito, fallo) {
        this.peticion("POST", "/cerrarSesion", undefined, exito, fallo);
    };

    this.obtenerUsuarios = function (exito, fallo) {
        this.peticion("GET", "/obtenerUsuarios", undefined, function (data) {
            exito(data.usuarios);
        }, fallo);
    };

    this.numeroUsuarios = function (exito, fallo) {
        this.peticion("GET", "/numeroUsuarios", undefined, function (data) {
            exito(data.num);
        }, fallo);
    };

    this.usuarioActivo = function (email, exito, fallo) {
        this.peticion("GET", "/usuarioActivo/" + encodeURIComponent(email), undefined, exito, fallo);
    };

    this.eliminarUsuario = function (email, exito, fallo) {
        this.peticion("DELETE", "/eliminarUsuario/" + encodeURIComponent(email), undefined, exito, fallo);
    };

    this.actualizarPerfil = function (datos, exito, fallo) {
        this.peticion("PUT", "/actualizarPerfil", datos, exito, fallo);
    };

    this.actualizarUsuario = function (email, datos, exito, fallo) {
        this.peticion("PUT", "/actualizarUsuario/" + encodeURIComponent(email), datos, exito, fallo);
    };

    this.obtenerPeliculas = function (exito, fallo) {
        this.peticion("GET", "/obtenerPeliculas", undefined, exito, fallo);
    };

    this.obtenerTopSemanal = function (exito, fallo) {
        this.peticion("GET", "/obtenerTopSemanal", undefined, exito, fallo);
    };

    this.obtenerPelicula = function (id, exito, fallo) {
        this.peticion("GET", "/obtenerPelicula/" + encodeURIComponent(id), undefined, exito, fallo);
    };

    this.obtenerPendientes = function (exito, fallo) {
        this.peticion("GET", "/obtenerPendientes", undefined, exito, fallo);
    };

    this.anadirPendiente = function (id, exito, fallo) {
        this.peticion("POST", "/anadirPendiente", { peliculaId: id }, exito, fallo);
    };

    this.quitarPendiente = function (id, exito, fallo) {
        this.peticion("DELETE", "/quitarPendiente/" + encodeURIComponent(id), undefined, exito, fallo);
    };

    this.valorarPelicula = function (id, puntuacion, texto, exito, fallo) {
        this.peticion("POST", "/valorarPelicula", { peliculaId: id, puntuacion: puntuacion, texto: texto }, exito, fallo);
    };

    this.responderComentario = function (valoracionId, texto, exito, fallo) {
        this.peticion("POST", "/responderComentario", { valoracionId: valoracionId, texto: texto }, exito, fallo);
    };

    this.reaccionarComentario = function (comentarioId, tipo, exito, fallo) {
        this.peticion("POST", "/reaccionarComentario", { comentarioId: comentarioId, tipo: tipo }, exito, fallo);
    };

    this.crearPelicula = function (datos, exito, fallo) {
        this.peticion("POST", "/crearPelicula", datos, exito, fallo);
    };

    this.actualizarPelicula = function (id, datos, exito, fallo) {
        this.peticion("PUT", "/actualizarPelicula/" + encodeURIComponent(id), datos, exito, fallo);
    };

    this.eliminarPelicula = function (id, exito, fallo) {
        this.peticion("DELETE", "/eliminarPelicula/" + encodeURIComponent(id), undefined, exito, fallo);
    };

    this.crearSesionMatch = function (datos, exito, fallo) {
        this.peticion("POST", "/crearSesionMatch", datos, exito, fallo);
    };

    this.unirseSesionMatch = function (codigo, exito, fallo) {
        this.peticion("POST", "/unirseSesionMatch", { codigo: codigo }, exito, fallo);
    };

    this.obtenerSesionMatch = function (codigo, exito, fallo) {
        this.peticion("GET", "/obtenerSesionMatch/" + encodeURIComponent(codigo), undefined, exito, fallo);
    };

    this.elegirMatch = function (codigo, peliculaId, exito, fallo) {
        this.peticion("POST", "/elegirMatch", { codigo: codigo, peliculaId: peliculaId }, exito, fallo);
    };

    this.reiniciarSesionMatch = function (codigo, repetir, exito, fallo) {
        this.peticion("POST", "/reiniciarSesionMatch", { codigo: codigo, repetir: repetir }, exito, fallo);
    };

    this.cerrarSesionMatch = function (codigo, exito, fallo) {
        this.peticion("POST", "/cerrarSesionMatch", { codigo: codigo }, exito, fallo);
    };
}
