function AccesoRapido() {
    this.cadena = function () {
        let cadena = '<div class="acceso-rapido">';
        cadena = cadena + '<div class="acceso-rapido-linea"><span>Acceso Rapido</span></div>';
        cadena = cadena + '<div class="acceso-rapido-iconos">';
        cadena = cadena + '<a href="/auth/google" class="btn-acceso btn-google" title="Continuar con Google" aria-label="Google">';
        cadena = cadena + '<svg viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.7S8.9 6 12 6c1.8 0 3 .7 3.7 1.4l2.4-2.3C16.6 3.7 14.5 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c5.5 0 9.1-3.8 9.1-9.2 0-.6 0-1.1-.1-1.6H12z"/><path fill="#34A853" d="M3.9 7.4l3 2.2C7.8 7.4 9.7 6 12 6c1.8 0 3 .7 3.7 1.4l2.4-2.3C16.6 3.7 14.5 2.7 12 2.7 8.3 2.7 5.1 4.6 3.9 7.4z"/><path fill="#4285F4" d="M12 21.3c2.4 0 4.5-.8 6-2.2l-2.8-2.1c-.8.5-1.8.9-3.2.9-3.6 0-4.9-2.4-5.1-3.6H3.8v2.2C5 19.4 8.2 21.3 12 21.3z"/><path fill="#FBBC05" d="M6.9 14.3c-.2-.6-.4-1.2-.4-1.9s.1-1.3.3-1.9V8.3H3.8A9.3 9.3 0 0 0 2.7 12c0 1.5.4 2.9 1.1 4.1l3.1-1.8z"/></svg>';
        cadena = cadena + "</a>";
        cadena = cadena + "</div></div>";
        return cadena;
    };
}
