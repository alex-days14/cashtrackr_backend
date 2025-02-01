"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEmail = void 0;
const nodemailer_1 = require("../config/nodemailer");
class AuthEmail {
    static sendConfirmationEmail = async (user) => {
        const email = await nodemailer_1.transport.sendMail({
            from: "CashTrackr <admin@cashtrackr.com>",
            to: user.email,
            subject: "CashTrackr - Confirma tu cuenta",
            html: `
                <p>Hola: ${user.name}, has creado tu cuenta en CashTrackr</p>
                <p>Confirma tu cuenta visitando el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/confirm-account'>Confirmar Cuenta</a>
                <p>Tu código de confirmación es: <b>${user.token}</b></p>
            `
        });
        console.log("Mensaje enviado: ", email.messageId);
    };
    static sendForgotPasswordEmail = async (user) => {
        const email = await nodemailer_1.transport.sendMail({
            from: "CashTrackr <admin@cashtrackr.com>",
            to: user.email,
            subject: "CashTrackr - Reestablece tu contraseña",
            html: `
                <p>Hola: ${user.name}, si has olvidado tu contraseña de CashTrackr</p>
                <p>Reestablece tu contraseña visitando el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/reset-password'>Reestablecer Contraseña</a>
                <p>Tu código de recuperación es: <b>${user.token}</b></p>
            `
        });
        console.log("Mensaje enviado: ", email.messageId);
    };
}
exports.AuthEmail = AuthEmail;
//# sourceMappingURL=AuthEmail.js.map