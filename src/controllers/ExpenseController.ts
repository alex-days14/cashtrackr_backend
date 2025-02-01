import { Request, Response } from "express"
import Expense from "../models/Expense"

export class ExpenseController {

    static create =  async (req: Request, res: Response) => {
        try {
            const expense = await Expense.create(req.body)
            expense.budgetId = req.budget.id
            await expense.save()
            res.status(201).json({ message: "Gasto creado exitosamente" })
        } catch (error) {
            /* console.log(error) */
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static getById =  async (req: Request, res: Response) => {
        res.status(200).json(req.expense)
    }

    static editById =  async (req: Request, res: Response) => {
        const { expense } = req
        try {
            await expense.update(req.body)
            res.status(200).json({ message: "Gasto actualizado exitosamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }

    static deleteById =  async (req: Request, res: Response) => {
        const { expense } = req
        try {
            await expense.destroy()
            res.status(200).json({ message: "Gasto eliminado exitosamente" })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Hubo un error" })
        }
    }
}