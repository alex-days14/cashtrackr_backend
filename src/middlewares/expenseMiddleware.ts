import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"
import Expense from "../models/Expense"

declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    await param("expenseId")
        .isInt().withMessage("ID no válido")
        .custom(value => value > 0).withMessage("ID no válido")
        .run(req)

    let errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const validateExpenseBody = async (req: Request, res: Response, next: NextFunction) => {
    await body("name")
        .notEmpty().withMessage("El nombre es requerido")
        .isString().withMessage("El nombre debe ser un texto")
        .run(req)
    await body("amount")
        .notEmpty().withMessage("La cantidad del gasto es requerida")
        .isNumeric().withMessage("La cantidad del gasto no es válida")
        .custom(value => value > 0).withMessage("La cantidad del gasto debe ser mayor a 0")
        .run(req)

    let errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    const { expenseId, budgetId } = req.params
    try {
        const expense = await Expense.findByPk(expenseId)
        if(!expense || expense.budgetId != +budgetId){
            res.status(404).json({ message: "Gasto no encontrado" })
            return
        }

        req.expense = expense
        next()
    } catch (error) {
        /* console.log(error) */
        res.status(500).json({ message: "Hubo un error" })
    }
}

/* export const belongToBudget = async (req: Request, res: Response, next: NextFunction) => {
    if(req.budget.id !== req.expense.budgetId){
        res.status(403).json({ message: "Acción no válida" })
        return
    }

    next()
} */