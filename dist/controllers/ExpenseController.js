"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
class ExpenseController {
    static create = async (req, res) => {
        try {
            const expense = await Expense_1.default.create(req.body);
            expense.budgetId = req.budget.id;
            await expense.save();
            res.status(201).json({ message: "Gasto creado exitosamente" });
        }
        catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static getById = async (req, res) => {
        res.status(200).json(req.expense);
    };
    static editById = async (req, res) => {
        const { expense } = req;
        try {
            await expense.update(req.body);
            res.status(200).json({ message: "Gasto actualizado exitosamente" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
    static deleteById = async (req, res) => {
        const { expense } = req;
        try {
            await expense.destroy();
            res.status(200).json({ message: "Gasto eliminado exitosamente" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: "Hubo un error" });
        }
    };
}
exports.ExpenseController = ExpenseController;
//# sourceMappingURL=ExpenseController.js.map