"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const express_validator_1 = require("express-validator");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const limiter_1 = require("../config/limiter");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(limiter_1.limiter);
router.post("/register", (0, express_validator_1.body)("name")
    .notEmpty().withMessage("El nombre del usuario es requerido")
    .isString().withMessage("Nombre de usuario no válido"), (0, express_validator_1.body)("email")
    .notEmpty().withMessage("El correo electrónico es requerido")
    .isEmail().withMessage("Correo electrónico no válido"), (0, express_validator_1.body)("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.createAccount); // ? Create a new user account
router.post("/confirm-account", (0, express_validator_1.body)("token")
    .notEmpty().withMessage("El token de confirmación es requerido")
    .isString().withMessage("Token de confirmación no válido")
    .isLength({ min: 6, max: 6 }).withMessage("Token de confirmación no válido"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.confirmAccount);
router.post("/login", (0, express_validator_1.body)("email")
    .notEmpty().withMessage("El correo electrónico es requerido")
    .isEmail().withMessage("Correo electrónico no válido"), (0, express_validator_1.body)("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.login);
router.post("/forgot-password", (0, express_validator_1.body)("email")
    .notEmpty().withMessage("El correo electrónico es requerido")
    .isEmail().withMessage("Correo electrónico no válido"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.forgotPassword);
router.post("/validate-token", (0, express_validator_1.body)("token")
    .notEmpty().withMessage("El token de confirmación es requerido")
    .isString().withMessage("Token de confirmación no válido")
    .isLength({ min: 6, max: 6 }).withMessage("Token de confirmación no válido"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.validateToken);
router.post("/reset-password/:token", (0, express_validator_1.param)("token")
    .notEmpty().withMessage("El token de confirmación es requerido")
    .isString().withMessage("Token de confirmación no válido")
    .isLength({ min: 6, max: 6 }).withMessage("Token de confirmación no válido"), (0, express_validator_1.body)("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.resetPasswordWithToken);
router.get("/user", authMiddleware_1.authenticate, UserController_1.UserController.getUser);
router.put("/user", authMiddleware_1.authenticate, (0, express_validator_1.body)("name")
    .notEmpty().withMessage("El nombre del usuario es requerido")
    .isString().withMessage("Nombre de usuario no válido"), (0, express_validator_1.body)("email")
    .notEmpty().withMessage("El correo electrónico es requerido")
    .isEmail().withMessage("Correo electrónico no válido"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.updateProfile);
router.post("/user/change-password", authMiddleware_1.authenticate, (0, express_validator_1.body)("prevPassword")
    .notEmpty().withMessage("La contraseña actual es requerida"), (0, express_validator_1.body)("password")
    .notEmpty().withMessage("La contraseña es requerida")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 6 caracteres"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.changePassword);
router.post("/user/check-password", authMiddleware_1.authenticate, (0, express_validator_1.body)("password")
    .notEmpty().withMessage("La contraseña es requerida"), validationMiddleware_1.handleInputErrors, UserController_1.UserController.checkPassword);
exports.default = router;
//# sourceMappingURL=authRouter.js.map