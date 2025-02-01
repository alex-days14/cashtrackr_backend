"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAccess = exports.validateBudgetBody = exports.validateBudgetExists = exports.validateBudgetId = void 0;
const express_validator_1 = require("express-validator");
const Budget_1 = __importDefault(require("../models/Budget"));
const validateBudgetId = async (req, res, next) => {
    await (0, express_validator_1.param)("budgetId")
        .isInt().withMessage("ID no válido")
        .custom(value => value > 0).withMessage("ID no válido")
        .run(req);
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateBudgetId = validateBudgetId;
const validateBudgetExists = async (req, res, next) => {
    const { budgetId } = req.params;
    try {
        const budget = await Budget_1.default.findByPk(budgetId);
        if (!budget) {
            res.status(404).json({ message: "Presupuesto no encontrado" });
            return;
        }
        req.budget = budget;
        next();
    }
    catch (error) {
        /* console.log(error) */
        res.status(500).json({ message: "Hubo un error" });
    }
};
exports.validateBudgetExists = validateBudgetExists;
const validateBudgetBody = async (req, res, next) => {
    await (0, express_validator_1.body)("name")
        .notEmpty().withMessage("El nombre es requerido")
        .isString().withMessage("El nombre debe ser un texto")
        .run(req);
    await (0, express_validator_1.body)("amount")
        .notEmpty().withMessage("La cantidad del presupuesto es requerida")
        .isNumeric().withMessage("La cantidad del presupuesto no es válida")
        .custom(value => value > 0).withMessage("La cantidad del presupuesto debe ser mayor a 0")
        .run(req);
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateBudgetBody = validateBudgetBody;
const hasAccess = (req, res, next) => {
    // ? Solo permitir ver presupuestos del usuario
    if (req.budget.userId !== req.user.id) {
        res.status(401).json({ message: "No cuentas con los permisos para relizar esta acción" });
        return;
    }
    next();
};
exports.hasAccess = hasAccess;
//# sourceMappingURL=budgetMiddleware.js.map