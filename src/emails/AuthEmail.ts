import { transport } from "../config/nodemailer"


type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: "CashTrackr <admin@cashtrackr.com>",
            to: user.email,
            subject: "CashTrackr - Confirma tu cuenta",
            html: `
                <p>Hola: ${user.name}, has creado tu cuenta en CashTrackr</p>
                <p>Confirma tu cuenta visitando el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/confirm-account'>Confirmar Cuenta</a>
                <p>Tu código de confirmación es: <b>${user.token}</b></p>
            `
        })

        console.log("Mensaje enviado: ", email.messageId)
    }

    static sendForgotPasswordEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: "CashTrackr <admin@cashtrackr.com>",
            to: user.email,
            subject: "CashTrackr - Reestablece tu contraseña",
            html: `
                <p>Hola: ${user.name}, si has olvidado tu contraseña de CashTrackr</p>
                <p>Reestablece tu contraseña visitando el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/reset-password'>Reestablecer Contraseña</a>
                <p>Tu código de recuperación es: <b>${user.token}</b></p>
            `
        })

        console.log("Mensaje enviado: ", email.messageId)
    }
}