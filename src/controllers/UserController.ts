import { Request, Response } from "express"
import User from "../models/User"
import { comparePassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT, verifyJWT } from "../utils/jwt"

export class UserController {

    static createAccount = async (req: Request, res: Response) => {
        const { email, password } = req.body
        try {
            const userExists = await User.findOne({ where: { email } })
            if(userExists){
                res.status(409).json({ message: "El correo electrónico ya está en uso" })
                return
            }

            const user = await User.create(req.body)
            user.password = await hashPassword(password)
            const token = generateToken()
            user.token = token
            await user.save()

            await AuthEmail.sendConfirmationEmail({ name: user.name, email: user.email, token: user.token })

            res.status(201).json({ message: "Usuario creado exitosamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body
        try {
            const userExists = await User.findOne({ where: { token } })
            if(!userExists){
                res.status(404).json({ message: "Token no válido" })
                return
            }
            if(userExists.confirmed){
                res.status(409).json({ message: "Usuario ya confirmado" })
                return
            }

            userExists.confirmed = true
            userExists.token = null
            await userExists.save()
            res.status(200).json({ message: "Usuario confirmado exitosamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body
        try {
            const userExists = await User.findOne({ where: { email } })
            if(!userExists){
                res.status(404).json({ message: "Parece que hay un error en el email o contraseña" })
                return
            }
            const passwordMatch = await comparePassword(password, userExists.password)
            if(!passwordMatch){
                res.status(401).json({ message: "Parece que hay un error en el email o contraseña" })
                return
            }
            if(!userExists.confirmed){
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" })
                return
            }

            const token = generateJWT(userExists.id)

            res.status(200).json(token)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body
        try {
            const userExists = await User.findOne({ where: { email } })
            if(!userExists){
                res.status(404).json({ message: "Parece que hay un error en el email" })
                return
            }
            if(!userExists.confirmed){
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" })
                return
            }

            const token = generateToken()
            userExists.token = token
            await userExists.save()

            await AuthEmail.sendForgotPasswordEmail({ name: userExists.name, email: userExists.email, token: userExists.token })

            res.status(200).json({ message: "Hemos enviado a tu email las instrucciones para reestablecer tu contraseña " })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body
        try {
            const tokenExists = await User.findOne({ where: { token } })
            if(!tokenExists){
                res.status(404).json({ message: "Token no válido" })
                return
            }
            if(!tokenExists.confirmed){
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" })
                return
            }

            res.status(200).json({ message: "Token válido" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body
        try {
            const user = await User.findOne({ where: { token } })
            if(!user){
                res.status(404).json({ message: "Token no válido" })
                return
            }
            if(!user.confirmed){
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" })
                return
            }

            user.password = await hashPassword(password)
            user.token = null
            await user.save()

            res.status(200).json({ message: "Contraseña reestablecida exitosamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }
    
    static getUser = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static changePassword = async (req: Request, res: Response) => {
        const { prevPassword, password } = req.body
        try {
            const user = await User.findByPk(req.user.id)
            const passwordMatch = await comparePassword(prevPassword, user.password)
            if(!passwordMatch){
                res.status(401).json({ message: "La contraseña actual es incorrecta" })
                return
            }

            user.password = await hashPassword(password)
            await user.save()

            res.status(200).json({ message: "Contraseña actualizada exitosamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static checkPassword = async (req: Request, res: Response) =>{
        const { password } = req.body
        try {
            const user = await User.findByPk(req.user.id)
            const passwordMatch = await comparePassword(password, user.password)
            if(!passwordMatch){
                res.status(401).json({ message: "La contraseña actual es incorrecta" })
                return
            }

            res.status(200).json({ message: "Contraseña correcta" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body
        try {
            const emailExists = await User.findOne({ where: { email }})
            if(emailExists && email !== req.user.email){
                res.status(409).json({ message: "El correo electrónico ya está en uso" })
                return
            }

            await User.update({ email, name }, { where: { id: req.user.id } })

            res.status(200).json({ message: "Perfil actualizado exitosamente" })
        } catch (error) {
            res.status(500).json({ message: "Hubo un error" })
        }
    }
}