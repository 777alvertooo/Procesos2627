const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ValidadorEmail = {
    normalizar: function (email) {
        return typeof email === "string" ? email.trim().toLowerCase() : "";
    },
    esValido: function (email) {
        return PATRON_EMAIL.test(email);
    }
};

module.exports.ValidadorEmail = ValidadorEmail;
