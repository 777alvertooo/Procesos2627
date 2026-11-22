function FondoCine() {
    const carteles = [
        "8Gxv8gSFCU0XGDykEGv7zR1n2ua", "1pdfLvkbY9ohJlCjQH2CZjjYVvJ", "5weKu49pzJCt06OPpjvT80efnQj",
        "8Vt6mWEReuy4Of61Lnj5Xj704m8", "kCGlIMHnOm8JPXq3rXM6c5wMxcT", "7IiTTgloJzvGI1TAYymCfbfl3vT",
        "gEU2QniE6E77NI6lCU6MxlNBvIx", "7fn624j5lj3xTme2SgiLCeuedmO", "hYqOjJ7Gh1fbqXrxlIao1g8ZehF",
        "iuFNMS8U5cb6xfzi51Dbkovj7vM", "udDclJoHjfjb8Ekgsd4FDteOkCU", "62HCnUTziyWcpDaBO2i1DX17ljH",
        "t6HIqrRAclMCA60NsSmeqe9RmNV", "vZloFAK7NmvMGKE7VkF5UHaz0I", "d5NXSklXo0qyIYkgV94XAgMIckC",
        "vpnVM9B6NMmQpWeZvzLvDESb2QY", "8cdWjvZQUExUUTzyp4t6EDMubfO", "qJ2tW6WMUDux911r6m7haRef0WH",
        "oYuLEt3zVCKq57qu2F8dT7NIa6f", "c5Tqxeo1UpBvnAc3csUm7j3hlQl", "lqoMzCcZYEFK729d6qzt349fB4o",
        "iADOJ8Zymht2JPMoy3R7xceZprc", "8tZYtuWezp8JbcsvHYO0O46tFbo", "gajva2L0rPYkEWjzgFlBXCAVBE5",
        "9xjZS2rlVxm8SFx8kPC3aIGCOYQ", "ty8TGRuvJLPUmAR1H1nRIsgwvim", "6oom5QYQ2yQTMJIbnvbkBL9cHo6",
        "6FfCtAuVAW8XJjZ7eWeLibRLWTw"
    ];

    this.cadena = function () {
        let cadena = '<div class="fondo-cine" aria-hidden="true"><div class="fondo-cine-parallax"><div class="fondo-cine-mosaico">';
        carteles.forEach(function (id) {
            cadena = cadena + '<img src="https://image.tmdb.org/t/p/w342/' + id + '.jpg" alt="" decoding="async">';
        });
        cadena = cadena + '</div></div><div class="fondo-cine-vineta"></div></div>';
        return cadena;
    };

    // Parallax del fondo y foco dorado de la tarjeta, ambos con el ratón.
    this.activar = function () {
        $(".fondo-cine img").on("error", function () {
            $(this).addClass("fallida");
        });

        $(document).off("mousemove.fondoCine");
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        let objetivoX = 0, objetivoY = 0, actualX = 0, actualY = 0;
        let ultimoRaton = null;
        let animando = false;

        function cuadro() {
            const fondo = document.querySelector(".fondo-cine");
            if (!fondo) {
                $(document).off("mousemove.fondoCine");
                animando = false;
                return;
            }
            actualX += (objetivoX - actualX) * 0.08;
            actualY += (objetivoY - actualY) * 0.08;
            fondo.style.setProperty("--mouse-x", actualX.toFixed(4));
            fondo.style.setProperty("--mouse-y", actualY.toFixed(4));

            const tarjeta = document.querySelector(".tarjeta-login");
            if (tarjeta && ultimoRaton) {
                const caja = tarjeta.getBoundingClientRect();
                tarjeta.style.setProperty("--spot-x", (ultimoRaton.x - caja.left).toFixed(1) + "px");
                tarjeta.style.setProperty("--spot-y", (ultimoRaton.y - caja.top).toFixed(1) + "px");
            }

            if (Math.abs(objetivoX - actualX) > 0.001 || Math.abs(objetivoY - actualY) > 0.001) {
                requestAnimationFrame(cuadro);
            } else {
                animando = false;
            }
        }

        $(document).on("mousemove.fondoCine", function (e) {
            objetivoX = (e.clientX / window.innerWidth) * 2 - 1;
            objetivoY = (e.clientY / window.innerHeight) * 2 - 1;
            ultimoRaton = { x: e.clientX, y: e.clientY };
            if (!animando) {
                animando = true;
                requestAnimationFrame(cuadro);
            }
        });
    };
}
