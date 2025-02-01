"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const token_1 = require("../utils/token");
const AuthEmail_1 = require("../emails/AuthEmail");
const jwt_1 = require("../utils/jwt");
class UserController {
    static createAccount = async (req, res) => {
        const { email, password } = req.body;
        try {
            const userExists = await User_1.default.findOne({ where: { email } });
            if (userExists) {
                res.status(409).json({ message: "El correo electrónico ya está en uso" });
                return;
            }
            const user = await User_1.default.create(req.body);
            user.password = await (0, auth_1.hashPassword)(password);
            const token = (0, token_1.generateToken)();
            user.token = token;
            await user.save();
            await AuthEmail_1.AuthEmail.sendConfirmationEmail({ name: user.name, email: user.email, token: user.token });
            res.status(201).json({ message: "Usuario creado exitosamente" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static confirmAccount = async (req, res) => {
        const { token } = req.body;
        try {
            const userExists = await User_1.default.findOne({ where: { token } });
            if (!userExists) {
                res.status(404).json({ message: "Token no válido" });
                return;
            }
            if (userExists.confirmed) {
                res.status(409).json({ message: "Usuario ya confirmado" });
                return;
            }
            userExists.confirmed = true;
            userExists.token = null;
            await userExists.save();
            res.status(200).json({ message: "Usuario confirmado exitosamente" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static login = async (req, res) => {
        const { email, password } = req.body;
        try {
            const userExists = await User_1.default.findOne({ where: { email } });
            if (!userExists) {
                res.status(404).json({ message: "Parece que hay un error en el email o contraseña" });
                return;
            }
            const passwordMatch = await (0, auth_1.comparePassword)(password, userExists.password);
            if (!passwordMatch) {
                res.status(401).json({ message: "Parece que hay un error en el email o contraseña" });
                return;
            }
            if (!userExists.confirmed) {
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" });
                return;
            }
            const token = (0, jwt_1.generateJWT)(userExists.id);
            res.status(200).json(token);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static forgotPassword = async (req, res) => {
        const { email } = req.body;
        try {
            const userExists = await User_1.default.findOne({ where: { email } });
            if (!userExists) {
                res.status(404).json({ message: "Parece que hay un error en el email" });
                return;
            }
            if (!userExists.confirmed) {
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" });
                return;
            }
            const token = (0, token_1.generateToken)();
            userExists.token = token;
            await userExists.save();
            await AuthEmail_1.AuthEmail.sendForgotPasswordEmail({ name: userExists.name, email: userExists.email, token: userExists.token });
            res.status(200).json({ message: "Hemos enviado a tu email las instrucciones para reestablecer tu contraseña " });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static validateToken = async (req, res) => {
        const { token } = req.body;
        try {
            const tokenExists = await User_1.default.findOne({ where: { token } });
            if (!tokenExists) {
                res.status(404).json({ message: "Token no válido" });
                return;
            }
            if (!tokenExists.confirmed) {
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" });
                return;
            }
            res.status(200).json({ message: "Token válido" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static resetPasswordWithToken = async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;
        try {
            const user = await User_1.default.findOne({ where: { token } });
            if (!user) {
                res.status(404).json({ message: "Token no válido" });
                return;
            }
            if (!user.confirmed) {
                res.status(403).json({ message: "Aún no has confirmado tu cuenta, revisa tu email" });
                return;
            }
            user.password = await (0, auth_1.hashPassword)(password);
            user.token = null;
            await user.save();
            res.status(200).json({ message: "Contraseña reestablecida exitosamente" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static getUser = async (req, res) => {
        res.json(req.user);
    };
    static changePassword = async (req, res) => {
        const { prevPassword, password } = req.body;
        try {
            const user = await User_1.default.findByPk(req.user.id);
            const passwordMatch = await (0, auth_1.comparePassword)(prevPassword, user.password);
            if (!passwordMatch) {
                res.status(401).json({ message: "La contraseña actual es incorrecta" });
                return;
            }
            user.password = await (0, auth_1.hashPassword)(password);
            await user.save();
            res.status(200).json({ message: "Contraseña actualizada exitosamente" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static checkPassword = async (req, res) => {
        const { password } = req.body;
        try {
            const user = await User_1.default.findByPk(req.user.id);
            const passwordMatch = await (0, auth_1.comparePassword)(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ message: "La contraseña actual es incorrecta" });
                return;
            }
            res.status(200).json({ message: "Contraseña correcta" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static updateProfile = async (req, res) => {
        const { name, email } = req.body;
        try {
            const emailExists = await User_1.default.findOne({ where: { email } });
            if (emailExists && email !== req.user.email) {
                res.status(409).json({ message: "El correo electrónico ya está en uso" });
                return;
            }
            await User_1.default.update({ email, name }, { where: { id: req.user.id } });
            res.status(200).json({ message: "Perfil actualizado exitosamente" });
        }
        catch (error) {
            res.status(500).json({ message: "Hubo un error" });
        }
    };
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map