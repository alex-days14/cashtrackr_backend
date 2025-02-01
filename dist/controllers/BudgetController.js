"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetController = void 0;
const Budget_1 = __importDefault(require("../models/Budget"));
const Expense_1 = __importDefault(require("../models/Expense"));
class BudgetController {
    static getAllByUser = async (req, res) => {
        try {
            const budgets = await Budget_1.default.findAll({ order: [["createdAt", "DESC"]], where: { userId: req.user.id } });
            // TODO: Filtrar por usuario
            res.status(200).json(budgets);
        }
        catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al obtener presupuestos" });
        }
    };
    static create = async (req, res) => {
        try {
            const budget = await Budget_1.default.create(req.body);
            budget.userId = req.user.id;
            await budget.save();
            res.status(201).json({ message: "Presupuesto creado exitosamente" });
        }
        catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al crear presupuesto" });
        }
    };
    static getById = async (req, res) => {
        const budget = await Budget_1.default.findByPk(req.budget.id, {
            include: [Expense_1.default],
        });
        res.status(200).json(budget);
    };
    static editById = async (req, res) => {
        const { budget } = req;
        try {
            // Cambios del body
            await budget.update(req.body);
            res.status(200).json({ message: "Presupuesto editado exitosamente" });
        }
        catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al editar el presupuesto" });
        }
    };
    static deleteById = async (req, res) => {
        const { budget } = req;
        try {
            await budget.destroy();
            res.status(200).json({ message: "Presupuesto eliminado exitosamente" });
        }
        catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al eliminar el presupuesto" });
        }
    };
}
exports.BudgetController = BudgetController;
//# sourceMappingURL=BudgetController.js.map