import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validationMiddleware";
import { limiter } from "../config/limiter";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router()

router.use(limiter)

router.post("/register", 
    body("name")
        .notEmpty().withMessage("El nombre del usuario es requerido")
        .isString().withMessage("Nombre de usuario no válido"),
    body("email")
        .notEmpty().withMessage("El correo electrónico es requerido")
        .isEmail().withMessage("Correo electrónico no válido"),
    body("password")
        .notEmpty().withMessage("La contraseña es requerida")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    handleInputErrors,
    UserController.createAccount
) // ? Create a new user account

router.post("/confirm-account",
    body("token")
        .notEmpty().withMessage("El token de confirmación es requerido")
        .isString().withMessage("Token de confirmación no válido")
        .isLength({ min: 6, max: 6 }).withMessage("Token de confirmación no válido"),
    handleInputErrors,
    UserController.confirmAccount
)

router.post("/login",
    body("email")
        .notEmpty().withMessage("El correo electrónico es requerido")
        .isEmail().withMessage("Correo electrónico no válido"),
    body("password")
        .notEmpty().withMessage("La contraseña es requerida")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    handleInputErrors,
    UserController.login
)

router.post("/forgot-password",
    body("email")
        .notEmpty().withMessage("El correo electrónico es requerido")
        .isEmail().withMessage("Correo electrónico no válido"),
    handleInputErrors,
    UserController.forgotPassword
)

router.post("/validate-token",
    body("token")
        .notEmpty().withMessage("El token de confirmación es requerido")
        .isString().withMessage("Token de confirmación no válido")
        .isLength({ min: 6, max: 6 }).withMessage("Token de confirmación no válido"),
    handleInputErrors,
    UserController.validateToken
)

router.post("/reset-password/:token", 
    param("token")
        .notEmpty().withMessage("El token de confirmación es requerido")
        .isString().withMessage("Token de confirmación no válido")
        .isLength({ min: 6, max: 6 }).withMessage("Token de confirmación no válido"),
    body("password")
        .notEmpty().withMessage("La contraseña es requerida")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    handleInputErrors,
    UserController.resetPasswordWithToken
)

router.get("/user", 
    authenticate,
    UserController.getUser
)

router.put("/user", 
    authenticate,
    body("name")
        .notEmpty().withMessage("El nombre del usuario es requerido")
        .isString().withMessage("Nombre de usuario no válido"),
    body("email")
        .notEmpty().withMessage("El correo electrónico es requerido")
        .isEmail().withMessage("Correo electrónico no válido"),
    handleInputErrors,
    UserController.updateProfile
)

router.post("/user/change-password", 
    authenticate,
    body("prevPassword")
        .notEmpty().withMessage("La contraseña actual es requerida"),
    body("password")
        .notEmpty().withMessage("La contraseña es requerida")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    handleInputErrors,
    UserController.changePassword
)

router.post("/user/check-password", 
    authenticate,
    body("password")
        .notEmpty().withMessage("La contraseña es requerida"),
    handleInputErrors,
    UserController.checkPassword
)

export default router