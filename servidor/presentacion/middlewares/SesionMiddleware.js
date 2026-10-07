const crypto = require("crypto");
const session = require("express-session");

const NOMBRE_COOKIE = "sesion";

function SesionMiddleware() {
    let secreto = process.env.SESSION_SECRET;
    if (!secreto) {
        console.warn("SESSION_SECRET no definida, se usa un secreto aleatorio (las sesiones se pierden al reiniciar)");
        secreto = crypto.randomBytes(32).toString("hex");
    }

    this.manejar = session({
        name: NOMBRE_COOKIE,
        secret: secreto,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    });
}

SesionMiddleware.NOMBRE_COOKIE = NOMBRE_COOKIE;

module.exports.SesionMiddleware = SesionMiddleware;
