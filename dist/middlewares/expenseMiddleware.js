"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExpenseExists = exports.validateExpenseBody = exports.validateExpenseId = void 0;
const express_validator_1 = require("express-validator");
const Expense_1 = __importDefault(require("../models/Expense"));
const validateExpenseId = async (req, res, next) => {
    await (0, express_validator_1.param)("expenseId")
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
exports.validateExpenseId = validateExpenseId;
const validateExpenseBody = async (req, res, next) => {
    await (0, express_validator_1.body)("name")
        .notEmpty().withMessage("El nombre es requerido")
        .isString().withMessage("El nombre debe ser un texto")
        .run(req);
    await (0, express_validator_1.body)("amount")
        .notEmpty().withMessage("La cantidad del gasto es requerida")
        .isNumeric().withMessage("La cantidad del gasto no es válida")
        .custom(value => value > 0).withMessage("La cantidad del gasto debe ser mayor a 0")
        .run(req);
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateExpenseBody = validateExpenseBody;
const validateExpenseExists = async (req, res, next) => {
    const { expenseId, budgetId } = req.params;
    try {
        const expense = await Expense_1.default.findByPk(expenseId);
        if (!expense || expense.budgetId != +budgetId) {
            res.status(404).json({ message: "Gasto no encontrado" });
            return;
        }
        req.expense = expense;
        next();
    }
    catch (error) {
        /* console.log(error) */
        res.status(500).json({ message: "Hubo un error" });
    }
};
exports.validateExpenseExists = validateExpenseExists;
/* export const belongToBudget = async (req: Request, res: Response, next: NextFunction) => {
    if(req.budget.id !== req.expense.budgetId){
        res.status(403).json({ message: "Acción no válida" })
        return
    }

    next()
} */ 
//# sourceMappingURL=expenseMiddleware.js.map