import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"
import Budget from "../models/Budget"

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    await param("budgetId")
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

export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
    const { budgetId } = req.params
    try {
        const budget = await Budget.findByPk(budgetId)
        if(!budget){
            res.status(404).json({ message: "Presupuesto no encontrado" })
            return
        }

        req.budget = budget
        next()
    } catch (error) {
        /* console.log(error) */
        res.status(500).json({ message: "Hubo un error" })
    }
}

export const validateBudgetBody = async (req: Request, res: Response, next: NextFunction) => {
    await body("name")
        .notEmpty().withMessage("El nombre es requerido")
        .isString().withMessage("El nombre debe ser un texto")
        .run(req)
    await body("amount")
        .notEmpty().withMessage("La cantidad del presupuesto es requerida")
        .isNumeric().withMessage("La cantidad del presupuesto no es válida")
        .custom(value => value > 0).withMessage("La cantidad del presupuesto debe ser mayor a 0")
        .run(req)

    let errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const hasAccess = (req: Request, res: Response, next: NextFunction) => {
    // ? Solo permitir ver presupuestos del usuario
    if(req.budget.userId !== req.user.id){
        res.status(401).json({ message: "No cuentas con los permisos para relizar esta acción" })
        return
    }
    next()
}