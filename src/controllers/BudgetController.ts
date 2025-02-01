import { Request, Response } from "express"
import Budget from "../models/Budget"
import Expense from "../models/Expense"

export class BudgetController {

    static getAllByUser = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({ order: [["createdAt", "DESC"]], where: { userId: req.user.id } })
            // TODO: Filtrar por usuario
            res.status(200).json(budgets)
        } catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al obtener presupuestos" })
        }
    }

    static create = async (req: Request, res: Response) => {
        try {
            const budget = await Budget.create(req.body)
            budget.userId = req.user.id
            await budget.save()
            res.status(201).json({ message: "Presupuesto creado exitosamente" })
        } catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al crear presupuesto" })
        }
    }

    static getById = async (req: Request, res: Response) => {
        const budget = await Budget.findByPk(req.budget.id, {
            include: [Expense],
        })
        res.status(200).json(budget)
    }

    static editById = async (req: Request, res: Response) => {
        const { budget } = req
        try {
            // Cambios del body
            await budget.update(req.body)

            res.status(200).json({ message: "Presupuesto editado exitosamente" })
        } catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al editar el presupuesto" })
        }
    }

    static deleteById = async (req: Request, res: Response) => {
        const { budget } = req
        try {
            await budget.destroy()

            res.status(200).json({ message: "Presupuesto eliminado exitosamente" })
        } catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Error al eliminar el presupuesto" })
        }
    }
}